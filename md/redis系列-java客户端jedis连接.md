---
title: redis系列-java客户端jedis连接
date: 2019-08-07 23:14:27
categories:
  - redis
tags:
  - redis
  - 缓存
  - 数据库
---

redis系列-java客户端连接，介绍在java代码中如何连接redis,包括jedis直连、jedsiPool、pipeline。
<!-- more -->


------------

### maven依赖

```java
<dependency>
	<groupId>redis.clients</groupId>
	<artifactId>jedis</artifactId>
	<version>2.9.0</version>
</dependency>
```
### jedis直连

```java
import redis.clients.jedis.Jedis;
public class RedisTest {
    public static void main(String[] args) {
        //连接本地的 Redis 服务
        Jedis jedis = new Jedis("127.0.0.1",6379);
        System.out.println("连接成功");
        //字符串
        jedis.set("hello", "world");
		//hash
		jedis.hset("myhash","k1","v1");
		//list
		jedis.rpush("mylist","1");
		jedis.rpush("mylist","2");
		jedis.rpush("mylist","3");
		//输出结果 【1，2，3】
		jedis.lrange("mylist",0,-1);
		//set
		jedis.sadd("myset","a");
		jedis.sadd("myset","b");
		//输出结果【b,a】
		jedis.smembers("myset");
		//zset
		jedis.zadd("myzset",99,"a");
		jedis.zadd("myzset",66,"b");
		jedis.zadd("myzset",33,"c");
		//输出结果 [[["c"],33],[["b"],66],[["a"],99]]
		jedis.zrangeWithScores("myzset",0,-1);
        // 获取存储的数据并输出
        System.out.println("redis 存储的字符串为: "+ jedis.get("hello"));
    }
}
```
### jedis连接池

```java
//初始化连接池
GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig();
JedisPool jedisPool = new JedisPool(poolConfig,"127.0.0.1",6379);
Jedis jedis = null;
try{
	//1从连接池获取jedis对象
	jedis = jedisPool.getResource();
	//执行操作
	jedis.set("hello","world");
}catch(Exception e){
	e.printStackTrace();
}fanally{
	if(jedis != null){
		//归还jedis
		jedis.close();
	}
}
```
### pipeline批量操作
```java
//初始化连接池
GenericObjectPoolConfig poolConfig = new GenericObjectPoolConfig();
JedisPool jedisPool = new JedisPool(poolConfig,"127.0.0.1",6379);
Jedis jedis = null;
try{
	//1从连接池获取jedis对象
	jedis = jedisPool.getResource();
	//for 批量遍历操作
	for(int i=0;i<100;i++){
		//获得pipeline
		Pipeline pipeline = jedis.pipelined();
		//pipeline每次提交1w调数据
		for(int j=i*100;j<(i+1)*100;j++){
			pipeline.hset("hashkey"+j."filed"+j,"value"+j);
		}
		//pipeline提交
		pipeline.syncAndReturnAll();
	}
	
}catch(Exception e){
	e.printStackTrace();
}fanally{
	if(jedis != null){
		//归还jedis
		jedis.close();
	}
}
```
