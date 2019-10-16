---
title: redis系列-sentinel哨兵机制
date: 2019-08-09 23:14:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis系列-sentinel哨兵机制，本文介绍sentinel对redis主从节点的监控和完成故障转移的应用的原理。
<!-- more -->


------------
### 哨兵机制作用
- 哨兵机制的出现是为了解决主从复制的缺点的
- 原理：当主节点出现故障时，由Redis Sentinel自动完成故障发现和转移，并通知应用方，实现高可用性。

### 故障转移机制
- 由Sentinel节点通过**定时任务**定期监控发现主节点是否出现了故障，
- sentinel会向master发送心跳PING来确认master是否存活，如果master在“一定时间范围”内不回应PONG 或者是回复了一个错误消息，那么这个sentinel会**主观**地(单方面地)认为这个master已经不可用了，对master进行**客观下线**
- 当主节点出现故障，此时3个Sentinel节点**领导者选举**了Sentinel3节点为领导，负载处理主节点的故障转移
- 由Sentinel3领导者节点执行**故障转移**，过程和主从复制一样，但是自动执行

#### 定时监控任务
##### 配置
```xml
sentinel monitor myMaster 127.0.0.1 6379 2
#myMaster 主节点名称 6379 主节点端口 2 选举数quorun
sentinel down-after-milliseconds myMaster 30000
#sentinel会向master发送心跳PING来确认master是否存活，如果master在“一定时间范围”内不回应PONG 或者是回复了一个错误消息，那么这个sentinel会主观地(单方面地)认为这个master已经不可用了,这个down-after-milliseconds就是用来指定这个“一定时间范围”的，单位是毫秒。
```
##### 任务

- 每10秒每个sentinel对master和slave执行info，发现slave节点，确认主从关系，有新的节点加入马上感知
- 每2秒每个sentinel通过master节点的channel交换信息（pub/sub）,通过——sentinel——：hello频道交互，交互对节点的看法和自身信息
- 每1秒每个sentinel对其他sentinel和redis执行ping，心跳检测，失败判定依据

#### 主观下线和客观下线
##### 主观下线
每个sentinel节点对redis节点失败的主观偏见判定
##### 客观下线
所有sentinel节点对redis节点失败达成共识，超过quorum选举个数，此时sentinel节点则认为该主节点确实有问题，就客观下线了

#### 领导者选举
##### 原因
只有一个sentinel节点完成故障转移
##### 选举
- 每个做主观下线的sentinel节点向其他sentinel发送命令，请求将它设置为领导者
- 收到命令的sentinel节点如果没有同意其他节点的请求，那么将同意该请求，否则拒绝
- 如果该sentinel节点发现自己的票数超过了sentinel集合的半数且超过quorum，那么它将成为领导者
- 如果此过程中多个sentinel节点成为领导者，则重新进行选举

#### 故障转移
- 选择slave-priority(slave节点优先级，可配置)最高的slave节点，如果存在则返回，不存在则继续
- 选择复制偏移量offset最大的slave节点（复制的最完成），如果存在则返回，不存在则继续
- 选择runid最小的slave节点

### 安装与配置
#### 配置redis主节点
##### 启动
```shell
redis-server redis-7000.conf
```
##### 配置
```xml
port 7000
daemonize yes
pidfile /var/run/redis-7000.pid
logfile "7000.log"
dir "/opt/soft/redis/data"
```
#### 配置redis从节点
##### 启动
```shell
redis-server redis-7001.conf
redis-server redis-7002.conf
```
##### 配置
```xml
port 7001
daemonize yes
pidfile /var/run/redis-7001.pid
logfile "7001.log"
dir "/opt/soft/redis/data"
slaveof 127.0.0.1 7000
```
```xml
port 7002
daemonize yes
pidfile /var/run/redis-7002.pid
logfile "7002.log"
dir "/opt/soft/redis/data"
slaveof 127.0.0.1 7000
```
#### 配置sentinel
```xml
port ${port}
daemonize yes
logfile "${port}.log"
dir "/opt/soft/redis/data"
sentinel monitor myMaster 127.0.0.1 6379 2
#myMaster 主节点名称 6379 主节点端口 2 选举数quorun
sentinel down-after-milliseconds myMaster 30000
sentinel parallel-syncs myMaster 1
sentinel failover-timeout myMaster 180000
```
#### java客户端连接
```java
Set<String> IPS = new HashSet<String>();
IPS.add("127.0.0.1:26379");
JedisSentinelPool pool = new JedisSentinelPool("mymaster", IPS);
Jedis jedis=null;
try{
	jedis = pool.getResource();
	jedis.set("foo", "bar");
	System.out.println(jedis.get("foo"));
} catch(Exception e){
	e.printStackTrace();
} finally {
	if(jedis != null)｛
	jedis.close();
	｝
}
```
