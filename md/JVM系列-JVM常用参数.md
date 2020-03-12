---

title: JVM系列-JVM常用参数

date: 2020-03-11 01:14:27

categories:

  - JVM

tags:

  - JVM

---

 JVM系列-JVM常用参数，盘点在工作中经常使用的查询、调优命令及参数设置。

<!-- more -->

------------

### 查询命令

查询JVM参数的默认值指令为：

```shell
# 盘点JVM初始默认值
java -XX:+PrintFlagsInitial

# 盘点修改过的JVM参数值
java -XX:+PrintFlagsFinal  

# 盘点命令行参数，可以查看所用的垃圾回收器
java -XX:+PrintCommandLineFlags
```

查询某个参数的设置值

```shell
# 首先先查询正在运行的java进程
jps -l
# 然后查询该进程下某个参数的设置信息
jinfo -flag PrintGCDetails 13632
# 查询所有参数的值
jinfo -flags 13632
```

### 标配参数

标配参数是一些基本的JVM命令，就是在JDK的各个版本中都为变化的基础参数。

```shell
# 版本
-version
# 帮助
- version
# 展示版本
- showversion
```

### X参数

X参数主要是设置JVM的编译模式

```shell
# 解释执行
-Xint
# 第一次使用就变易成本地class文件
-Xcomp
# 混合模式，先变易后执行默认模式
-Xmixed
```

### XX参数

XX参数又分为Boolean类型参数、KV设值参数。

#### Boolean类型

参数格式为：**-XX:+参数**  或者   **-XX:-参数**

“+”表示开启，“-”表示关闭，常用的Boolean类型参数有：

```shell
# 是否打印GC垃圾回收细节
-XX:+PrintGCDetails 
# 打印GC耗时
-XX:+PrintGCDateStamps
# 查看信息中=的参数是初始的，:=是人为修改过的参数值
```

##### 回收器参数

| 参数                    | 描述                                                         |
| ----------------------- | ------------------------------------------------------------ |
| -XX:+UseSerialGC        | 串行，Young区和Old区都使用串行，使用复制算法回收，逻辑简单高效 |
| -XX:+UseParallelGC      | 并行，Young区：使用Parallel scavenge回收算法，会产生多个线程并行回收，通过-XX:oarallelGCThreads=n参数指定有线程数，默认是cpu核数，Old区单线程 |
| -XX:+UseParallelOldGC   | 并行，和UseParallelGC一样，Young区和Old区的垃圾回收时都使用多线程收集 |
| -XX:+UseConcMarkSweepGC | CMS并发，短暂停顿的并发的收集，Young区：可以使用普通或者parallel垃圾回收算法，由参数-XX+UseParNewGC来控制；Old区：只能使用CMS |
| -XX:+UseG1GC            | 并行、并发和增量式压缩短暂停顿的垃圾收集器。不区分Young区和Old区空间，它把堆空间划分为多个大小相等的区域，当进行垃圾收集时，它会有限收集存活对象较少的区域。 |

#### KV设值类型

参数格式为：**-XX:属性key=属性value**

#### 堆参数

| 参数                     | 描述                                                         |
| ------------------------ | ------------------------------------------------------------ |
| -Xms                     | 等价于 -XX:InitialHeapSize  初始堆内存                       |
| -Xmx                     | 等价于 -XX:MaxHeapSize  最大堆内存                           |
| -Xmn                     | 设置年轻代的空间大小，剩下的为老年代空间大小                 |
| -Xss                     | 等价于-XX:ThreadStackSize  设置单个线程栈的大小 一般默认1024k，依赖系统，不同系统初始值不同，windows依赖虚拟机内存，可能为0 |
| -XX:PermGen              | 设置永久代初始大小，JDK1.8废弃了永久代，变为元空间           |
| -XX:MaxPermGen           | 设置永久代最大值                                             |
| -XX:MetaspaceSize        | 设置元空间大小，元空间的本质和永久代类似，都是对JVM规范中的方法区的实现，不过元空间与永久代最大的区别在于：元空间不在虚拟机中，二十在使用本地的内存，因此，默认情况下，元空间的大小仅受本地内存的限制。 |
| -XX:SurvivorRadio        | 设置Eden区和Survivor区的空间比例，Eden/s0=Eden/s1 ，默认8    |
| -XX:NewRadio             | 设置老年代和年轻代的比例大小默认是2                          |
| -XX:MaxTenuringThreshold | 设置回收的年龄代                                             |

java代码查看虚拟机内存：

```java
long totalMemory = Runtime.getRunTime().totalMemory();//返回java虚拟机的内存总量
long maxMemory = Runtime.getRuntime().maxMemory();//返回java虚拟机最大内存量
System.out.println("TOTAL_MEMORY(-xms)"+totalMemory +"字节"+(totalMemory/(Doble)1024/1024+"MB" );
System.out.println("MAX_MEMORY(-xmx)"+maxMemory +"字节"+(maxMemory /(Doble)1024/1024+"MB" );
```

### GC调优

#### GC调优原则

多数的Java应用不需要在服务器上进行GC优化，多数导致GC问题的Java应用都不是参数设置错误，而是代码问题；在应用上线之前，先考虑将机器的JVM参数设置到最优；减少创建对象的数量；减少使用全局变量和大对象；GC优化是到最后不得已才采用的手段，在实际使用中，分析GC情况优化代码比优化GC参数要多的多。

#### GC调优目的

将转移到老年代的对象数量降低到最小；减少GC的执行时间。

#### GC调优策略

- 策略1:将新对象预留在新生代，由于Full GC的成本远高于Minor GC，因此尽可能将对象分配在新生代是明智的做法，实际项目中根据GC日志分析新生代空间大小分配是否合理，适当通过“-Xmn”命令调节新生代大小，最大限度降低新对象直接进入老年代的情况。

- 策略2:大对象进入老年代，大部分情况下，将对象分配在新生代是合理的，但是对于大对象这种做法是不好的。大对象如果首次在新生代分配，kennel会出现空间不足导致很多年龄不够的小对象被分配到老年代，破坏新生代的对象结构，可能会出现频繁的Full GC。因此对于大对象，可以设置进入老年代。`-XX:PretenureSizeThreshold` 可以设置直接进入老年代的对象大小。

- 策略3:合理设置进入老年代的年龄，`-XX:MaxTenuringThreshold` 设置对象进入老年代的年龄大小，减少老年代的内存占用，降低 full gc 发生的频率。

- 策略4:设置稳定达堆大小，堆大小设置有两个参数：`-Xms` 初始化堆大小，`-Xmx` 最大堆大小。

- 策略5:如果满足下面的指标则不需要进行GC优化

  MinorGC 执行时间不到50ms； Minor GC 执行不频繁，约10秒一次； Full GC 执行时间不到1s； Full GC 执行频率不算频繁，不低于10分钟1次。