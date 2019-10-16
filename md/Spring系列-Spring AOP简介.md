---
title: Spring系列-Spring AOP简介
date: 2019-08-17 23:14:27
categories:
  - spring
tags:
  - spring
---
Spring系列-Spring AOP，本文介绍spring aop实现原理、代理方式、动态代理方式等。

<!-- more -->
------------

### 概念
- "横切"的技术，剖解开封装的对象内部，并将那些影响了多个类的公共行为封装到一个可重用模块， 并将其命名为"Aspect"，即切面。所谓"切面"，简单说就是那些与业务无关，却为业务模块所共 同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块之间的耦合度，并有利于未 来的可操作性和可维护性。
- 使用"横切"技术，AOP 把软件系统分为两个部分：核心关注点和横切关注点。业务处理的主要流 程是核心关注点，与之关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生 在核心关注点的多处，而各处基本相似，比如权限认证、日志、事物。AOP 的作用在于分离系统 中的各种关注点，将核心关注点和横切关注点分离开来。

AOP主要应用场景有：
1. Authentication 权限
1. Caching 缓存
3. Context passing 内容传递
4. **Error handling 错误处理**
5. Lazy loading 懒加载
6. Debugging  调试
7. **logging, tracing, profiling and monitoring 记录跟踪 优化 校准**
8. Performance optimization 性能优化
9. Persistence  持久化
10. Resource pooling 资源池
11. Synchronization 同步
12. **Transactions 事务**

### aop核心概念
#### 切面
aspect:类是对物体特征的抽象，切面就是对横切关注点的抽象,事务管理是J2EE应用中一个关于横切关注点很好的例子，在aop中可以@Aspect注解的方式实现。
#### 横切关注点
对哪些方法进行拦截，拦截后怎么处理，这些关注点称之为横切关注点。
#### 连接点
joinpoint：被拦截到的点，因为 Spring 只支持方法类型的连接点，所以在 Spring 中连接点指的就是被拦截到的方法，实际上连接点还可以是字段或者构造器。
#### 切入点
pointcut：对连接点进行拦截的定义，匹配连接点的断言，通知和一个切入点表达式关联，并在满足这个切入点的连接点上运行。
#### 通知
advice：所谓通知指的就是指拦截到连接点之后要执行的代码，通知分为前置、后置、 异常、终、环绕通知五类。
##### 前置
before advice：在某个连接点之前执行的通知，单这个通知不能阻止连接点之前的执行流程（除非抛出异常）
##### 后置
after returning advice:在某连接点正常完成后执行的通知，例如一个没有抛出异常，正常返回。
##### 异常
after throwing advice:在方法抛出异常时执行的通知
##### 最终
after advice：在某连接点推出的时候执行的通知，不论是正常返回还是异常退出。
##### 环绕
around advice：保卫一个连接点的通知。如方法调用，环绕通知可以在方法调用的前后完成自定义的行为，他也回选择是否继续执行连接点或者直接返回他自己的返回值或者抛出异常来结束执行。
#### 目标对象
代理的目标对象，被一个或者多个切面所通知的对象，也被称做被通知的对象，spring aop是通过运行时代理实现的，这个对象永远是一个被代理对象。
#### 织入
weave：将切面应用到目标对象并导致代理对象创建的过程，把切面连接到其他应用程序类型或者对象上，并创建一个被通知的对象，这些可以在编译时，类加载时和运行时完成，spring和其他java aop框架一样在运行时织入。
#### 引入
introduction: 在不修改代码的前提下，引入可以在运行期为类动态地添加一些方法 或字段。
### 两种代理方式
Spring 提供了两种方式来生成代理对象: JDKProxy 和 Cglib，具体使用哪种方式生成由 AopProxyFactory 根据 AdvisedSupport 对象的配置来决定。默认的策略是如果目标类是接口， 则使用JDK动态代理技术，否则使用Cglib来生成代理。
#### JDK动态代理
JDK 动态代理主要涉及到 java.lang.reflect 包中的两个类：Proxy 和 InvocationHandler。 InvocationHandler是一个接口，通过实现该接口定义横切逻辑，并通过反射机制调用目标类 的代码，动态将横切逻辑和业务逻辑编制在一起。Proxy 利用 InvocationHandler 动态创建 一个符合某一接口的实例，生成目标类的代理对象
#### CGLib动态代理
CGLib全称为Code Generation Library，是一个强大的高性能，高质量的代码生成类库， 可以在运行期扩展 Java 类与实现 Java 接口，CGLib 封装了 asm，可以再运行期动态生成新 的 class。和 JDK 动态代理相比较：JDK 创建代理有一个限制，就是只能为接口创建代理实例， 而对于没有通过接口定义业务方法的类，则可以通过CGLib创建动态代理。
### 举例
#### 配置文件方式
```java
package test.spring_aop_anno;

import org.aspectj.lang.ProceedingJoinPoint;

public interface IUserDao {
  void save();
}
//用于测试Cglib动态代理
class OrderDao {
  public void save() {
    //int i =1/0;用于测试异常通知
    System.out.println("保存订单...");
  }
}
//用于测试jdk动态代理
class UserDao implements IUserDao {
  public void save() {
    //int i =1/0;用于测试异常通知
    System.out.println("保存用户...");
  }
}
//切面类
class TransactionAop {
  public void beginTransaction() {
    System.out.println("[前置通知]  开启事务..");
  }
  public void commit() {
    System.out.println("[后置通知] 提交事务..");
  }
  public void afterReturing(){
    System.out.println("[返回后通知]");
  }
  public void afterThrowing(){
    System.out.println("[异常通知]");
  }
  public void arroud(ProceedingJoinPoint pjp) throws Throwable{
    System.out.println("[环绕前：]");
    pjp.proceed();             // 执行目标方法
    System.out.println("[环绕后：]");
  }
}
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:context="http://www.springframework.org/schema/context"
    xmlns:aop="http://www.springframework.org/schema/aop"
    xsi:schemaLocation="
        http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        http://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop.xsd">
  <!-- dao实例加入容器 -->
  <bean id="userDao" class="test.spring_aop_anno.UserDao"></bean>
  
  <!-- dao实例加入容器 -->
  <bean id="orderDao" class="test.spring_aop_anno.OrderDao"></bean>
  
  <!-- 实例化切面类 -->
  <bean id="transactionAop" class="test.spring_aop_anno.TransactionAop"></bean>
  
  <!-- Aop相关配置 -->
  <aop:config>
    <!-- 切入点表达式定义 -->
    <aop:pointcut expression="execution(* test.spring_aop_anno.*Dao.*(..))" id="transactionPointcut"/>
    <!-- 切面配置 -->
    <aop:aspect ref="transactionAop">
      <!-- 【环绕通知】 -->
      <aop:around method="arroud" pointcut-ref="transactionPointcut"/>
      <!-- 【前置通知】 在目标方法之前执行 -->
      <aop:before method="beginTransaction" pointcut-ref="transactionPointcut" />
      <!-- 【后置通知】 -->
      <aop:after method="commit" pointcut-ref="transactionPointcut"/>
      <!-- 【返回后通知】 -->
      <aop:after-returning method="afterReturing" pointcut-ref="transactionPointcut"/>
      <!-- 异常通知 -->
      <aop:after-throwing method="afterThrowing" pointcut-ref="transactionPointcut"/>
    </aop:aspect>
  </aop:config>
</beans>
```
#### 注解方式
```java
//切面类
@Aspect
@Component
public class TransactionAop {
  @Point(value="execution(* test.spring_aop_anno.*Dao.*(..))"")
  public void point(){
  }
  @Before(value="point()") 
  public void beginTransaction() {
    System.out.println("[前置通知]  开启事务..");
  }
  @AfterReturning(value = "point()") 
  public void commit() {
    System.out.println("[后置通知] 提交事务..");
  }
  @After(value = "point()")
  public void afterReturing(){
    System.out.println("[返回后通知]");
  }
  @AfterThrowing(value = "point()")
  public void afterThrowing(){
    System.out.println("[异常通知]");
  }
  @Around("point()") 
  public void arroud(ProceedingJoinPoint pjp) throws Throwable{
    System.out.println("[环绕前：]");
    pjp.proceed();             // 执行目标方法
    System.out.println("[环绕后：]");
  }
}
```