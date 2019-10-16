---
title: Spring系列-Spring原理简介
date: 2019-08-16 08:14:27
categories:
  - spring
tags:
  - spring
---
Spring系列-Spring原理简介，本文介绍spring的原理、特点、核心模块、常用注解等。

<!-- more -->


------------

### 特点
#### 轻量级
- 从大小与开销两方面而言 Spring 都是轻量的．完整的 SPring 框架可以在一个大小只有 1M 多的 JAR 文件里发布，并且 SPring 所需的处理开销也是微不足道的
- 此外Spring是非入侵的，典型的，Spring应用中不依赖与Spring的特定类

#### 控制反转
- Spring 通过一种控制反转 IOC 的技术促进了低耦合．
- 当应用了IOC ，一个对象依赖的其他对象会通过被动的方式传递进来，而不是这个对象自己创建或者查找依赖对象．

#### 面向切面
Spring 支持面向切面的编程，并且把应用业务逻辑和系统服务分开
#### 容器
Spring 包含并管理应用对象的配置和生命周期，在这个意义上它是种容器，你可以配置你的每个 bean 如何被创建－一基于一个可配置原型，你的 bean 可以创建一个单独的实例或者每次需要时都生成一个新的实例－一以及它是如何相互关联的。
#### 框架
- Spring 可以将简单的组件配置、组合成为复杂的应用．
- 在 spring 中，应用对象被声明式地组合，典型的是在一个 xML 文件里． 
- spring 也提供了很多基础功能（事务管理、持久化框架集成等），将应用逻辑的开发留给开发者

### 核心组件
<img class="avatar" src="/img/spring核心组件.jpg">

#### 核心容器
核心容器提供了spring框架的基本功能，核心容器的重要组件是beanfactory，它是工厂模式的实现，使用ioc模式将应用程序的配置和依赖性规范与实际的应用程序代码分开。
#### Spring上下文
spring上下文是一个配置文件，向speing框架提供上下文信息，Spring上下文包括企业服务，EJB、电子邮件、国际化、校验、和调度功能。
#### aop
通过配置管理特性，aop模块直接将面向切面编程的功能集成到了spring框架中，可以将一些通用的任务，如安全、事务、日志等集中管理、提高了复用性和管理的便捷性
#### dao
为jdbc dao抽象层提供了有意义的异常层次结构，可用该结构来管理异常处理和不同数据库抛出的异常消息，异常层次机构简化了错误处理，并且极大的降低了需要编写异常代码的数量。
#### orm
spring框架插入了若干个orm框架，从而提供了orm的对象关系工具，其中包括jdo、hibernate、ibatis等，所有的这些都遵从spring的通用事务和dao异常层次结构。
#### web
web上下文模块建立在应用程序上下文之上，为基于web的应用程序提供了上下文，所以spring框架支持与struts集成，web模块还简化了处理多部分请求以及将请求参数绑定到域对象工作。
#### mvc
mvc框架是一个全功能的构建web应用程序的mvc的实现，通过策略接口，mvc框架变成为高度可配的，mvc容纳了大量的视图技术，其中包括jsp、fremarker、itext、poi等
### 主要jar包
- org.springframework.core-核心工具包，其他包依赖此包
- org.springframework.beans-所有应用都用到，包含访问配置文件，创建和管理bean
- org.springframework.aop-aop的实现
- org.springframework.context-提供ioc功能的拓展，提供企业级服务
- org.springframework.web.mvc-应用开发时所需的核心类
- org.springframework.transaction-为jdbc、hibernate等提供一致性声明和编程式事务管理
- org.springframework.web-web应用开发时用到的Spring核心类
- org.springframework.aspects-提供对asprectj框架的整合
- org.springframework.test-对junit等测试框架的封装
- org.springframework.asm-spring3.0开始提供自己独立的asmjar包
- org.springframework.context.support-springcontext的扩展支持，用于mvc
- org.springframework.expression-spring的表达式语言
- org.springframework.instrument.tomcat-Spring对tomcat连接池的集成
- org.springframework.instrument-对服务器的代理接口
- org.springframework.jdbc-对jdbc的简单封装
- org.springframework.jms-简化jms aoi的简单封装
- org.springframework.orm-整合第三方orm的实现，如hibernate，ibatis等
- org.springframework.oxm-对object/xml映射的支持，可以java和xml来回切换
- org.springframework.protlet-springmcv等增强
- org.springframework.servlet-对J2ee 6.0 servlet3.0的支持
- org.springframework.struts-整合对struts框架的支持

### 常用注解
#### 类的注解
- @Component 泛指组件，组件不好分类的时候可以用这个注解
- @Controller 用于标注控制层组件；标记在一个类上，标记的类为springmvc对象；分批处理器将会扫描使用该注解的类方法，并检测方法是否使用了@RequestMapping注解；可以把request请求header部分的值绑定到方法的参数上
- @RestController 相当与@Controller和Reponsbody的组合
- @Repository 用于注解dao层
- @Service 用于注解业务层

#### 方法的注解
- @ResponseBody 异步请求；用于将controller方法返回的对象，通过适当的httpMessageConvert转换为指定格式，写入response对象；返回的数据不是html标签的数据而是其他类型如json/xml格式数据时使用
- @RequestBody 用与数据接收时使用，将xml/json数据映射到java对象中，注解在方法中参数对象前
- @RequestMapping 用来处理请求地址映射的注解，可用于类和方法上，用于类上，类的所有方法前都加类上的路径
- @Autowired 可以对类的成员变量/方法/构造函数进行标注，完成自动装配的工作，通过注解可以消除get set方法，默认根据类型注入，根据名称注入需配合@Qualifier("nameStr")
- @Resource 是jsr250规范，在javax.annotation包下，即不是spring的注解，默认根据属性的名称name进行自动装配
- @Inject 是jsr330中的规范，需要导入javax.inject.inject jar包，根据类型自动注入的，根据名称注入需要配合@Named("nameStr")
- @PathVariable 用于将请求url中的模板变量映射到功能处理方法的参数上，即取出url模版的变量作为参数
- @RequestParam 主要用于springmvc后台控制层获取参数，类似 request.getParameter("name")
- @RequestHeader 可以将request请求header部分的值绑定到方法的参数上

#### 不常用的注解
- @ModelArribute 该controller的所有方法调用前，先执行此@ModelAtrribute方法，可用于注解和方法的参数中，可以注解在baseController类，所有的controller继承，可实现调用controller时先执行@ModleAttribute方法
- @SessionAtrributes 将值放在session作用域中，可写在class上面
- @Valid 实体数据校验可以结合hibernate validator使用
- @CookieValue 用来获得cookies中的值

#### 案例
- 问题：ajax传递数组对象，springmvc后台controller接收
- 分析：参数为对象时，需要在前端传递前进行json数据类型转换JSON.stringify(data)，conytentType、dataType设置json格式，后台需要@RequestBody转成json对象接收
- 解决
前端jsp代码：
```html
$.ajax({
    type:"post",
    contentType:"application/json;charset:UTF-8",
    url:"#{pageContext.request.contextPath}/rest/set}",
    datatype:"json",
    data:JSON.stringify(data),
    sunccess:function(data){
    },
    error:function(){   
    }
});
```
后端java代码：
```java
@RequestMapping({"/set"})
public SimpleMessage<?> set(@RequsetBody dataVO vo){
    
}
```
注意：
后端vo需要序列化，前端contentType需要设置application/json，datatype=json，data=JSON.stringify(data)


### 第三方框架集成
#### 权限
##### shiro
java的安全框架，认证、授权、会话管理、与web继承、缓存
##### spring security
spring的权限框架，登陆、权限验证
#### 缓存
##### Ehcache
是一个纯java的进程内缓存框架，具有快速、精干特点，是hibernate默认的
##### Redis
基于内存也可持久化的日志型key-value数据库
#### 持久层框架
##### hibernate
一个开源的对象关系型框架，对jdbc进行了非常轻量级的对象封装，将pojo与数据库建立映射关系，全自动orm框架
##### mybatis
支持普通的sql查询，存储过程和高级映射的优秀持久层框架
#### 定时任务
##### quartz
一个开源的作业调度框架，由java编写zaiQuart可以快速完成任务调度工作
##### spring-task
轻量级Quartz，而且使用简单，不需要额外的包，支持注解和配置

#### 校验框架
##### hibernate-validator
验证bean的字段，基于注解，方便快捷高效
##### oval
可扩展的java对象数据验证框架，验证规则可通过配置文件、annotation、pojos进行设定没可以使用java、js、等规则编写