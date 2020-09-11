---
title: java并发系列-AQS
date: 2020-08-09 01:14:27
categories:
  - java
tags:
  - java
  - java并发

---

java并发系列-AQS。简单介绍JUC包下的AQS类，以及AQS的原理，基于AQS自定义锁的实现。
<!-- more -->

------------

### AQS简介

在讲AQS之前，首先我们了解下什么是juc：juc其实就是java.util.concurrent 包的缩写。jdk下所有相关并发的源代码都在juc下。而AQS是juc的locks包下的AbstractQueuedSynchronizer类的简称。

AQS是一个用来构建锁和同步器的框架，使用AQS能简单且高效地构造出广泛的大量的同步器，比如我们常用的ReentrantLock、semaphore、RenntrantReadWriteLock、SychronousQueue等都是基于AQS的，当然我们也可以利用AQS非常轻松的构造出符合我们自己需求的同步器。

### AQS原理

**AQS核心思想是，如果被请求的共享资源空闲，则将当前请求资源的线程设置为有效的工作线程，并且将共享资源设置为锁定状态；如果被请求的共享资源被占用，那么就需要一套线程阻塞等待以及被唤醒时锁分配的机制，这个机制AQS是用CLH队列锁实现的，即将暂时获取不到锁的线程加入到队列中。**

CLH队列是一个虚拟的双向队列，虚拟的双向队列即不存在队列实例，仅存在节点之间的关联关系。AQS是将每条请求共享资源的线程封装成一个CLH锁队列的一个节点Node来实现锁的分配。

AQS原理图：

<img class="avatar" src="/img/aqs.png">

AQS 中维护了一个 volitile int state(代表共享资源)和一个FIFO线程等待队列，多线程争用资源被阻塞时，会进入此队列。

这里volatile能保证多线程下的可见性，当state=1则代表当前对象锁已经被占有，其他线程来加锁时则会失败，加锁失败的线程，就会被放入一个FIFO的等待队列中，队列会被UNSAVE.park()操作挂起，等待其他获取锁的线程释放锁才能够被唤醒。

另外state的操作都是通过CAS来保证其并发修改的安全性。操作方法：getState,setState,compareAndSetState进行操作

```java
//返回同步状态的当前值
protected final int getState() {
        return state;
}
 // 设置同步状态的值
protected final void setState(int newState) {
        state = newState;
}
//原子地（CAS操作）将同步状态值设置为给定值update如果当前同步状态的值等于expect（期望值）
protected final boolean compareAndSetState(int expect, int update) {
        return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
}
```

### AQS资源占有方式

#### Exclusive独占

只有一个线程能执行，如RenntrantLock。又可分为公平锁和非公平锁，ReentrantLock同时支持两种锁。

- 公平锁：按照线程在队列中的排序顺序，先到者先拿到锁
- 非公平锁：当线程获取锁时，先通过两次CAS操作去抢锁，如果没有抢到，当前线程在加入到地恶劣中等待唤醒。

查看ReentrantLock源代码，对公平锁和非公平锁的实现。ReentrantLock默认采用非公平锁，通过传入的boolean来决定是否要用公平锁，true代表使用公平锁。

```java
/** Synchronizer providing all implementation mechanics */
private final Sync sync;
public ReentrantLock() {
    // 默认非公平锁
    sync = new NonfairSync();
}
public ReentrantLock(boolean fair) {
    sync = fair ? new FairSync() : new NonfairSync();
}
```

ReentrantLock中公平锁lock方法

```java
static final class FairSync extends Sync {
    final void lock() {
        acquire(1);
    }
    // AbstractQueuedSynchronizer.acquire(int arg)
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
    protected final boolean tryAcquire(int acquires) {
        final Thread current = Thread.currentThread();
        int c = getState();
        if (c == 0) {
            // 1. 和非公平锁相比，这里多了一个判断：是否有线程在等待
            if (!hasQueuedPredecessors() &&
                compareAndSetState(0, acquires)) {
                setExclusiveOwnerThread(current);
                return true;
            }
        }
        else if (current == getExclusiveOwnerThread()) {
            int nextc = c + acquires;
            if (nextc < 0)
                throw new Error("Maximum lock count exceeded");
            setState(nextc);
            return true;
        }
        return false;
    }
}
```

非公平锁的lock方法

```java
static final class NonfairSync extends Sync {
    final void lock() {
        // 2. 和公平锁相比，这里会直接先进行一次CAS，成功就返回了
        if (compareAndSetState(0, 1))
            setExclusiveOwnerThread(Thread.currentThread());
        else
            acquire(1);
    }
    // AbstractQueuedSynchronizer.acquire(int arg)
    public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
    }
    protected final boolean tryAcquire(int acquires) {
        return nonfairTryAcquire(acquires);
    }
}
/**
 * Performs non-fair tryLock.  tryAcquire is implemented in
 * subclasses, but both need nonfair try for trylock method.
 */
final boolean nonfairTryAcquire(int acquires) {
    final Thread current = Thread.currentThread();
    int c = getState();
    if (c == 0) {
        // 这里没有对阻塞队列进行判断
        if (compareAndSetState(0, acquires)) {
            setExclusiveOwnerThread(current);
            return true;
        }
    }
    else if (current == getExclusiveOwnerThread()) {
        int nextc = c + acquires;
        if (nextc < 0) // overflow
            throw new Error("Maximum lock count exceeded");
        setState(nextc);
        return true;
    }
    return false;
}                                                                                                                                 
```

#### Share共享

多个线程可成功获取资源并执行，如Semaphore、CountDownLatch等。

### 根据AQS实现锁

使用者继承AbstractQueuedSynchronizer，并重写指定的方法。这些重写方法很简单，无非是对于共享资源state的获取和释放。

将AQS组合在自定义同步组件的实现中，并调用其模板方法，而这些模板方法会调用使用者重写的方法：

```java
isHeldExclusively()//该线程是否正在独占资源。只有用到condition才需要去实现它。
tryAcquire(int)//独占方式。尝试获取资源，成功则返回true，失败则返回false。
tryRelease(int)//独占方式。尝试释放资源，成功则返回true，失败则返回false。
tryAcquireShared(int)//共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。
tryReleaseShared(int)//共享方式。尝试释放资源，成功则返回true，失败则返回false。
```

默认情况下每个方法都抛出UnsupportedOperationException。这些方法的实现必须是内部线程安全的，并且通常应该简短而不是阻塞。AQS类中的其他方法都是final的，所以无法被其他类使用，只有这几个方法可以被其他类使用。

#### 自定义同步器

```java
package juc;

import java.util.concurrent.locks.AbstractQueuedSynchronizer;

public class Mutex implements java.io.Serializable {
    //静态内部类，继承AQS
    private static class Sync extends AbstractQueuedSynchronizer {
        //是否处于占用状态
        protected boolean isHeldExclusively() {
            return getState() == 1;
        }
        //当状态为0的时候获取锁，CAS操作成功，则state状态为1，
        public boolean tryAcquire(int acquires) {
            if (compareAndSetState(0, 1)) {
                setExclusiveOwnerThread(Thread.currentThread());
                return true;
            }
            return false;
        }
        //释放锁，将同步状态置为0
        protected boolean tryRelease(int releases) {
            if (getState() == 0) throw new IllegalMonitorStateException();
            setExclusiveOwnerThread(null);
            setState(0);
            return true;
        }
    }
        //同步对象完成一系列复杂的操作，我们仅需指向它即可
        private final Sync sync = new Sync();
        //加锁操作，代理到acquire（模板方法）上就行，acquire会调用我们重写的tryAcquire方法
        public void lock() {
            sync.acquire(1);
        }
        public boolean tryLock() {
            return sync.tryAcquire(1);
        }
        //释放锁，代理到release（模板方法）上就行，release会调用我们重写的tryRelease方法。
        public void unlock() {
            sync.release(1);
        }
        public boolean isLocked() {
            return sync.isHeldExclusively();
        }
}
```

#### 测试同步器

```java


 package juc;
  
 import java.util.concurrent.CyclicBarrier;
  

 public class TestMutex {
     private static CyclicBarrier barrier = new CyclicBarrier(31);
     private static int a = 0;
     private static  Mutex mutex = new Mutex();
 
     public static void main(String []args) throws Exception {
         //说明:我们启用30个线程，每个线程对i自加10000次，同步正常的话，最终结果应为300000；
         //未加锁前
         for(int i=0;i<30;i++){
             Thread t = new Thread(new Runnable() {
                 @Override
                 public void run() {
                     for(int i=0;i<10000;i++){
                         increment1();//没有同步措施的a++；
                     }
                     try {
                         barrier.await();//等30个线程累加完毕
                    } catch (Exception e) {
                         e.printStackTrace();
                     }
                 }
             });
             t.start();
         }
         barrier.await();
         System.out.println("加锁前，a="+a);
         //加锁后
         barrier.reset();//重置CyclicBarrier
         a=0;
         for(int i=0;i<30;i++){
             new Thread(new Runnable() {
                 @Override
                 public void run() {
                     for(int i=0;i<10000;i++){
                         increment2();//a++采用Mutex进行同步处理
                     }
                     try {
                         barrier.await();//等30个线程累加完毕
                     } catch (Exception e) {
                         e.printStackTrace();
                     }
                 }
             }).start();
         }
         barrier.await();
         System.out.println("加锁后，a="+a);
     }
     /**
      * 没有同步措施的a++
      * @return
      */
     public static void increment1(){
         a++;
     }
     /**
      * 使用自定义的Mutex进行同步处理的a++
      */
     public static void increment2(){
         mutex.lock();
         a++;
         mutex.unlock();
     }
 }

```

测试结果：

```java
加锁前，a=279204
加锁后，a=300000
```

