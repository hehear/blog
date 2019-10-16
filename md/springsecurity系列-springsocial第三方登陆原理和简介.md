---
title: springsecurity系列-springsocial第三方登陆原理和简介
date: 2019-09-19 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
  - springsocial
  - oauth
---

springsecurity系列-springsocial第三方登陆原理和简介，介绍OAuth协议，然后基于Spring Social来阐述开发第三方登录需要做哪些准备工作。
<!-- more -->

------------
### OAuth协议简介

#### OAuth协议诞生背景
考虑这样一个场景：假如开发一个APP图片美化，需要用户存储在微信上的数据；传统的做法是：拿到用户的用户名密码，其中存在的问题：

- 应用可以访问用户在微信上的所有数据；（不能做到读授权一部分功能权限）

- 只能修改密码才能收回授权

- 密码泄露可能性提高

**OAuth**的诞生就是为了解决上面的问题，它从另一个角度实现了免密授权，大大提高了用户隐私信息的安全性。开放授权（**OAuth**）是一个开放标准，允许用户让第三方应用访问该用户在某一网站上存储的私密的资源（如照片，视频，联系人列表），而无需将用户名和密码提供给第三方应用。

**OAuth**允许用户提供一个令牌，而不是用户名和密码来访问他们存放在特定服务提供者的数据。每一个令牌授权一个特定的网站（例如，视频编辑网站）在特定的时段（例如，接下来的2小时内）内访问特定的资源（例如仅仅是某一相册中的视频）。这样，**OAuth**让用户可以授权第三方网站访问他们存储在另外服务提供者的某些特定信息，而非所有内容。

**OAuth**要使用**Token**令牌来解决以上的问题：

- 令牌绑定权限

- 令牌有过期时间

- 不需要用户的原始密码

#### OAuth协议中的角色关系

**OAuth**协议的角色关系图：

<img class="avatar" src="/img/oauth.jpg">

- **Third-party application**：第三方应用程序，本文中又称“客户端”（client），即第三方服务提供商。

- **HTTP service provider**：HTTP服务提供商，本文中简称“服务提供商”，即上一节例子中的百度云盘。

- **Resource Owner**：资源所有者，本文中又称“用户”（user）。

- **User Agent**：用户代理，本文中就是指浏览器。

- **Authorization server**：认证服务器，即服务提供商专门用来处理认证的服务器。

- **Resource server**：资源服务器，即服务提供商存放用户生成的资源的服务器。它与认证服务器，可以是同一台服务器，也可以是不同的服务器

**OAuth**协议的执行流程：

- 用户打开客户端以后，客户端要求用户给予授权。

- 用户同意给予客户端授权。

- 客户端使用上一步获得的授权，向认证服务器申请令牌。

- 认证服务器对客户端进行认证以后，确认无误，同意发放令牌。

- 客户端使用令牌，向资源服务器申请获取资源。

- 资源服务器确认令牌无误，同意向客户端开放资源。

#### OAuth授权模式
Auth2.0协议提供了四种授权模式，它们分别是：

- 授权码模式（**authorization code**）

- 简化模式（**implicit**）

- 密码模式（**resource owner password credentials**）

- 客户端模式（**client credentials**）

##### 授权码模式

其中，授权码模式（**authorization code**）是功能最完整、流程最严密的授权模式。它的特点就是通过客户端的后台服务器，与“服务提供商”的认证服务器进行互动。授权码模式流程图如下所示：

<img class="avatar" src="/img/authcode.jpg">

授权码模式的基本步骤如下：

- 用户访问客户端，客户端将用户导向认证服务器。

- 认证服务器向客户端发送授权询问请求，用户选择是否给予客户端授权。

- 假设用户给予授权，认证服务器将用户导向客户端事先指定的“重定向URI”（**redirection URI**），同时附上一个授权码。

- 客户端收到授权码，附上早先的“重定向URI”，向认证服务器申请令牌。注意：这一步是在客户端的后台的服务器上完成的，对用户不可见，用户是无感的。

- 认证服务器核对了授权码和重定向URI，确认无误后，向客户端发送访问令牌（**access token**）和更新令牌（**refresh token**）。

##### 简化模式
简化模式（**implicit grant type**）不通过第三方应用程序的服务器，直接在浏览器中向认证服务器申请令牌，跳过了“授权码”这个步骤，因此得名。所有步骤在浏览器中完成，令牌对访问者是可见的，且客户端不需要认证。

简化模式的基本步骤如下：

- 客户端将用户导向认证服务器。

- 用户决定是否给于客户端授权。

- 假设用户给予授权，认证服务器将用户导向客户端指定的“重定向URI”，并在URI的Hash部分包含了访问令牌。

- 浏览器向资源服务器发出请求，其中不包括上一步收到的Hash值。

- 资源服务器返回一个网页，其中包含的代码可以获取Hash值中的令牌。

- 浏览器执行上一步获得的脚本，提取出令牌。

- 浏览器将令牌发给客户端。

#### 密码模式
密码模式（**Resource Owner Password Credentials Grant**）中，用户向客户端提供自己的用户名和密码。客户端使用这些信息，向“服务商提供商”索要授权。在这种模式中，用户必须把自己的密码给客户端，但是客户端不得储存密码。这通常用在用户对客户端高度信任的情况下，比如客户端是操作系统的一部分，或者由一个著名公司出品。而认证服务器只有在其他授权模式无法执行的情况下，才能考虑使用这种模式。

密码模式的基本步骤如下：

- 用户向客户端提供用户名和密码。

- 客户端将用户名和密码发给认证服务器，向后者请求令牌。

- 认证服务器确认无误后，向客户端提供访问令牌。

#### 客户端模式

客户端模式（**Client Credentials Grant**）指客户端以自己的名义，而不是以用户的名义，向"服务提供商"进行认证。严格地说，客户端模式并不属于**OAuth**框架所要解决的问题。在这种模式中，用户直接向客户端注册，客户端以自己的名义要求"服务提供商"提供服务，其实不存在授权问题。

客户端模式的基本步骤如下：

- 客户端向认证服务器进行身份认证，并要求一个访问令牌。

- 认证服务器确认无误后，向客户端提供访问令牌。

### Spring Social简介
**Spring Security**认证成功的标准是在**SecurityContext**中存储了用户相关的**Authentication**实例对象，也就是说当一个用户提供了正确信息给系统，系统带着用户的信息完成了一系列的校验后，校验通过后，将生成用户信息相关的**Authentication**存储到**SecurityContext**中。

那么如果使用第三方登录，使用第三方如QQ、微信的用户信息进行登录验证，这是如何做到的呢？道理也是一样的，就是拿到第三方的用户信息，使用第三方的用户信息构建**Authentication**实例对象，并存储到**SecurityContext**中，而在获取第三方用户信息的时候，必须遵循**OAuth**协议，OAuth协议规定的流程，必须严格执行，那么**Spring Social**的作用就凸显了，它诞生的一个很大作用就是封装了**OAuth**协议规定的基础流程。

#### 基本原理
<img class="avatar" src="/img/springsocial.jpg">

**Spring Social**已经将前五步封装了，开发者开发特定第三方登录验证，只需要实现第六步和第七步即可，最后组成一个**SocialAuthenticationFilter**集成到整个验证的过滤器链上，当用户选择第三方登录的时候，就会被该过滤器拦截，在过滤器中获取第三方用户信息，构建用户信息相关的**Authentication**实例对象并存储到**SecurityContext**中。

<img class="avatar" src="/img/socialfilter.jpg">

基于我们之前学习过的过滤链原理，在过滤器链上增加了一个 SocialAuthenticationFilter，拦截到有需要第三方登录的请求则开始引导完成所有的流程，就完成了第三方登录

#### 代码实现
**Spring Social**代码实现流程：

<img class="avatar" src="/img/socialcode.jpg">

我们讲解的顺序是从右往左讲，对图片上的每一个类或者接口都进行一个详细的讲解。

- **ServiceProvider**：它是一个接口，在包**org.springframework.social**下，它的存在就是为了适配不同的第三方服务提供商，比如QQ、微信等。如果我们需要开发QQ登录，那么我们就需要为QQ提供一个特定的**ServiceProvider**，而这个接口下有一个抽象实现**AbstractOAuth2ServiceProvider**，我们为QQ写**ServiceProvider**的时候只需要继承**AbstractOAuth2ServiceProvider**类即可。抽象类**AbstractOAuth2ServiceProvider**有两个属性**OAuth2Operations**和**Api**，接下来分别介绍它们的作用。

- **OAuth2Operations**：它是一个接口，在包**org.springframework.social.oauth2**下，它封装了**OAuth**协议的前五步，也就是用户授权，直到应用拿到第三方应用（QQ、微信）的访问令牌，该接口有一个实现类**OAuth2Template**，**OAuth2Template**完成了访问第三方应用认证服务器、获取授权码、携带授权码申请令牌、获取令牌等核心步骤，在这里，我们需要做的仅仅是配置一些特定第三方认证服务器的URL即可，因为整个流程是遵循**OAuth**协议的，所以这些核心步骤需要携带的参数都是公共的，对开发者透明的。

- **Api**：在包**org.springframework.social**下有一个**ApiBinding**接口，它主要是为了帮助开发者完成第六步的一个接口，由于每一个第三方应用的用户信息都是有区别的，比如用户头像的字段，在QQ里面叫head_image，也许到了微信里面，就叫image了，所以这里是一个个性化的开发区域，需要对每一个第三方服务提供商开发一个特定的类来实现用户数据的获取，这里**Spring Social**提供了一个抽象类**AbstractOAuth2ApiBinding**，尽可能地减少我们的开发成本，我们在开发获取用户信息的代码的时候，只需要继承这个抽象类即可。

以上的三段描述将与第三方服务提供商相关类和接口介绍完毕，那么我们与第三方服务提供商交互完毕，拿到了用户数据以后，那么该如何完成认证的操作呢？那么就得继续来介绍上图左边的相关类和接口。

- **Connection**：它是一个接口，在包**org.springframework.social.connect**下，它封装了与用户相关的信息，这些信息，比如DisplayName（显示名称），ProfileUrl（主页地址），ImageUrl（头像地址）等基本信息，这些信息是Spring Social所规定的用户信息（固定字段），它有一个实现类**OAuth2Connection**，也就是说我们如何将拿到的用户信息转换成**OAuth2Connection**所封装的用户信息呢？那么就必须得讲解一下生成**Connection**实现类对象的工厂**ConnectionFactory**。

- **ConnectionFactory**：它是一个接口，在包**org.springframework.social.connect**下，它有一个实现类**OAuth2ConnectionFactory**，该类就可以完成对Connection的创建，而在**OAuth2ConnectionFactory**的构造方法中，就用到了**ServiceProvider**和ApiAdapter。**ServiceProvider**就是我们之前为特定第三方服务提供商编写的代码，它提供了从第三方服务提供商获取用户信息，**ApiAdapter**是一个适配器，主要是完成了从第三方服务提供商获取到的用户信息到**Spring Social**规定的用户信息的转换工作，这个适配器也是需要我们自己编写的内容之一。那么有了**ServiceProvider**和ApiAdapter，就可以构建**OAuth2ConnectionFactory**对象，那么就可以来创建Connection的实现类对象了。

- **UserConnection**：**UserConnection**是Spring Social规定的一张数据库表。当用户在登录系统的时候，选择的是QQ登录或者微信登录，那么系统是如何辨别该用户使用QQ号登录的时候，它对应到系统中的一个用户呢？也就是说用户使用的第三方账户A登录，系统是如何做到与业务系统里面的“张三”关联起来的呢？那么这个功劳就应该归属于**UserConnection**表了，它就是专门用来记录第三方账户和业务系统内的账户之间的关系的一张表。

- **UsersConnectionRepository**：它是一个接口，在包**org.springframework.social.connect**下，它专门封装了**UserConnection**表的一些基础操作，他有一个默认实现类**JdbcUsersConnectionRepository**，在该类的包下，有一个**JdbcUsersConnectionRepository.sql**文件，这个文件中有创建表的语句，需要我们自己拷贝出来创建对应的数据库表，该表名可以是**UserConnection**，也可以在该名称之前加上一个前缀。这里贴出创建表的语句：
```sql
create table UserConnection (userId varchar(255) not null,
	providerId varchar(255) not null,
	providerUserId varchar(255),
	rank int not null,
	displayName varchar(255),
	profileUrl varchar(512),
	imageUrl varchar(512),
	accessToken varchar(512) not null,
	secret varchar(512),
	refreshToken varchar(512),
	expireTime bigint,
	primary key (userId, providerId, providerUserId));
create unique index UserConnectionRank on UserConnection(userId, providerId, rank);
```
这里就完成了对Spring Social集成第三方登录需要开发内容的基本介绍。