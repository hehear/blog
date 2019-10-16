---
title: redis系列-安装与使用
date: 2019-07-30 03:09:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis在linux上的安装与使用。
<!-- more -->

### 下载redis压缩包
```shell
#进入要安装的目录
cd /opt/soft
#下载tar包
wget http://download.redis.io/releases/redis-3.0.7.tar.gz
#解压
tar -xvf redis-3.0.7.tar.gz
#重定向
ln -s redis-3.0.7 redis
#进入目录
cd redis
#编译
make
make install
```
如果不能编译，可能你的linux缺少gcc

```shell
yum  install  gcc
make MALLOC=libc
```
### 启动redis

#### 直接默认启动

```shell
#进入src
cd  src/
#查看可执行的redis
ll | grep redis-
#返回上一层
cd ..
#启动redis
redis-server
```

##### 连接客户端
```shell
#连接客户端 -h ip -p 端口号
redis-cli -h 127.0.0.1 -p 6379
#增加数据 key:hello value:word
set hello word
#根据key=hello 获取value
get hello
#ping
ping
#退出
exit
#默认连接6379
redis-cli
#删除 key：hello的数据
del hello
#退出
exit
```
#### 动态参数启动

```shell
#启动redis，端口6380
redis-server --port 6380
```
##### 连接客户端
```shell
#连接redis，端口6380
redis-cli -p 6380
#查看redis进程
ps -ef|grep redis-server
#查看进程，去除grep进程的显示
ps -ef|grep redis-server|grep -v grep
```
####  根据配置文件启动

 
```shell
#进入redis目录
cd /opt/soft/redis
#创建配置文件夹
mkdir config
#拷贝原来的配置文件
cp redis.conf config
#重命名
cd config
mv redis.conf  redis-6381.conf
#去除所有注释行和空行显示
cat redis-6381.conf | grep -v "#" | grep -v "^$" 
#将去掉注释和空行的配置文件写入6382
cat redis-6381.conf | grep -v "#" | grep -v "^$"  > redis-6382.conf
#删除6381
rm -rf redis-6381.conf 
#编辑配置文件
vim redis-6382.conf
#是否记录日志
daemonize yes
#端口
port 6382
#工作路径
dir "/opt/soft/redis/data"
#日志
logfile "6382.log"
#保存退出
:wq
#创建data文件夹
cd ..
mkdir data
#根据配置文件启动redis
redis-server config/redis-6382.conf 
```
##### 查看启动日志
```shell
#查看进程
ps -ef|grep redis-server
#查看6382
ps -ef|grep redis-server|grep 6382
#进入data文件夹
cd data
#查看日志文件
cat 6382.log
```

