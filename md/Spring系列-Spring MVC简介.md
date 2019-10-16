---
title: Spring系列-Spring MVC简介
date: 2019-08-17 23:54:27
categories:
  - spring
tags:
  - spring
---
Spring系列-Spring MVC，本文介绍spring mvc流程、请求过程、及常用注解等。

<!-- more -->
------------

### MVC流程
Spring MVC 是一个模型 - 视图 - 控制器（MVC）的Web框架建立在中央前端控制器servlet（DispatcherServlet），它负责发送每个请求到合适的处理程序，使用视图来最终返回响应结果的概念。Spring MVC 是 Spring 产品组合的一部分，它享有 Spring IoC容器紧密结合Spring松耦合等特点，因此它有Spring的所有优点。
客户端发送http请求到后端，请求数据返回流程如下：

<img class="avatar" src="/img/mvc流程.png">

- 首先浏览器发送请求——>DispatcherServlet，前端控制器收到请求后自己不进行处理，而是委托给其他的解析器进行处理，作为统一访问点，进行全局的流程控制；
- 由 DispatcherServlet 控制器查询一个或多个 HandlerMapping，找到处理请求的 Controller。
- DispatcherServlet将请求提交到Controller。
- 调用业务处理和返回结果：Controller调用业务逻辑处理后，返回ModelAndView；
- 处理视图映射并返回模型： DispatcherServlet 查询一个或多个ViewResoler 视图解析器， 找到ModelAndView指定的视图。
- ModelAndView --> HTTP响应：视图负责将结果显示到客户端。

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