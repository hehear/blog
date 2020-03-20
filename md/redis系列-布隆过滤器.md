---
title: redis系列-布隆过滤器
date: 2020-03-20 01:14:2ß7
categories:
  - redis
tags:
  - redis
---

redis系列-布隆过滤器，简单介绍解决redis的缓存穿透问题的布隆过滤器的数据结构。
<!-- more -->

------------
### 简介

布隆过滤器可以看作由**二进制向量（或者位数组）**和一系列的**哈希函数**两部分组成的数据结构。

### 优缺点

#### 优点

相比于我们平时使用的List、Map、Set等数据结构，它占用空间更少且效率更高。

位数组中的每个元素都只占用1 bit，并且每个元素只能是 0 或者 1 。这样一个100w数据的位数组只占用 1000000 Bit/8 = 125000 Byte = 122kb 的空间。

#### 缺点

返回的结果是概率性的，不是非常准确，理论情况下添加到集合中的元素越多，误报的可能性就越大，并且，存放在布隆过滤器中的数据不容易删除。

### 原理

#### 增加数据

当一个元素加入布隆过滤器中时：

- 使用布隆过滤器中的哈希函数对元素进行计算，有几个哈希函数就得到几个哈希值。
- 根据得到的哈希值，在位数组中把对应的下标置为1

#### 过滤数据

当判断一个元素是否存在布隆过滤器的时候：

- 对给定的元素进行哈希计算，同样进行所有的哈希函数计算。
- 根据得到的所有hash值，判断hash值在位数组中对应的位置是否都为1，如果值都为1，说明这个值在布隆过滤器中，如果存在一个值不为1，说明该元素不在布隆过滤器中。

不同的字符串可能会产生相同的hash值，即产生hash碰撞，这种情况下，可以适当增加位数组的大小，或者调整我们的哈希函数。

布隆过滤器判断元素存在，小概率会判断错误，但是布隆过滤器说某个元素不在，那么这个元素一定不在。

### 使用场景

- 判断给定的数据是否存在：比如判定一个数字是否在包含的大量数字集合中(数字量集合在5亿以上)、防止缓存穿透(判断请求的数据是否有效避免直接绕过缓存请求数据库)等等、邮箱的垃圾邮件过滤、黑名单等等。
- 去重：比如爬给定网址的时候对已经爬取过的URL去重

### Java实现

根据布隆过滤器的原理，可以用java实现一个，设计思路：

- 一个合适大小的位数组保存数据
- 几个不同的哈希函数
- 添加元素到位数组(布隆过滤器)方法实现
- 判断是否存在位数组(布隆过滤器)方法实现

代码实现：

```java
import java.util.BitSet;

public class MyBloomFilter {

    /**
     * 位数组的大小
     */
    private static final int DEFAULT_SIZE = 2 << 24;
    /**
     * 通过这个数组可以创建 6 个不同的哈希函数
     */
    private static final int[] SEEDS = new int[]{3, 13, 46, 71, 91, 134};

    /**
     * 位数组。数组中的元素只能是 0 或者 1
     */
    private BitSet bits = new BitSet(DEFAULT_SIZE);

    /**
     * 存放包含 hash 函数的类的数组
     */
    private SimpleHash[] func = new SimpleHash[SEEDS.length];

    /**
     * 初始化多个包含 hash 函数的类的数组，每个类中的 hash 函数都不一样
     */
    public MyBloomFilter() {
        // 初始化多个不同的 Hash 函数
        for (int i = 0; i < SEEDS.length; i++) {
            func[i] = new SimpleHash(DEFAULT_SIZE, SEEDS[i]);
        }
    }

    /**
     * 添加元素到位数组
     */
    public void add(Object value) {
        for (SimpleHash f : func) {
            bits.set(f.hash(value), true);
        }
    }

    /**
     * 判断指定元素是否存在于位数组
     */
    public boolean contains(Object value) {
        boolean ret = true;
        for (SimpleHash f : func) {
            ret = ret && bits.get(f.hash(value));
        }
        return ret;
    }

    /**
     * 静态内部类。用于 hash 操作！
     */
    public static class SimpleHash {

        private int cap;
        private int seed;

        public SimpleHash(int cap, int seed) {
            this.cap = cap;
            this.seed = seed;
        }

        /**
         * 计算 hash 值
         */
        public int hash(Object value) {
            int h;
            return (value == null) ? 0 : Math.abs(seed * (cap - 1) & ((h = value.hashCode()) ^ (h >>> 16)));
        }

    }
}
```

测试代码

```java
String value1 = "https://javaguide.cn/";
        String value2 = "https://github.com/Snailclimb";
        MyBloomFilter filter = new MyBloomFilter();
        System.out.println(filter.contains(value1));
        System.out.println(filter.contains(value2));
        filter.add(value1);
        filter.add(value2);
        System.out.println(filter.contains(value1));
        System.out.println(filter.contains(value2));

```

输出结果

```java
false
false
true
true
```

测试

```java
Integer value1 = 13423;
        Integer value2 = 22131;
        MyBloomFilter filter = new MyBloomFilter();
        System.out.println(filter.contains(value1));
        System.out.println(filter.contains(value2));
        filter.add(value1);
        filter.add(value2);
        System.out.println(filter.contains(value1));
        System.out.println(filter.contains(value2));
        
```

输出结果

```java
false
false
true
true
```

### Redis中的布隆过滤器

#### 简介

Redis v4.0 之后有了 Module（模块/插件） 功能，Redis Modules 让 Redis 可以使用外部模块扩展其功能 。布隆过滤器就是其中的 Module。详情可以查看 Redis 官方对 Redis Modules 的介绍 ：https://redis.io/modules。

另外，官网推荐了一个 RedisBloom 作为 Redis 布隆过滤器的 Module,地址：https://github.com/RedisBloom/RedisBloom。其他还有：

- redis-lua-scaling-bloom-filter （lua 脚本实现）：https://github.com/erikdubbelboer/redis-lua-scaling-bloom-filter
- pyreBloom（Python中的快速Redis 布隆过滤器） ：https://github.com/seomoz/pyreBloom

RedisBloom 提供了多种语言的客户端支持，包括：Python、Java、JavaScript 和 PHP。

#### Docker安装

如果我们需要体验 Redis 中的布隆过滤器非常简单，通过 Docker 就可以了！我们直接在 Google 搜索**docker redis bloomfilter** 然后在排除广告的第一条搜素结果就找到了我们想要的答案（这是我平常解决问题的一种方式，分享一下），具体地址：https://hub.docker.com/r/redislabs/rebloom/ （介绍的很详细 ）。