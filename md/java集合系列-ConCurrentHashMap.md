---
title: java集合系列-ConCurrentHashMap
date: 2020-03-18 01:14:2ß7
categories:
  - java
tags:
  - java集合
---

java集合系列-ConCurrentHashMap，简单介绍ConCurrentHashMap的底层结构。
<!-- more -->

------------
### 概念

我们知道HashMap是线程不安全的，在并发的场景下，我们使用Collections.sychronizedMap()方法来包装我们的HashMap。但这是通过使用一个全局锁来同步不同线程间的并发访问，因此会造成很大的性能问题。

ConCurrentHashMap是HashMap的线程安全版本，在ConCurrentHashMap中，无论是读操作还是写操作都能保证很高的性能，对行的读操作时几乎不需要加锁，对写操作时，通过分段锁技术支队所操作的段加锁，并不影响客户端对其他段的访问。

### 底层结构

#### JDK1.7

在JDK1.7及以前ConCurrentHashMap是由Segment数组结构和HashEntry数组结构组成；Segment实现了ReentrantLock,所以Segment是一种可重入锁，扮演锁的角色。HashEntry用于存储键值对数据。

```java
static class Segment<K,V> extends ReentrantLock implements Serializable {
}
```

<img class="avatar" src="/img/segments.jpg">

即将数据分成一段一段存储，然后给每一段数据配一把锁，当一个线程占用锁访问其中一段数据时，其他段的数据也能被其他线程访问。

Segment的结构和HashMap类似，是一个数组和链表结构，一个Segment包含一个HashEntry数组，每个HashEntry是一个链表结构的元素，每个Segement守护着一个HashEntry元素，当对HashEntry数组的数据进行修改时，必须首先获得相应的segment的锁。

#### JDK1.8

JDK1.8的实现已经抛弃了Segment分段锁的机制，采用了CAS+Synchronized来保证并发更新的安全。

<img class="avatar" src="/img/concurrenthashmap.jpg">

数据结构和HashMap 1.8的结构类似，数组+链表+红黑树。Jdk1.8在链表长度超过一定的阀值(8)时，将链表(寻址时间复杂度O(log(n)))转换为红黑树(寻址时间复杂度O(log(n)))。

synchronized只锁当前链表或者红黑树的首结点。这样只要不发生Hash冲突，就不会产生并发，效率大大提升。

### 对比HashTable

ConcurrentHashMap 和 Hashtable 的区别主要体现在实现线程安全的方式上不同：

- 底层数据结构：
  1. jdk1.7的ConcurrentHashMap底层采用分段的数据+链表实现的，jdk1.8采用和HashMap1.8一样，数组+链表+红黑树；
  2. HashTable和jdk1.7的HashMap一样采用的是数据+链表的形式，数组是HashMap的主体，链表是解决Hash冲突而出现的。
- 实现线程安全的方式：
  1. 在jdk1.7时，ConcurrentHashMap采用分段锁，对整个数组进行分割分段成多个Segment，每一把锁只锁一段数据，多线程访问不同段的数据，就不会产生锁竞争；jdk1.8摒弃了Segment分段锁的概念，直接使用Node数据+链表+红黑树的数据结构，并发控制采用synchronized和cas来操作，整个看起来就像优化过且线程安全的HashMap
  2. HashTable，使用synchronized来保证线程安全，也就是只用一把锁，效率非常低下，当一个线程访问同步方法时，其他线程也进行访问时，就会进入阻塞或者轮询状态，如果使用put添加元素，另一个线程就不能使用put添加元素，也不能get获取玄素。

### 源代码

#### 构造方法

```java
//构造方法
    public ConcurrentHashMap(int initialCapacity) {
        if (initialCapacity < 0)//判断参数是否合法
            throw new IllegalArgumentException();
        int cap = ((initialCapacity >= (MAXIMUM_CAPACITY >>> 1)) ?
                   MAXIMUM_CAPACITY ://最大为2^30
                   tableSizeFor(initialCapacity + (initialCapacity >>> 1) + 1));//根据参数调整table的大小
        this.sizeCtl = cap;//获取容量
        //ConcurrentHashMap在构造函数中只会初始化sizeCtl值，并不会直接初始化table
    }
    //调整table的大小
    private static final int tableSizeFor(int c) {//返回一个大于输入参数且最小的为2的n次幂的数。
        int n = c - 1;
        n |= n >>> 1;
        n |= n >>> 2;
        n |= n >>> 4;
        n |= n >>> 8;
        n |= n >>> 16;
        return (n < 0) ? 1 : (n >= MAXIMUM_CAPACITY) ? MAXIMUM_CAPACITY : n + 1;
    }
```

#### 初始化table

table的初始化会延迟到第一次的put时，但是put是可以并发的，如何做到只初始化一次的呢？看下源代码：

```java
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) throw new NullPointerException();
        int hash = spread(key.hashCode());
        int binCount = 0;
        for (Node<K,V>[] tab = table;;) {
            Node<K,V> f; int n, i, fh; K fk; V fv;
            if (tab == null || (n = tab.length) == 0)//判断table还未初始化
                tab = initTable();//初始化table
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
                if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
                    break;                   // no lock when adding to empty bin
            }
           ...省略一部分源码
        }
    } 
    
    private final Node<K,V>[] initTable() {
        Node<K,V>[] tab; int sc;
        while ((tab = table) == null || tab.length == 0) {
        //如果一个线程发现sizeCtl<0，意味着另外的线程执行CAS操作成功，当前线程只需要让出cpu时间片，
        //由于sizeCtl是volatile的，保证了顺序性和可见性
            if ((sc = sizeCtl) < 0)//sc保存了sizeCtl的值
                Thread.yield(); // lost initialization race; just spin
            else if (U.compareAndSetInt(this, SIZECTL, sc, -1)) {//cas操作判断并置为-1
                try {
                    if ((tab = table) == null || tab.length == 0) {
                        int n = (sc > 0) ? sc : DEFAULT_CAPACITY;//DEFAULT_CAPACITY = 16，若没有参数则大小默认为16
                        @SuppressWarnings("unchecked")
                        Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                        table = tab = nt;
                        sc = n - (n >>> 2);
                    }
                } finally {
                    sizeCtl = sc;
                }
                break;
            }
        }
        return tab;
    }  

```

#### put操作

```java
    
    final V putVal(K key, V value, boolean onlyIfAbsent) {
        if (key == null || value == null) throw new NullPointerException();
        int hash = spread(key.hashCode());//哈希算法
        int binCount = 0;
        for (Node<K,V>[] tab = table;;) {//无限循环，确保插入成功
            Node<K,V> f; int n, i, fh; K fk; V fv;
            if (tab == null || (n = tab.length) == 0)//表为空或表长度为0
                tab = initTable();//初始化表
            else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {//i = (n - 1) & hash为索引值，查找该元素，
            //如果为null,说明第一次插入
                if (casTabAt(tab, i, null, new Node<K,V>(hash, key, value)))
                    break;                   // no lock when adding to empty bin
            }
            else if ((fh = f.hash) == MOVED)//MOVED=-1;当前正在扩容，一起进行扩容操作
                tab = helpTransfer(tab, f);
            else if (onlyIfAbsent && fh == hash &&  // check first node
                     ((fk = f.key) == key || fk != null && key.equals(fk)) &&
                     (fv = f.val) != null)
                return fv;
            else {
                V oldVal = null;
                synchronized (f) {//其他情况加锁同步
                    if (tabAt(tab, i) == f) {
                        if (fh >= 0) {
                            binCount = 1;
                            for (Node<K,V> e = f;; ++binCount) {
                                K ek;
                                if (e.hash == hash &&
                                    ((ek = e.key) == key ||
                                     (ek != null && key.equals(ek)))) {
                                    oldVal = e.val;
                                    if (!onlyIfAbsent)
                                        e.val = value;
                                    break;
                                }
                                Node<K,V> pred = e;
                                if ((e = e.next) == null) {
                                    pred.next = new Node<K,V>(hash, key, value);
                                    break;
                                }
                            }
                        }
                        else if (f instanceof TreeBin) {
                            Node<K,V> p;
                            binCount = 2;
                            if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,
                                                           value)) != null) {
                                oldVal = p.val;
                                if (!onlyIfAbsent)
                                    p.val = value;
                            }
                        }
                        else if (f instanceof ReservationNode)
                            throw new IllegalStateException("Recursive update");
                    }
                }
                if (binCount != 0) {
                    if (binCount >= TREEIFY_THRESHOLD)
                        treeifyBin(tab, i);
                    if (oldVal != null)
                        return oldVal;
                    break;
                }
            }
        }
        addCount(1L, binCount);
        return null;
    }
    //哈希算法
    static final int spread(int h) {
        return (h ^ (h >>> 16)) & HASH_BITS;
    }
    //保证拿到最新的数据
    static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
        return (Node<K,V>)U.getObjectAcquire(tab, ((long)i << ASHIFT) + ABASE);
    }
    //CAS操作插入节点，比较数组下标为i的节点是否为c，若是，用v交换，否则不操作。
    //如果CAS成功，表示插入成功，结束循环进行addCount(1L, binCount)看是否需要扩容
    static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,
                                        Node<K,V> c, Node<K,V> v) {
        return U.compareAndSetObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
    }

```

#### 扩容

当table容量不足的时候，对table的元素数量达到阀值sizeCtl。需要table进行扩容，整个过程分为两步：

- 构建一个nextTable，大小为table的两倍。
- 把table的数据复制到nextTbale中。

```java
private final void addCount(long x, int check) {
    ... 省略部分代码
    if (check >= 0) {
        Node<K,V>[] tab, nt; int n, sc;
        while (s >= (long)(sc = sizeCtl) && (tab = table) != null &&
               (n = tab.length) < MAXIMUM_CAPACITY) {
            int rs = resizeStamp(n);
            if (sc < 0) {// sc < 0 表明此时有别的线程正在进行扩容
                if ((sc >>> RESIZE_STAMP_SHIFT) != rs || sc == rs + 1 ||
                    sc == rs + MAX_RESIZERS || (nt = nextTable) == null ||
                    transferIndex <= 0)
                    break;
                if (U.compareAndSwapInt(this, SIZECTL, sc, sc + 1))
                // 不满足前面5个条件时，尝试参与此次扩容，把正在执行transfer任务的线程数加1，+2代表有1个，+1代表有0个
                    transfer(tab, nt);
            }
            //试着让自己成为第一个执行transfer任务的线程
            else if (U.compareAndSwapInt(this, SIZECTL, sc,
                                         (rs << RESIZE_STAMP_SHIFT) + 2))
                transfer(tab, null);// 去执行transfer任务
            s = sumCount();// 重新计数，判断是否需要开启下一轮扩容
        }
    }
}
```

结点从table移动到nextTable，大体的思想是遍历、复制的过程。遍历过所有的结点以后完成了复制工作，把table指向nextTable，并更新sizeCtl为新数组大小的0.75倍，扩容完成。

#### get操作

- 判断table是否为空，如果为空，直接返回null
- 计算key的hash值，并获取指定table中指定位置的node结点，通过遍历链表或者树结构找到相应的节点，返回value值

```java
public V get(Object key) {
    Node<K,V>[] tab; Node<K,V> e, p; int n, eh; K ek;
    int h = spread(key.hashCode()); //计算两次hash
    if ((tab = table) != null && (n = tab.length) > 0 &&
        (e = tabAt(tab, (n - 1) & h)) != null) {//读取首节点的Node元素
        if ((eh = e.hash) == h) { //如果该节点就是首节点就返回
            if ((ek = e.key) == key || (ek != null && key.equals(ek)))
                return e.val;
        }
        //hash值为负值表示正在扩容，这个时候查的是ForwardingNode的find方法来定位到nextTable来
        //查找，查找到就返回
        else if (eh < 0)
            return (p = e.find(h, key)) != null ? p.val : null;
        while ((e = e.next) != null) {//既不是首节点也不是ForwardingNode，那就往下遍历
            if (e.hash == h &&
                ((ek = e.key) == key || (ek != null && key.equals(ek))))
                return e.val;
        }
    }
    return null;
}
```

#### size方法

对于size的计算，在扩容和addCount方法就已经计算好了。put方法里面就调用了addCount，当调用size的时候直接返回结果。

```java
public int size() {
    long n = sumCount();
    return ((n < 0L) ? 0 :
            (n > (long)Integer.MAX_VALUE) ? Integer.MAX_VALUE :
            (int)n);
}
final long sumCount() {
    CounterCell[] as = counterCells; CounterCell a; //变化的数量
    long sum = baseCount;
    if (as != null) {
        for (int i = 0; i < as.length; ++i) {
            if ((a = as[i]) != null)
                sum += a.value;
        }
    }
    return sum;
}
```

