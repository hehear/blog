---
title: mysql系列-sql语句执行过程
date: 2020-03-24 01:14:27
categories:
  - mysql
tags:
  - mysql
  - 数据库
---

mysql系列-sql语句执行过程，介绍sql语句执行时，在数据库底层的执行过程。
<!-- more -->

------------
### mysql基础架构

先简单介绍mysql的一些组件，介绍这些组件的作用，在sql的执行过程中， 这些组件各自负责不同的功能。

<img class="avatar" src="/img/mysqlserver.jpg">

- server层：主要包括连接器、查询缓存、分析器、优化器、执行器等。所有跨存储引擎的功能都在这一层实现，比如存储过程、触发器、视图、函数等，还有通用的日志模块binglog模块。
- 存储引擎：主要负责数据存储和读取，采用可以替换的插件式架构，支持InnerDB、MyIsam、Memory等多个存储引擎，其中InnoDB引擎又各自的redolog模块。现在最常用的存储引擎是InnoDB，从mysql5.5.5版本开始就被当作默认存储引擎了。

#### server层基本组件

- 连接器：主要和身份认证和权限认证功能相关，负责用户登陆数据库，进行用户的身份认证，包括校验账户密码、权限等操作，如果用户账户密码通过，连接器会到权限表查询用户所有的权限。之后在这个连接表里权限逻辑判断都是依赖此时读取的权限数据，也就是说，后续只要这个连接不断开，即使修改了用户权限， 该用户也是不受影响的。
- 查询缓存（mysql8.0移除）:查询缓存主要用来缓存我们执行的select语句，以及该语句的结果集。连接建立后，查询时，先查询缓存，mysql会先校验这个sal是否执行过，以key-value的形式缓存到内存中，key时查询预计，value是结果集。如果缓存key被命中，就会直接返回客户端，如果没有命中，就会执行后续的操作，完成后也会把结果缓存起来，方便下一次调用。
- 分析器：mysql没有命中缓存，就会进入分析器，分析器主要是用来分析sql语句是用来干嘛的，分析器分两步来分析：
  1. 词法分析，首先提取关键字，比如select、提出查询的表、字段名、查询条件等
  2. 语法分析：判断sql语句是否符合mysql语法
- 优化器：优化器的作用就是它认为的最优执行方案去执行，比如多个索引的时候如何选择索引，多表查询的时候选择关联顺序等。
- 执行器：当选择了执行方案后，mysql就准备开始执行了。首先执行前会校验该用户有没有权限，如果没有权限，就会返回错误信息，如果有权限，就会调用引擎的接口，返回接口的执行结果。

### sql语句执行

sql可以分为两种，一种是查询，一种是更新(增加、更新、删除)。

#### 查询语句

分析下面的查询语句

```sql
select * from student where age='18' and name='hehear'
```

分析SQL语句的执行流程：

- 先检查该语句是否有权限，没有权限，直接返回错误信息，如果有权限，在mysql8.0版本以前，会先查询缓存，以sql语句为key的内存中查询是否有结果，如果有直接取缓存返回，没有进行下一步。

- 通过分析器进行词法分析，提取sql语句的关键元素，比如提取查询关键字select、表名student、查询所有的列、查询条件是 name='hehear'。然后判断这个sql语句是否有语法错误，比如关键词是否正确等，如果没问题，进行下一步。

- 优化器进行确定执行方案。可以有两只执行方案：

  1. 先查询学生表姓名为hehear的学生，然后判断年龄=18
  2. 先找到学生中年龄=18的学生，然后查询name=hehear的学生

  优化器根据自己的优化算法执行自己认为效率最好的一个方案，有时候不一定最好，确定了执行计划后就开始执行了

- 进行权限校验，如果咩有权限就会返回错误信息，如果有权限就会调用数据库引擎接口，返回引擎的执行结果

#### 更新语句

分析下面的更新语句

```sql
update student set age='19' and name='hehear'
```

更新语句时，要记录日志，mysql自带的日志模块binlog归档日志，所有的引擎都可以使用，我们常用的InnoDB引擎还自带了一个日志模块redo log重做日志，我们就以InnoDB模式来分析语句执行过程：

- 先查询到hehear这条数据，如果有缓存也是会用到缓存。
- 然后拿到查询到语句，将age改为19，然后调用引擎API，写入这一行数据，InnoDB引擎把数据保存在内存中，同时记录redo log，此时redo log进入prepare 状态，然后告诉执行器，执行完成了，随时可以提交。
- 执行器收到通知后记录binlog，然后调用引擎接口，提交dedo为提交状态。
- 更新完成。

为什么要用两个日志模块：

最开始mysql自带引擎是myisam，redo log是InnoDB特有的，这就导致了咩有crash-safe能力，即数据库发生异常重启，之前的记录都不会丢失，binlog只能用来归档。InnoDB用来支持事务，可以保证数据的一致性：

- 如果先写redo log直接提交，在写binlog，在写完redo log后，机器挂了，binlog没有被写入，机器重启后，这台机器会通过redo log恢复数据，但这个时候binglog没有记录该数据，后续进行机器备份的时候就会丢失这条数据，同时主从同步也会丢失这条数据。
- 如果先写binlog，然后写redo log，写完binlog机器异常重启了，由于没有redo log,机器是无法恢复这一条数据的，但是binlog又有记录，同样会产生数据不一致问题。
- 如果采用先写redo log进入准备状态，写完binlog后，此时出现异常，InnoDB的事务会解决这个问题保持数据的一致性：
  1. 判断redo log是否完整，如果完整，就立即提交
  2. 如果redo log只是与提交准备状态，不是commit状态，这个时候就会去判断binlog是否完整，如果完整就提交redo log，不完整就事务回滚。