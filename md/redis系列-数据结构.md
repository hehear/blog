---
title: redis系列-数据结构
date: 2019-08-02 02:49:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis系列-数据结构，介绍redis的数据结构，及每种数据结构可以应用的场景。
<!-- more -->


------------


###  字符串
编码：raw、int、embstr
#### 特点
value可以为string、int、2进制，最大值512mb
#### API
```shell
get key
#根据key获取数据
set key value
#新增
del key
#根据key删除数据
incr key
#key自增1 如果key不存在，自增后，get(key)=1'
decr key
#key 自减1，若key不存在，自减后get(key)=-1
incrby key k
#key自增到k，若果key不存在，自增后get(key)=k
decrby key k
#key自减到k，若果key不存在，自减后get(key)=-k
```
#### 使用场景
##### 网站访问量
incr userid:pageciew (单线程：无竞争)
##### 缓存
视频的基本信息（数据源在mysql），先访问redis，存在即取，不存在，则取mysql
伪代码：
```java
public videoInfo get(long id){
	String redisKey = redisPrefix+id;
	VideoInfo v =redis.get(redisKey);
	if(v==null){
	v=mysql.get(id);
		if(v!=null){
		//序列化
		redis.set(redisKey,serialize(v))
		}
	}
	return v；
}

```
#### 不常用API
```shell
set key value
#不管key是否存在都设置
setnx key value
#key不存在才设置（相当于新增）
set key value xx
#key存在才设置（相当于更新）
mget key1 key2 key3 key 4
#批量获取key 原子操作
mset key1 value1 key2 value2 key3 value3
#批量设置key-value
getset key newvalue
#set key newvalue并返回旧的value，即先get后set
append key value
#将value追加到旧的value
strlen key
#返回字符串的长度（注意中文）
incrbyfloat key 3.5
#增加key到3.5
getrange key start end
#获取字符串指定下标所有的值
setrange key index value
#设置指定下标所有对应的值
eg:
set hello javabest
getrange hello 0 2
#jav
setrange hello 4 p
get hello
#javapest
```
n次get=n次网络时间+n次命令时间
1次mget=1次网络时间+n次命令时间

注意：mget不能太多计数，可拆分 提高性能


------------


### hash
编码：hashtable、ziplist
#### 特点
结构为key field value,key为字符串，value为对象
#### API
```shell
hget key filed
#获取hash key对应的field的value
hset key field value
#设置hash key对应filed的value
hdel key field 
#删除hash key对应的filie的value
hexists key field
#判断hash key是否有field
hlen key
#获取hash key field的数量
hmget key field1 field2
#批量获取hash key对应的field的value
hmset key field1 value1 filed2 value2
#批量设置hash key对应filed的value
```
#### 使用场景
##### 记录访问量
```shell
hincrby user:1:info pageview count
```
##### 缓存
```java
public videoInfo get(long id){
	String redisKey = redisPrefix+id;
	Map<string,string> mao =redis.get(redisKey);
	videoinfo v =transferMapTovideo(map);
	if(v==null){
	v=mysql.get(id);
		if(v!=null){
		redis.hmset(redisKey,transfervideoToMap(v))
		}
	}
	return v；
}
```
#### 不常用API
```shell
hgetall key
#返回hash key对应的所有field和value
hvals key
#返回hash key对应的所有field的value
hkeys key
#返回hash key对应的所有field
#hgetall，单线程小心使用
hsetnx key filed value
#没有才增加
hincrby key filed count
#增加到count
hincrbyfloat key field floatcount
#增加到浮点floatcount
```

------------


### list
编码：linklist、ziplist
#### 特点
- 有序的
- 可以重复
- 左右两边插入弹出

#### API
```shell
rpush key value1 value2 value3
#从列表右端插入值
push key value1 value2 value3
#从列表左端插入值
linsert key before|after value new Value
#在list指定值的前后插入newvalue，遍历实现的
eg:
#abcd
linsert listkey before b java
#ajavabc
linsert list key after b php
#abphpcd
lpop key
#从左边弹出item
#abcd
lpop listkey
#bcd
rpop
#abc
lrem key value
#根据count值，从列表中删除所有的value相等的项
#1count>0 从左到右 删除最多和count个value相等的项
#2count<0 从右边到左边 删除最多Math.abs(count)个value相等的项 绝对值
#3count=0 删除所有value相等的项
ltrim key start end
#按照索引范围修建列表
#abcdef
ltrim listkey 14
#bcde 从0开始
lrange key start end 包含
#获取列表指定索引范围所有的元素
#abcdef
#索引从左 0 5
#从右 索引 -1  -6
lrange listkey 02
#abc
lrange list key 1 -1
#bcdef
lindex key index
#获取列表指定的元素
#abcfef
lindex listkey 0
#a
lindex listkey -1
#f
llen key
#获取列表长度
lset key index newvalue
#设置列表指定索引值为newvalue
 rpush mylist a b c
 lrange listkey 0 -1
# a
# b
# c
 lpush listkey 0
 lrange listkey 0 -1
# 0
# a
# b
# c
 rpop listkey
 lrange listkey 0 -1
# 0
# a
# b
```
#### 使用场景
 lpush+lpop=stack
 lpush+rpop=queue
 lpush+ltrim=capped collection
 lpush+brpop=message queue

#### 不常用API
```shell
 blpop key timeout
 #lpop阻塞版本，timeout是阻塞超时时间timeout=0永远不阻塞
 brpop key timeout
  #lpop阻塞版本，timeout是阻塞超时时间timeout=0永远不阻塞
```

------------

### set
编码：hashtable、intset
#### 特点
- 无序
- 无重复
- 集合间操作

#### API
```shell
sadd key element
#向集合key添加element 如果element存在添加失败，可添加多个
srem key element
#将集合key中的element移除掉
scard  key
#计算集合大小，key的个数
sismember key it
#判断it是否存在集合中
srandmemeber key count
#从集合中随机选count个元素
spop key
#从集合中随机弹出一个元素
smembers key
#获取所有元素，无序的 小心使用
```
#### 使用场景
抽奖系统、点赞、踩、计数、标签、共同关注。
sadd 标签
spop/srandmember 随机
sadd+sinter 社交
#### 不常用API
```shell
sdiff key1 key2 
#差集
sinter key1 key2
#交集
sunnion key1 key2
#并集
sdiff|sinter|sunion + store destkey
#将差并交结果保存入deskey中
```

------------


### zset
编码：skiplist、ziplist
结构为：key  score  value
#### 特点
- 无重复元素 
- 有序
- element+score

#### API
```shell
zadd key score element 
#添加score 和element，可以多对
#时间复杂度  O(logN)
zrem key element
#删除元素,可以多个
zscore key element
#返回元素的分数
zincrby key incresore element
#增加或者减少元素的分数
zincrby key 9 mike
#给mike增加9分
zcard key
#返回元素的总数
zrank key element
#获取元素排名 按照分数从小到达
zrange key 0 -1 withscores
#返回指定索引范围生序元素（分值打印）
zrangebysrore key minScore maxscore withscores
#返回指定分数范围内的升序元素
zcount key minScore maxscore 
#返回有序集合内在指定分数范围内的个数
zremrangebyrank key start end
#删除指定排名内的升序元素
zremrangebyrank key 1 2
#删除第2名 第3名
zremrangebyscore key minScore maxScore
#删除指定分数内的升序元素
zremrangebyscore key 90 210
#删除分数在90到210的值
```
#### 使用场景
排行榜
#### 不常用API
```shell
zrevrank
#获取元素排名 按照分数从大到小
zrevrange
#返回指定索引范围倒序元素
zrevrangebyscore
#返回指定分数范围内的倒序元素
zinterstore
#交集存储
zunionstore
#并集存储
```