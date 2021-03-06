---
title: java并发系列-CAS
date: 2020-03-18 01:14:2ß7
categories:
  - java
tags:
  - java并发

---

java并发系列-CAS，简单介绍CAS底层原理，优缺点，以及ABA问题的解决方案。
<!-- more -->

------------

### 概念
比较并交换compare and swap，是乐观锁的一种实现，属于一种无锁算法，在没有线程被阻塞的情况下实现变量的同步，也叫非阻塞同步。
CAS算法涉及的操作数：

- 需要读写的内存值V
- 进行比较的值A
- 拟写入的新值B

当前仅当V的值等于A时，CAS通过原子方式用新值B来更新V的值，否则不会执行任何操作。一般情况下时一个自旋操作，即不断的重试。

### 底层原理

Java中的CAS是由Unsafe+自旋实现的。

#### Unsafe

Unsafe是CAS的核心类，由于Java方法无法直接访问底层系统，需要通过本地native方法来访问，Unsfe相当于一个后门，基于该类可以直接操作特定内存的数据。Unsafe类在JRE的/lib/rt.jar的sun.misc包中，其内部方法操作可以像C的指针一样直接操作内存，因为Java中的CAS操作的执行依赖于Unsafe类的方法。

CAS并发原语体现在Java语言中就是sun.misc.Unsafe类中的各个方法。调用Unsafe类中的CAS方法，JVM会帮我们实现出CAS汇编指令。这是一只完全依赖于硬件的功能，通过它实现原子操作。

CAS是一种系统CPU原语，原语属于操作系统用语范畴，原语的执行必须是连续的，执行过程中不允许打断，也就是说CAS是一条CPU的原子指令，不会造成数据不一致问题。

#### 自旋

Unsafe方法实现CAS时，比较并交换时，用了do while不断循环重试，知道预期值和主内存中的比较值相同时，才将要交换值写入主内存。

### 缺点

#### 循环时间长开销大

如果CAS失败，会一直进行尝试，可能会给CPU带来很大的开销。如果JVM能支持处理器提供的pause指令效率有一定的提升。

#### 只能保证一个共享原子操作

CAS只能保证一个共享变量有效，当操作多个共享变量时CAS无效，JDK1.5开始，提供了AtomicReference类来保证引用对象之间的原子性，可以把多个变量封装到对象中进行CAS操作。

#### ABA问题

如果线程1初次读取变量V的时候值是A,在准备赋值期间，线程2将V的值改为了B，线程3将V的值又改回了A，此时线程1开始检查变量V的值，CAS操作就会误认为它从来没有改变，这个问题就是ABA问题。

解决ABA问题：利用时间戳的原子引用解决ABA问题，每次修改增加相应的版本号，比较值的同时也比较相应的版本号即可，JDK1.5的AtomicStampedReference类的compareAndSet提供了这种实现。