---
title: java并发系列-线程初识
date: 2020-04-01 01:14:2ß7
categories:
  - java
tags:
  - java并发

---

java并发系列-线程初识，简单介绍什么是线程，与进程区别，以及线程实现及生命周期。
<!-- more -->

------------

### 线程与进程

#### 什么是进程

进程是程序的一次执行过程，是系统运行程序的基本单位，因此进程是动态的。系统运行一个程序即是 **一个进程从创建、运行到消亡的过程。**

在Java中，当我们启动main函数时其实就是启动了一个JVM进程，而main函数所在的线程就是进程中的一个线程，也称主线程。

#### 什么是线程

线程与进程相似，但线程是一个比进程更小的执行单位。一个进程在其执行的过程中，可以产生多个线程。

与进程不同的是同类的多个线程可以共享进程的 **堆和方法区**，但是没个线程都有自己线程私有的 **程序计数器、虚拟机栈、本地方法栈**，所以系统在产生一个线程，或是在各个线程之间做切换工作时，负担要比进程小的多，也正是因为如此，线程也被称为轻量级进程。

Java程序天生就是多线程程序，我们可以通过JMX来看一个普通的java程序有哪些线程：

```java
public class MultiThread {
	public static void main(String[] args) {
		// 获取 Java 线程管理 MXBean
	ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
		// 不需要获取同步的 monitor 和 synchronizer 信息，仅获取线程和线程堆栈信息
		ThreadInfo[] threadInfos = threadMXBean.dumpAllThreads(false, false);
		// 遍历线程信息，仅打印线程 ID 和线程名称信息
		for (ThreadInfo threadInfo : threadInfos) {
			System.out.println("[" + threadInfo.getThreadId() + "] " + threadInfo.getThreadName());
		}
	}
}
```

```java
[5] Attach Listener //添加事件
[4] Signal Dispatcher // 分发处理给 JVM 信号的线程
[3] Finalizer //调用对象 finalize 方法的线程
[2] Reference Handler //清除 reference 线程
[1] main //main 线程,程序入口
```

从输出内容可以看出：一个Java程序的运行是main线程和多个其他线程同时运行的。

#### 线程与进程的关系

一个进程中可以有多个线程，多个线程共享进程中的堆和方法区资源，但是每个线程有自己私有的程序计数器、虚拟机栈、本地方法栈。

线程是进程划分成的更小的运行单位。线程和进程最大的不同在于基本上的各进程是独立的，而各线程则不一定，因为同一进程中的线程极有可能会相互影响，线程执行开销小，但不利于资源的管理和保护。

#### 线程共享区域和私有区域

##### 程序计数器

程序计数器作用：

- 字节码解释器通过改变程序计数器来依次读取指令，从而实现代码的流程控制，如：顺序执行、选择、循环、异常处理。
- 多线程的情况下，程序计数器用于记录当前线程的执行位置，从而当线程被切换回来的时候能够知道该线程上次运行到哪儿了。

当执行native方法时，程序计数器记录的是undefined地址，只有执行的是Java代码时，计数器记录的才是下一条指令的地址。

**程序计数器私有主要是为了线程切换后能恢复到正确的执行位置。**

##### 虚拟机栈和本地方法栈

**虚拟机栈**：每个Java方法在执行的同时，会创建一个栈帧用于存储 **局部变量表、操作数栈、常量池引用**等信息。从方法调用直至执行完成的过程，就对应着一个栈帧在Java虚拟机栈里从入栈到出栈的过程。

**本地方法栈：**和虚拟机栈所发挥的作用非常相似，区别是：**虚拟机栈为虚拟机执行Java方法服务，而本地方法栈则为虚拟机使用的Native方法服务。**在Hotspot虚拟机中Java虚拟机栈和本地方法栈合二为一。

所以，虚拟机栈和本地方法栈线程私有，**是为了保证线程中局部变量不被别的线程访问到。**

##### 堆和方法区

堆和方法区市所有线程共享的资源，其中堆是进程中最大的一块内存，主要用于存放新创建的对象，所有的对象都在这里分配内存。

方法区主要用于存放已被加载的类信息、常量、静态变量、即时编译后的代码等信息。

### 线程的生命周期

Java线程在运行的生命周期有6种状态：

| 状态名称     | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| NEW          | 初始状态，线程被构建，但是还没有调用start()方法              |
| RUNNABLE     | 运行状态，Java线程将操作系统中的就绪和运行两种状态笼统的称做“运行中” |
| BLOCKED      | 阻塞状态，表示线程阻塞于锁中                                 |
| WAITING      | 等待状态，表示线程进入等待状态，进入该状态表示当前线程需要等待其他线程作出了一些特定动作(通知或中断) |
| TIME_WAITING | 超时等待状态，该状态不同于WAITING，他是可以在指定的时间自行返回的 |
| TERMINATED   | 终止状态，表示当前线程已经执行完毕                           |

<img class="avatar" src="/img/threadlife.jpg">

线程创建之后它将处于NEW(新建)状态，调用start()方法后开始运行，线程这时候处于READY(可运行)状态。可运行状态的线程获得了CPU的时间片，后就处于RUNNING(运行)状态。

操作系统隐藏Java虚拟机中RUNNABLE和RUNNING状态，只能看到RUNNABLE状态，所以Java系统一般将这两个状态通称为RUNNABLE(运行中)状态。

当线程执行wait()方法之后，线程进入WAITING(等待)状态。进入等待状态的线程需要其他线程的通知，才能够返回到运行状态。

TIME_WAITING(超时等待)状态相当于在等待状态的基础上，增加了超时限制，比如通过sleep(long millis)方法或wait(long millis)方法，可以将Java线程置于TIMED WAITING状态。当超时时间到达后，Java线程将会返回到RUNNABLE状态。当线程调用同步方法时，在没有获取到锁的情况下，线程将会进入到BLOCK(阻塞)状态。线程在执行Runnable的run()方法之后将会进入到TERMINATED(终止)状态。

#### 上下文切换

多线程中一般线程的个数都大于CPU核心的个数，而一个CPU核心在任意时刻只能被一个线程使用，为了让这些线程都能得到有效的执行。CPU采取的策略是为每个线程分配时间片并轮转的形式。当一个线程的时间片用完的时候就会重新处于就绪状态让给其他线程使用，这个过程就属于一次上下文切换。

概括说来：当前任务在执行完CPU时间片切换到另一个任务之前会先保存自己的状态，以便下次再切换回这个任务时，可以在加载这个任务的状态，**任务从保存到在加载的过程就是一次上下文的切换。**

Linux相比其他操作系统，其上下文切换和模式切换的时间消耗非常少。

### 线程使用

有三个使用线程的方法：

- 实现Runnable接口
- 实现Callable接口
- 继承Thread类

实现Runnable和Callable接口的类只能当做一个可以在线程中运行的任务，不是真正的线程，因此最后还需要通过Thread来调用。可以理解为任务时通过线程驱动而执行的。

#### Runnable

实现Runnable接口，需要实现接口中的run()方法：

```java
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        // ...
    }
}
```

使用Runnable实例时需要创建一个Thread实例，然后调用Thread实例的start()方法启动线程。

```java
public static void main(String[] args) {
    MyRunnable instance = new MyRunnable();
    Thread thread = new Thread(instance);
    thread.start();
}
```

#### Callable

与Runnable相比，Callable可以有返回值，返回值通过FutureTask进行封装。

```java
public class MyCallable implements Callable<Integer> {
    public Integer call() {
        return 123;
    }
}
```

通过Thread启动线程：

```java
public static void main(String[] args) throws ExecutionException, InterruptedException {
    MyCallable mc = new MyCallable();
    FutureTask<Integer> ft = new FutureTask<>(mc);
    Thread thread = new Thread(ft);
    thread.start();
    System.out.println(ft.get());
}
```

#### Thread

继承Thread，同样也是需要实现run()方法，因为Thread类也实现了Runnable接口，当调用start()方法启动一个线程时，虚拟机会将线程放入就绪队列中等待被调度，当一个线程被调度时会执行该线程的run()方法。

```java
public class MyThread extends Thread {
    public void run() {
        // ...
    }
}
```

```java
public static void main(String[] args) {
    MyThread mt = new MyThread();
    mt.start();
}
```

实现接口与继承Thread类相比，实现接口更好，更灵活一些：

- Java不支持多重继承，因此继承了Thread类就无法继承其他的类，但是可以实现多个接口。
- 类可能只要求可执行就可以，继承整个Thread类开销过大。

### 线程的操作

#### Daemon

守护线程是程序运行时在后台提供服务的线程，比如垃圾回收线程就是一种守护线程，守护线程不是程序中不可或缺的。当所有的非守护线程结束时，程序也就终止了，同时会杀死所有守护线程。

将线程转换为守护线程，可以通过Thread对象调用setDaemon(true)方法来实现。

```java
public static void main(String[] args) {
    Thread thread = new Thread(new MyRunnable());
    thread.setDaemon(true);
}
```

#### Sleep

Thread.sleep(millisec)方法会休眠当前正在执行的线程，millisec单位为毫秒。sleep()可能会抛出InterruptedException，因为异常不能垮线程返回main(),因此必须在本地处理。线程中抛出的其他异常也同样需要在本地处理。

```java
public void run() {
    try {
        Thread.sleep(3000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
}
```

#### yield

对静态方法Thread.yield()的调用声明了当前线程，已经完成了生命周期中最重要的部分，可以切换给其他线程来执行。该方法只是对线程调度器的一个建议，而且也只是建议具有相同优先级的其他线程可以运行。

```java
public void run() {
    Thread.yield();
}
```

#### interrupt

通过调用Thread.interrupt()来中断线程，如果该线程处于阻塞、等待或者无限期等待状态，就会抛出InterruptedException，从而提前结束该线程。但是不能中断I/O阻塞和synchronized锁阻塞。

```java
public class InterruptExample {

    private static class MyThread1 extends Thread {
        @Override
        public void run() {
            try {
                Thread.sleep(2000);
                System.out.println("Thread run");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
}
public static void main(String[] args) throws InterruptedException {
    Thread thread1 = new MyThread1();
    thread1.start();
    thread1.interrupt();
    System.out.println("Main run");
}
```

```java
Main run
java.lang.InterruptedException: sleep interrupted
    at java.lang.Thread.sleep(Native Method)
    at InterruptExample.lambda$main$0(InterruptExample.java:5)
    at InterruptExample$$Lambda$1/713338599.run(Unknown Source)
    at java.lang.Thread.run(Thread.java:745)
```

如果一个线程的run()方法执行一个无限循环，并且没有执行sleep方法等会抛出InterruptedException的操作，那么调用线程的interrupt()方法就会无法使线程提前结束。

但是调用interrupt()方法会设置线程的中断标记，此时调用interrupted()方法，会返回该线程是否处于中断状态，从而提前结束线程。

```java
public class InterruptExample {

    private static class MyThread2 extends Thread {
        @Override
        public void run() {
            while (!interrupted()) {
                // ..
            }
            System.out.println("Thread end");
        }
    }
}
public static void main(String[] args) throws InterruptedException {
    Thread thread2 = new MyThread2();
    thread2.start();
    thread2.interrupt();
}
```

```java
Thread end
```

#### join

在线程中调用另一个线程的join()方法，会将当前线程挂起，等到加入的线程结束，线程继续运行。

```java
public class JoinExample {

    private class A extends Thread {
        @Override
        public void run() {
            System.out.println("A");
        }
    }

    private class B extends Thread {

        private A a;

        B(A a) {
            this.a = a;
        }

        @Override
        public void run() {
            try {
                a.join();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("B");
        }
    }

    public void test() {
        A a = new A();
        B b = new B(a);
        b.start();
        a.start();
    }
}
public static void main(String[] args) {
    JoinExample example = new JoinExample();
    example.test();
}
```

```java
A
B
```

#### wait、notify、notifyAll

调用wait()使得线程等待某个条件满足时继续，线程在等待时会被挂起，当其他线程的运行满足这个条件时，其他线程会调用notify()或者notifyAll()来唤醒挂起的线程。

wait、notify、notifyAll属于Object的一部分，不属于Thread。只能在同步方法或者同步控制块中使用，否则会在运行时抛出IllegalMonitorStateException.

使用wait()挂起期间，线程会释放锁，因为如果没有释放锁，那么其他线程无法进入对象的同步方法或者同步控制块中，就无法执行notify()或者notifyAll()来唤醒挂起的线程，造成死锁。

```java
public class WaitNotifyExample {

    public synchronized void before() {
        System.out.println("before");
        notifyAll();
    }

    public synchronized void after() {
        try {
            wait();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("after");
    }
}
```

```java
public static void main(String[] args) {
    ExecutorService executorService = Executors.newCachedThreadPool();
    WaitNotifyExample example = new WaitNotifyExample();
    executorService.execute(() -> example.after());
    executorService.execute(() -> example.before());
}
```

```java
before
after
```

wait()和sleep()区别：

- wait()是Object的方法，而sleep()是Thread的静态方法
- wait()会释放锁，sleep()不会释放锁

#### await、signal、signalAll

java.util.concurrent类库中提供了condition类来实现线程之间的协调，可以在Condition上调用await()方法使线程等待，其他线程调用signal()、signalAll()方法唤醒等待的线程。

相比于wait()的等待方式，await()可以指定等待条件，因此更加灵活。使用Lock可以获得Condition对象。

```java
public class AwaitSignalExample {

    private Lock lock = new ReentrantLock();
    private Condition condition = lock.newCondition();

    public void before() {
        lock.lock();
        try {
            System.out.println("before");
            condition.signalAll();
        } finally {
            lock.unlock();
        }
    }

    public void after() {
        lock.lock();
        try {
            condition.await();
            System.out.println("after");
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}
```

```java
public static void main(String[] args) {
    ExecutorService executorService = Executors.newCachedThreadPool();
    AwaitSignalExample example = new AwaitSignalExample();
    executorService.execute(() -> example.after());
    executorService.execute(() -> example.before());
}
```

```java
before
after
```

