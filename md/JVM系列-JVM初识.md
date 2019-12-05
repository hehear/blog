---
title: JVM系列-JVM初识
date: 2019-12-05 01:14:27
categories:
  - JVM
tags:
  - java
  - JVM
---

JVM系列-JVM初识，简单介绍jvm的内存结构。
<!-- more -->

------------
### JVM体系结构
java虚拟机JVM是运行在操作系统之上的，它与硬件没有直接的交互。

jvm的内存结构如图：

<img  src="/img/jvm内存结构.jpg" style="width:380px;">

#### 类装载器
类装载器ClassLoader,负责加载class文件，class文件在文件开头有特定的文件标识，并且ClassLoader只负责class 文件的加载，至于它是否可以运行，则由执行引擎Execution Engine决定。

**虚拟机自带的加载器有三种**：
1. 启动类加载器（bootstrap）C++，Bootstrap ClassLoader 加载$JAVAHOME/jre/lib/rt.jar中的类，包括Object等
1. 扩展类加载器（Extension）Java ，Extension ClassLoader 加载$JAVAHOME/jre/lib/ext/*.jar下的所有jar包中的类
1. 应用程序类加载器（App）Java，也叫系统类加载器，Sytem ClassLoader 加载$classpath当前应用下的所有自定义类

**三种加载器继承关系**：
Sytem ClassLoader 继承 Extension ClassLoader 继承 Bootstrap ClassLoader，即Bootstrap ClassLoader为父类。
自定义加载器继承Sytem ClassLoader。
sun.misc.Launcher是一个java虚拟机入口应用。

**类加载器的双亲委派机制**：某个特定的类加载器在接到加载类的请求时，首先将加载任务委托给父类加载器，依次递归，如果父类加载器无法加载此任务时，才自己加载。原因是java的沙箱机制，防止恶意代码对虚拟机攻击，保证安全性。

#### 线程私有区域
JVM线程私有区域包括：程序计数器（pc寄存器）、Java虚拟机栈（Java方法栈）、本币方法栈；
线程私有数据区域生命周期与线程相同, 依赖用户线程的启动/结束 而 创建/销毁(在 Hotspot VM 内, 每个线程都与操作系统的本地线程直接映射, 因此这部分内存区域的存/否跟随本地线程的 生/死对应)。

##### 程序计数器
一块较小的内存空间, 是当前线程所执行的字节码的行号指示器，每条线程都要有一个独立的程序计数器，这类内存也称为“线程私有”的内存。
这个内存区域是唯一一个在虚拟机中没有规定任何 OutOfMemoryError 情况的区域。

##### Java虚拟机栈
是描述 java 方法执行的内存模型，每个方法在执行的同时都会创建一个栈帧(Stack Frame) 用于存储局部变量表、操作数栈、动态链接、方法出口等信息。每一个方法从调用直至执行完成 的过程，就对应着一个栈帧在虚拟机栈中入栈到出栈的过程。
栈帧( Frame)是用来存储数据和部分过程结果的数据结构，同时也被用来处理动态链接 (Dynamic Linking)、 方法返回值和异常分派( Dispatch Exception)。栈帧随着方法调用而创建，随着方法结束而销毁——无论方法是正常完成还是异常完成(抛出了在方法内未被捕获的异 常)都算作方法结束。
jvm规范对这个区域定义了两种内存异常，**OutOfMemoryError**，**StackOverflowError**。

##### 本地方法栈
本地方法区和 Java Stack 作用类似, 区别是虚拟机栈为执行 Java 方法服务, 而本地方法栈则为 Native 方法服务。

#### 线程共享区域
JVM线程共享区域包括：Java堆，方法区；线程共享区域随虚拟机的启动/关闭而创建/销毁。

##### Java堆
创建的对象和数组都保存在 Java 堆内存中，也是垃圾收集器进行 垃圾收集的最重要的内存区域。由于现代 VM 采用分代收集算法, 因此 Java 堆从 GC 的角度还可以 细分为: 新生代(Eden 区、From Survivor 区和 To Survivor 区)和老年代。

##### JVM运行时的堆内存
Java 堆从 GC 的角度还可以细分为: 新生代(Eden 区、From Survivor 区和 To Survivor 区)和老年
代。
<img  src="/img/java堆.png" style="width:480px;">

###### 新生代
是用来存放新生的对象。一般占据堆的 1/3 空间。由于频繁创建对象，所以新生代会频繁触发
MinorGC 进行垃圾回收。新生代又分为 Eden 区、ServivorFrom、ServivorTo 三个区。

1. Eden 区：Java 新对象的出生地(如果新创建的对象占用内存很大，则直接分配到老 年代)。当 Eden 区内存不够的时候就会触发 MinorGC，对新生代区进行 一次垃圾回收。
1. ServivorFrom：上一次 GC 的幸存者，作为这一次 GC 的被扫描者。
1. 保留了一次 MinorGC 过程中的幸存者。

###### 老年代
主要存放应用程序中生命周期长的内存对象。老年代的对象比较稳定，所以 MajorGC 不会频繁执行。在进行 MajorGC 前一般都先进行 了一次 MinorGC，使得有新生代的对象晋身入老年代，导致空间不够用时才触发。当无法找到足 够大的连续空间分配给新创建的较大对象时也会提前触发一次 MajorGC 进行垃圾回收腾出空间。
当老年代也满了装不下的 时候，就会抛出 OOM(Out of Memory)异常。

##### 方法区
方法区用于存储被 JVM 加载的类信息、常量、静 态变量、即时编译器编译后的代码等数据。