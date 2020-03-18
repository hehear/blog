---
title: java集合系列-容器简介
date: 2020-03-17 01:14:2ß7
categories:
  - java
tags:
  - java集合
---

java集合系列-容器简介，简单介绍Java中容器Collection、Map接口的实现。
<!-- more -->

------------
### 概念

Java中的容器主要包括Collection和Map两种，Collection存储着对象的集合，而Map存储着键值对(key、value)的映射表。

### Collection

<img class="avatar" src="/img/collection.jpg">

#### Set

- TreeSet：基于红黑树实现，支持有序操作，例如根据一个范围查找元素的操作，但是查找效率不如HashSet，HashSet查找的时间复杂度为O(1),TreeSet为O(logn).
- HashSet: 基于哈希表实现，支持快速查找，但不支持有序性操作。并且失去了元素插入顺序信息，也就是使用Iterator遍历HashSet得到的结果顺序是不确定的。
- LinkedHashSet：具有HashSet的查找效率，并且内部使用双向链表维护元素的插入顺序。

#### List

- ArrayList：基于动态数组实现，支持随机访问。
- Vector：和ArrayList类似，线程安全的。
- LinkedList：基于双向链表实现，只能顺序访问，但是可以快速在链表中间插入和删除元素。不仅如此，LinkedList还可以用作栈、队列、双向队列。

#### Queue

- LinkedList：可以用它来实现双向队列。
- PriorityQueue：基于堆结构实现，可以用它来实现优先队列。

### Map

<img class="avatar" src="/img/map.jpg">

- TreeMap：基于红黑树实现。
- HashMap：基于哈希表实现。
- HashTable：和HashMap类似，但它时线程安全的，这意味着同一时刻多个线程同时写入HashTable不会导致数据不一致。多线程应该使用ConcurrentHashMap来支持线程安全。ConcurrentHashMap的效率会更高，因为ConcurrentHashMap引入了分段锁。
- LinkedHashMap：使用双向链表来维护元素的顺序，顺序为插入的顺序或者最近最少使用LRU的顺序。

### 对比

- List（注重顺序）：list接口存储一组不唯一，有序的对象
- Set（独一无二）：不允许重复的集合，不会有多个元素引用相同的对象。
- Map（Key、value）：使用键值对存储，Map会维护与key有关联的值，两个Key可以引用相同的对象，但key不能重复，典型的key是String类型，但也可能是任何对象。