---
title: Spring系列-Spring IOC
date: 2019-08-17 23:14:27
categories:
  - spring
tags:
  - spring
---
Spring系列-Spring IOC原理简介，本文介绍spring ioc实现原理、bean生命周期、注入方式、bean作用域等。

<!-- more -->


------------
### 概念
Spring 通过一个配置文件描述 Bean 及 Bean 之间的依赖关系，利用 Java 语言的反射功能实例化 Bean 并建立 Bean 之间的依赖关系。 Spring 的 IoC 容器在完成这些底层工作的基础上，还提供 了 Bean 实例缓存、生命周期管理、 Bean 实例代理、事件发布、资源装载等高级服
### spring容器高层视图
Spring 启动时读取应用程序提供的 Bean 配置信息，并在 Spring 容器中生成一份相应的 Bean 配 置注册表，然后根据这张注册表实例化 Bean，装配好 Bean 之间的依赖关系，为上层应用提供准 备就绪的运行环境。其中 Bean 缓存池为 HashMap 实现

### bean作用域
#### singleton
singleton:单例模式(多线程下不安全)，Spring IoC 容器中只会存在一个共享的 Bean 实例，无论有多少个 Bean 引用它，始终指向同一对象。该模式在多线程下是不安全的。Singleton 作用域是 Spring 中的缺省作用域，也可以显示的将 Bean 定义为 singleton 模式，配置为:
```xml
<bean id="userDao" class="com.ioc.UserDaoImpl" scope="singleton"/>
```
#### prototype
prototype:原型模式，每次通过 Spring 容器获取 prototype 定义的 bean 时，容器都将创建 一个新的 Bean 实例，每个 Bean 实例都有自己的属性和状态，而 singleton 全局只有一个对 象。根据经验，对有状态的 bean 使用 prototype 作用域，而对无状态的 bean 使用 singleton 作用域。
#### request
request:在一次 Http 请求中，容器会返回该 Bean 的同一实例。而对不同的 Http 请求则会 产生新的 Bean，而且该 bean 仅在当前 Http Request 内有效,当前 Http 请求结束，该 bean 实例也将会被销毁。
```xml
<bean id="loginAction" class="com.cnblogs.Login" scope="request"/>
```
#### session
session:在一次 Http Session 中，容器会返回该 Bean 的同一实例。而对不同的 Session 请 求则会创建新的实例，该 bean 实例仅在当前 Session 内有效。同 Http 请求相同，每一次 session 请求创建新的实例，而不同的实例之间不共享属性，且实例仅在自己的 session 请求 内有效，请求结束，则实例将被销毁。
```xml
<bean id="userPreference" class="com.ioc.UserPreference" scope="session"/>
```
#### global-session
global Session:在一个全局的 Http Session 中，容器会返回该 Bean 的同一个实例，仅在 使用 portlet context 时有效
### bean生命周期
1. 实例化：实例化一个 Bean，也就是我们常说的 new。
2. IOC 依赖注入：按照 Spring 上下文对实例化的 Bean 进行配置，也就是 IOC 注入。
3. setBeanName 实现：如果这个 Bean 已经实现了 BeanNameAware 接口，会调用它实现的 setBeanName(String)方法，此处传递的就是 Spring 配置文件中 Bean 的 id 值
4. BeanFactoryAware 实现：如果这个 Bean 已经实现了 BeanFactoryAware 接口，会调用它实现的 setBeanFactory， setBeanFactory(BeanFactory)传递的是 Spring 工厂自身(可以用这个方式来获取其它 Bean， 只需在 Spring 配置文件中配置一个普通的 Bean 就可以)。
5. ApplicationContextAware 实现：如果这个 Bean 已经实现了 ApplicationContextAware 接口，会调用 setApplicationContext(ApplicationContext)方法，传入 Spring 上下文(同样这个方式也 可以实现步骤 4 的内容，但比 4 更好，因为 ApplicationContext 是 BeanFactory 的子接 口，有更多的实现方法)
6. postProcessBeforeInitialization 接口实现-初始化预处理：如果这个 Bean 关联了 BeanPostProcessor 接口，将会调用 postProcessBeforeInitialization(Object obj, String s)方法，BeanPostProcessor 经常被用 作是 Bean 内容的更改，并且由于这个是在 Bean 初始化结束时调用那个的方法，也可以被应 用于内存或缓存技术。
7. init-method： 如果 Bean 在 Spring 配置文件中配置了 init-method 属性会自动调用其配置的初始化方法。
8. postProcessAfterInitialization：如果这个 Bean 关联了 BeanPostProcessor 接口，将会调用 postProcessAfterInitialization(Object obj, String s)方法。 注:以上工作完成以后就可以应用这个 Bean 了，那这个 Bean 是一个 Singleton 的，所以一 般情况下我们调用同一个 id 的 Bean 会是在内容地址相同的实例，当然在 Spring 配置文件中 也可以配置非 Singleton。
9. Destroy 过期自动清理阶段：当 Bean 不再需要时，会经过清理阶段，如果 Bean 实现了 DisposableBean 这个接口，会调
用那个其实现的 destroy()方法;
10. destroy-method 自配置清理：最后，如果这个 Bean 的 Spring 配置中配置了 destroy-method 属性，会自动调用其配置的销毁方法。
11. bean 标签有两个重要的属性(init-method 和 destroy-method)。用它们你可以自己定制 初始化和注销方法。它们也有相应的注解(@PostConstruct 和@PreDestroy)。
```xml
<bean id="" class="" init-method="初始化方法" destroy-method="销毁方法">
```

### 依赖注入方式

#### 构造器注入
```java
/*带参数，方便利用构造器进行注入*/ public CatDaoImpl(String message){
this. message = message; }
<bean id="CatDaoImpl" class="com.CatDaoImpl"> <constructor-arg value=" message "></constructor-arg>
</bean>
```
#### setter注入
```java
public class Id {
private int id;
public int getId() { return id; }
public void setId(int id) { this.id = id; }
}
```
```xml
<bean id="id" class="com.id "> <property name="id" value="123"></property> </bean>
```
#### 静态工厂注入
静态工厂顾名思义，就是通过调用静态工厂的方法来获取自己需要的对象，为了让 spring 管理所 有对象，我们不能直接通过"工程类.静态方法()"来获取对象，而是依然通过 spring 注入的形式获 取:
```java
public class DaoFactory { //静态工厂
public static final FactoryDao getStaticFactoryDaoImpl(){
return new StaticFacotryDaoImpl(); }
}
public class SpringAction {
private FactoryDao staticFactoryDao; //注入对象 //注入对象的 set 方法
public void setStaticFactoryDao(FactoryDao staticFactoryDao) { this.staticFactoryDao = staticFactoryDao;
} }
//factory-method="getStaticFactoryDaoImpl"指定调用哪个工厂方法 <bean name="springAction" class=" SpringAction" >

```
```xml
<!--使用静态工厂的方法注入对象,对应下面的配置文件-->
<property name="staticFactoryDao" ref="staticFactoryDao"></property>
</bean>
<!--此处获取对象的方式是从工厂类中获取静态方法--> <bean name="staticFactoryDao" class="DaoFactory" factory-method="getStaticFactoryDaoImpl"></bean>
```
#### 实例工厂注入
实例工厂的意思是获取对象实例的方法不是静态的，所以你需要首先 new 工厂类，再调用普通的 实例方法:
```java
public class DaoFactory { //实例工厂 public FactoryDao getFactoryDaoImpl(){
return new FactoryDaoImpl();
	} }
public class SpringAction {
private FactoryDao factoryDao; //注入对象
public void setFactoryDao(FactoryDao factoryDao) { this.factoryDao = factoryDao;
} }
```
```xml
<bean name="springAction" class="SpringAction"> <!--使用实例工厂的方法注入对象,对应下面的配置文件--> <property name="factoryDao" ref="factoryDao"></property>
</bean> <!--此处获取对象的方式是从工厂类中获取实例方法-->
<bean name="daoFactory" class="com.DaoFactory"></bean> <bean name="factoryDao" factory-bean="daoFactory"
factory-method="getFactoryDaoImpl"></bean>
```

### 自动装配方式
Spring 装配包括手动装配和自动装配，手动装配是有基于 xml 装配、构造方法、setter 方法等 自动装配有五种自动装配的方式，可以用来指导 Spring 容器用自动装配方式来进行依赖注入。
1. no:默认的方式是不进行自动装配，通过显式设置 ref 属性来进行装配。
2. byName:通过参数名 自动装配，Spring 容器在配置文件中发现 bean 的 autowire 属性被设
置成 byname，之后容器试图匹配、装配和该 bean 的属性具有相同名字的 bean。
3. byType:通过参数类型自动装配，Spring 容器在配置文件中发现 bean 的 autowire 属性被 设置成 byType，之后容器试图匹配、装配和该 bean 的属性具有相同类型的 bean。如果有多
个 bean 符合条件，则抛出错误。
4. constructor:这个方式类似于 byType， 但是要提供给构造器参数，如果没有确定的带参数
  的构造器参数类型，将会抛出异常。
5. autodetect:首先尝试使用 constructor 来自动装配，如果无法工作，则使用 byType 方式。
