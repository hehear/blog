---
title: redis系列-redis的持久化操作
date: 2019-08-07 23:34:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis系列-redis的持久化操作，本文介绍redis持久化的两个方式rdb、aof。
<!-- more -->


------------
### rdb
#### 什么是rdb
rdb是redis内存到硬盘的快照，类似MySQL的dump，存储到硬盘的二进制文件。
#### rdb存储的三种方式
##### save
save操作是同步的，由于redis是单线程的，save全量保存rdb文件时容易阻塞，执行时，如果存在老的rdb文件，新的文件替换老的。
##### bgsave
bgsave操作是异步的，在后台进行时redis会fork出一个单独的进程，不会阻塞客户端命令，但是fork操作消耗内存。
##### 自动
在redis配置文件中配置自动备份条件，当满足配置的条件时会触发bgsave自动生成rdb文件
```xml
save 900 1                  #900s内改变1次就生成RDB
save 300 10
save 60 10000
dbfilename dump.rdb   #设置rdb的名称
dir ./                              #rdb文件的位置
stop-writes-on-bgsave-error  yes  #bgsave期间出错停止写rdb
rdbcompression  yes
rdbchecksum      yes
```
有些操作也会触发rdb的保存：全量复制（主从复制）、debug reload、shutdown

### aof
#### 什么是aof
aof为redis操作日志，记录执行的命令，类似mysql的binlog日志。
#### aof策略
##### always
每条命令都fsync到硬盘，写aof日志文件。
##### everysec
每秒把缓冲区的数据fsync到硬盘，写aof日志文件。
##### no
由系统OS决定将缓冲区的数据fsync到硬盘，写aof日志文件。

| 命令  | always  | everysec  | no  |
| ------------ | ------------ | ------------ | ------------ |
|  优点 | 不丢失数据  | 每秒一次fsync丢1秒的数据  |不用管   |
|  缺点 | io开销大，一般sata硬盘只有几百tps  | 丢1秒数据  | 不可控  |

#### aof重写
##### 作用
将中间过程无用的命令去除，重新排列有用的命令，减少磁盘的占用量，加速恢复速度
##### 实现方式
###### 命令
bgrewriteaof命令，redis fork一个进程用于aof重写
###### 配置
```xml
appendonly yes
appendfilename "appendonly-${port}.aof"
appedfsnc everysec
dir /bigdiskpath
no-appendfsync-on-rewrite yes #重写过程中不写入aof，先写在缓存中，可能存在超过缓存大小丢失数据
auto-aof-rewrite-min-size 64mb #64M的时候重写
auto-aof-rewrite-percentage 100 #下次增长百分百的时候再次重写，也就是下次再增加64mb的时候重写
```
###### 自动触发
aof_current_size>auto-aof-rewrite-min-size
aof_current_size-aof_base_size/aof_base_size>auto-aof-rewrite-percentage
同时满足时触发，重写过程中期间日志写在缓冲buffer中，重写完，将缓存数据写入写的aof文件

