---
title: java并发系列-volatile关键字详解
date: 2019-09-29 23:14:27
categories:
  - java
tags:
  - java
  - java并发
---

java并发系列-volatile关键字详解，介绍volatile是什么、特点、应用，整篇博客即为面试题：volatile的理解。
<!-- more -->

------------
### volatile概念
**volatile**是**java**虚拟机提供的轻量级的同步机制。

#### 特性
- 保证可见性
- 不保证原子性
- 禁止指令重排

### 可见性-JMM内存模型
JMM（Java内存模型Java Memory model）本身是一种抽象的概念并不真实存在，它描述的是一组给饭或规则，通过这组规范定义了程序中各个变量的访问方式。

#### JMM规定同步
- 线程解锁前，必须把共享变量的值刷新到新的主内存
- 线程加锁前，必须读取主内存的最新的值到自己的工作内存
- 加锁解锁必须是同一把锁

##### JMM特性
- 可见性
- 原子性
- 有序性

由于JVM运行程序的实体是线程，而每个线程创建时JVM都会为其创建一个工作内存（有些地方称为栈空间），工作内存是每个线程的私有数据区域，而java内存模型中规定所有变量都储存在主内存，主内存是共享区域，所有线程都可以访问，**但线程对变量的操作（读取赋值等）必须在工作内存中进行，首先要将变量从主内存拷贝到自己的工作内存空间，然后对变量进行操作，操作完成后再将变量写回主内存。**不能直接操作主内存中的变量，各个线程中的工作内存中存储着主内存中的变量副本拷贝，因此不同的线程间无法访问对方的工作内存，线程间的通信传值必须通过主内存来完成，访问过程如下图：

<img class="avatar" src="/img/JMM.png">

volatile修饰变量，即保证了在不同线程操作这个变量时的可见性，及时通知主物理内存的值已经被修改。

### 不保证原子性
原子性指的是不可分割，完整性，也及某个线程在做某个具体业务时，中间不可以被加塞或者被分割，需要整体完整，要么同时成功，要么同时失败。

volatile不保证原子性，例如：多线程操作volatile修饰int类型变量时，在多线程每次加1的过程中，其他的线程已经改变了主物理内存中的值，导致了最终结果不正确。

#### 如何保证volatile的原子性
解决volatile的原子性，即多线程操作的最终结果正确。
##### synchronized
在更改volatile修饰的变量的方法上增加synchronized。
##### AtomicInteger
将int改成juc下的AtomicInteger类型，AtomicInteger保证了数值的原子性。

### 禁止指令重排
#### 什么是指令重排
计算机在执行程序时，为了提高性能，编译器和处理器得常常会对指令进行重排，一般分为三步：
- 编译器优化的重排
- 指令并行的重排
- 内存系统的重排

单线程环境里面确保程序最终执行结果和代码顺序执行结果一致。

处理器在进行重排序时必须要考虑指令之间的数据依赖性。

多线程环境中交替执行，由于编译器优化重排的存在，两个线程中使用的变量能否保证一致性是无法确定的，结果无法预测。

#### volatile保证指令不会重排
volatile实现禁止指令重排优化，从而避免了多线程环境下程序出现乱序执行的现象。

volatile修饰的变量，会增加内存屏障，会告诉编译器和cpu，不管什么指令都不能和这条修改volatile变量的指令重排。
- 对volatile变量进行写操作时，会在写操作后加入一条store屏障指令，将工作内存中的共享变量值刷新回主内存。
- 对volatile变量进行读操作时，会再度操作前加一条load屏障指令，从主内存中读取共享变量。

### volatile使用场景
- 工作内存与主内存同步延迟现象导致的可见性问题，可以使用synchronized或volatile解决，他们都可以使一个线程修改后的变量立即对其他线程可见。
- 对于指令重排导致的可见性和有序性问题，可以利用volatile关键字解决，volatile可以禁止重排序优化。

#### 单例模式
多线程并发的场景下，通过单例模式获取对象时，会多次执行构造方法，则无法保证单例模式只获得一个对象。

如何解决这个问题呢？

可以选择加synchronized，但是synchronized是悲观锁，只能单线程访问，会影响性能。

##### 单例模式DCL

可采用DCL（Double Check Lock）双端检锁机制
```java
public Class SingletenDemo{
	
	private static SingletenDemo instance = null;
	private SingletenDemo {
		Syetem.out.println("我是构造方法")
	}
	public static SingletenDemo getInstance(){
		if(instance==null){
			synchronized(SingletenDemo.class){
				if(instance==null){
					instance = new SingletenDemo();
				}
			}
		}
		return instance;
	}
}
```
由于存在指令重排情况，多次运行会出现问题。
##### 单例模式volatile
DCL机制不一定线程安全。

不安全的原因：
构造函数初始化对象在底层分三步执行
1. 分配对象的内存空间
2. 初始化对象
3. 设置对象指向刚分配的内存地址,此时instance！=null

由于存在指令重排，步骤2、步骤三不存在数据依赖关系，则1、3、2的优化顺序是允许的，即
1. 分配对象的内存空间
3. 设置对象指向刚分配的内存地址，此时instance=null
2. 初始化对象

<red>
所以当一条线程访问instance不为null时，由于instance未必已经初始化完成，也就造成了线程安全问题。
</red>

加入volatile可禁止指令重排:

```java
public Class SingletenDemo{
	
	private static volatile SingletenDemo instance = null;
	private SingletenDemo {
		Syetem.out.println("我是构造方法")
	}
	public static SingletenDemo getInstance(){
		if(instance==null){
			synchronized(SingletenDemo.class){
				if(instance==null){
					instance = new SingletenDemo();
				}
			}
		}
		return instance;
	}
}
```