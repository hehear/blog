---
title: redis系列-发布订阅及redis新的数据结构
date: 2019-08-07 23:24:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis系列-发布订阅及redis新的数据结构，本文介绍redis实现简单发布订阅、消息队列，以及简单了解redis新的数据结构bitmap、hyperloglog、geo。
<!-- more -->


------------

### 发布订阅
#### 角色
发布者（publisher）、订阅者（subscriber）、频道（channel）
#### 模型
发布者（publisher）：发布消息到频道
订阅者（subscriber）：订阅频道，每个订阅者可订阅多个频道，但订阅频道，不能收到未订阅之前的数据
#### api
##### 发布
```shell
publish channel message
publish sohu:tv "hello world"
#返回订阅者数
```
##### 订阅
```shell
subscribe [channel] #一个或者多个
subscribe sohu：tv
```
##### 取消订阅
```shell
unsubscribe [channel] #一个或者多个
unsubscribe sohu：tv
```
##### 其他api
```shell
psubscribe [pattern] #订阅模式，例如先list出所有以p开头的频道，pattern可写条件
punsubscribe [pattern] #退订指定模式
pubsub channels #列出至少有一个订阅者的频道
pubsub numsub[channel...]#列出给定频道的订阅者数量
pubsub numpat #列出被订阅模式的数量
```

### 消息队列
和发布订阅模型类似，redisde list队列可完成功能
#### 模型
消息发布者-->发布消息到redis的list中，多个订阅者抢消息，只能有一个订阅这个可以抢到。

### bitmap
位图，数据结构为2进制结构，对位进行操作存储数据。
#### api
```shell
setbit key offset value
#给位图指定的索引设置值
getbit key offset
#获取位图指定的索引的值
bitcount key [strt end]
#获取指定范围的位值为1的个数
bitop op deskey key[key...]
#做多个bitmap的and交集、or并集、not非、xor异或操作并将结果保存到deskey中
eg:
set hello big
#获取hello存储的value的0位，结果为0
getbit hello 0
#设置hello的value的第七位为1
setbit hello 7 1
#get hello的结果为cig,因为上面的操作改变了big的asc码，将b改为了c
get hello

```
#### 应用
##### 独立用户的统计
使用set结构存储和bitmap对比：

|  数据类型 | 每个uid占用的空间  | 需要存储的用户量  | 全部的内存量  |
| ------------ | ------------ | ------------ | ------------ |
|  set |  32 位| 5千万  |  200MB |
| bitmap  | 1 位 | 1亿  |  12.5MB |
如果只有10w的用户的set4MB，bitMap12.5MB

### hyperloglog
#### 数据结构
极小的空间完成独立用户的统计，本质还是字符串
#### api
```shell
pfadd key element #添加元素
pfcount ket #计算独立总数
pfmerge destkey sourceKey[key...]#合并多个key
```
#### 内存消耗
优点：内存小，百万独立用户数据15kb
缺点：错误率：0.81%，统计结果不是很准确，实验中插入100w数据，查询个数为1009838；只能存储个数不能获取到单条数据。

### geo
#### 数据结构
基于zset实现的，用于存储地理信息定位，存储经纬度，计算两地距离，范围计算等。
#### api
```shell
geo key longitude latitude member
#增加地理位置
geopos key member
#获取地理位置信息
geolist key member1 member2 [unit]
#获取两个地理位置得距离
#unit:m米 km千米 mi英尺
zrem key member
#删除用zset的命令
```


