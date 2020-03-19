---
title: java并发系列-synchronized关键字
date: 2020-03-18 01:14:2ß7
categories:
  - java
tags:
  - java并发

---

java并发系列-synchronized关键字，简单介绍java并发关键字底层实现，及代码中的应用。
<!-- more -->

------------

### 概念

synchronized关键字解决的多个线程访问资源的同步性，synchronized关键字可以保证它修饰的方法或者代码块在任意时刻只能有一个线程执行。

在Java早期版本，synchronized属于重量级锁，效率低下，因为监视器锁monitor是依赖于底层的操作系统的Mutex Lock来实现的，Java线程是映射到操作系统的原生线程之上的。如果要挂起或者唤醒一个线程，都需要操作系统帮忙完成，而操作系统实现线程之间的切换时，需要从用户态转为内核态，这个状态之间的转换需要相对较长的时间，时间成本较高，这也是早期的synchronized效率低的原因。

在JDK1.6之后，Java官方对JVM层面对synchronized较大的优化，在synchronized锁效率方面也优化的不错，对锁的实现引入了大量的优化，如自旋锁、适应性自旋锁、锁消除、锁粗化、偏向锁、轻量级锁等技术来减少锁操作的开销。

### 底层原理

synchronized关键字底层原理属于JVM层面。通过JDK自带的javap命令查看相关字节码信息。

#### synchronized修饰语句块

synchronized同步语句块的实现使用的是monitorrenter和monitorexit指令，其中monitorrenter指令指向同步代码块的开始位置，monitorexit指令指向同步代码块的结束位置。

当执行monitorrenter指令时，线程试图获取锁也就是获取monitor（monitor对象存在于每个Java对象的对象头中，synchronized锁便是通过这种方式获取锁的，也是为什么Java中任意对象可以作为锁的原因）的持有权。当计数器为0则可以成功获取，获取后将锁计数器设为1也就是加1。相应的在执行monitorexit指令时，将锁计数器设为0，表明锁被释放，如果获取对象锁失败，那当前线程就要被阻塞等待，直到锁被另一个线程释放为止。

#### synchronized修饰方法

synchronized修饰方法并没有monitorrenter和monitorexit指令，而是使用ACC_AYNCHRONIZED 标识，该标识指明了该方法是一个同步方法，JVM通过该ACC_AYNCHRONIZED 标识来辨别一个方法是否声明为同步方法，从而执行相应的同步调用。

### 应用

synchronizad关键字主要有三种方式使用：修饰实例方法、修饰静态方法、修饰代码块。

#### 修饰实例方法

作用于当前对象实例加锁，进入同步代码前需要获得当前对象实例的锁

#### 修饰静态方法

也就是给当前类加锁，会作用于类的所有对象实例，因为静态成员不属于任何一个对象实例，是类成员（staic表明该类的一个静态资源，不管new了多少实例，只有一份）。所以如果一个线程A调用一个实例对象的非静态方法，而线程B需要调用这个实现对象所属类的静态synchronizad方法，是允许的，不会发生互斥现象。

因为访问静态synchronizad方法占用的资源时当前类的锁，而访问的非静态synchronizad方法占用的锁是当前实例对象锁。

#### 修饰代码块

指定加锁对象，对给定对象加锁，进入同步代码块前要获得给定对象的锁。

synchronizad关键字加到static静态方法和synchronizad(Class)代码块上都是给class类上锁。synchronizad关键字加到实例方法上是给对象实例上锁。尽量不要使用synchronizad(String s),因为JVM字符串常量池具有缓存功能。

#### 实现单例模式

使用volatile、synchronizad实现双重校验锁的单例模式：

```java
public class Singleton {

    private volatile static Singleton uniqueInstance;

    private Singleton() {
    }

    public static Singleton getUniqueInstance() {
       //先判断对象是否已经实例过，没有实例化过才进入加锁代码
        if (uniqueInstance == null) {
            //类对象加锁
            synchronized (Singleton.class) {
                if (uniqueInstance == null) {
                    uniqueInstance = new Singleton();
                }
            }
        }
        return uniqueInstance;
    }
}
```

使用volatile可以禁止JVM的指令重排，保证多线程环境下可以正常进行。

### 与ReentrantLock区别

相比synchronized，ReentrantLock增加了一些高级功能，主要有三点：

- **等待可中断**：ReentrantLock提供了一种能够中断等待锁的线程机制，通过lock.lockinterruptibly()来实现这个机制，也就是说正在等待的线程可以选择放弃等待改为处理其他事情
- **可实现公平锁**：ReentrantLock可以指定公平锁还是非公平锁，而synchronized只能是非公平锁。所谓的公平说就是先等待的先获得锁，ReentrantLock默认情况是非公平的，可以通过ReentrantLock类的ReentrantLock(boolean fair)构造方法来指定是否是公平的。
- **可实现选择性通知**（锁可以绑定多个条件）：
  1. synchronized关键字与wait()和notify()、notifyAll()方法结合可以实现等待/通知机制。
  2. ReentrantLock需要借助与Condition接口与newCondition()方法。Condition是jdk1.5之后才有的，它具有很多灵活性，比如可以实现多路通知功能也就是一个Lock对象可以创建多个Condition对象。线程对象可以注册在指定的Condition中，从而可以有选择性的进行线程通知，在调度线程上更加灵活。
  3. synchronized关键字相当于整个Lock对象就只有一个Condition对象，所有的线程都注册在它一个身上，而ReentrantLock可获得多个Condition对象可以做到选择性通知。



