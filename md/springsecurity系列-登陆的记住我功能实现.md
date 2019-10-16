---
title: springsecurity系列-登陆的记住我功能实现
date: 2019-09-18 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
---

springsecurity系列-登陆的记住我功能实现，springsecurity实现登陆的记住我功能，以及springsecurity记住我功能源码解析。
<!-- more -->

------------
### 记住我基本原理

<img class="avatar" src="/img/security-rememberme.jpg">

对上面的原理图进行简单说明：

- 首先浏览器发送登录请求，也就是认证的请求，首先会进入到 **UsernamePasswordAuthenticationFilter** 过滤器中进行验证操作，验证完成之后，这个过滤器还有一项额外的操作，那就是调用 **RememberMeService** 服务，这个服务中包含一个 **TokenRepository**，它会生成一个Token，并且会将Token写回到浏览器的Cookie中，并使用**TokenRepository** 将用户名和Token写入到数据库中，也就是说，用户名和Token是一一对应的。

- 当用户再次请求的时候，将不会携带用户名和密码，这时候由 **RememberMeAuthenticationFilter** 读取Cookie中的Token来进行验证操作，这时候会使用 **TokenRepository** 从数据库中根据Token来查询相关信息，最后调用 **UserDetailsService** 来登录验证操作。

在security中认证过滤链中的 org.springframework.security.web.authentication.rememberme.RememberMeAuthenticationFilter 过滤器来实现的
<img class="avatar" src="/img/security.jpg">
当没有其他的认证过滤器处理的时候，记住我这个过滤器就尝试工作。

### 记住我功能的实现
首先我们在浏览器的属性类 **BrowserProperties** 中添加一个字段 **rememberMeSeconds**，这个字段用来描述“记住我”的时间期限，具体的配置类代码如下：
```java
@Data
public class BrowserProperties {

    private String loginPage = "/login.html";

    private LoginType loginType = LoginType.JSON;

    private int rememberMeSeconds = 3600;
}

```
修改完这个类之后，它就支持用户自定义配置时间了，这里默认的有效期是一个小时，也就是说在一个小时内重复登录，无需输入用户名和密码。
在浏览器的安全配置类 **BrowserSecurityConfig** 中添加一个Bean，这个Bean就是**TokenRepository**，配置完这个Bean就基本完成了“记住我”功能的开发，然后在将这个Bean设置到configure方法中即可。
具体代码如下：
```java
@Bean
public PersistentTokenRepository tokenRepository() {
    JdbcTokenRepositoryImpl tokenRepository = new JdbcTokenRepositoryImpl();
    tokenRepository.setDataSource(dataSource);
    tokenRepository.setCreateTableOnStartup(true);
    return tokenRepository;
}

```
上面的代码**tokenRepository.setCreateTableOnStartup(true);**是自动创建Token存到数据库时候所需要的表，这行代码只能运行一次，如果重新启动数据库，必须删除这行代码，否则将报错，因为在第一次启动的时候已经创建了表，不能重复创建。其实建议查看**JdbcTokenRepositoryImpl**类中的一个常量字段CREATE_TABLE_SQL，这个字段是描述了建表的一个SQL语句，建议手动复制这个SQL语句建表，那么就完全不需要**tokenRepository.setCreateTableOnStartup(true);**这行代码。建表sql：
```sql
CREATE TABLE persistent_logins (
      username  VARCHAR(64) NOT NULL,
      series    VARCHAR(64) NOT NULL PRIMARY KEY,
      token     VARCHAR(64) NOT NULL,
      last_used TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

```
配置类代码：
```java
/**
 * 浏览器安全验证的配置类
 *
 */
@Configuration
public class BrowserSecurityConfig extends WebSecurityConfigurerAdapter {

    private final SecurityProperties securityProperties;
    private final AuthenticationSuccessHandler lemonAuthenticationSuccessHandler;
    private final AuthenticationFailureHandler lemonAuthenticationFailureHandler;
    private final DataSource dataSource;

    @Autowired
    public BrowserSecurityConfig(SecurityProperties securityProperties, AuthenticationSuccessHandler lemonAuthenticationSuccessHandler, AuthenticationFailureHandler lemonAuthenticationFailureHandler, DataSource dataSource) {
        this.securityProperties = securityProperties;
        this.lemonAuthenticationSuccessHandler = lemonAuthenticationSuccessHandler;
        this.lemonAuthenticationFailureHandler = lemonAuthenticationFailureHandler;
        this.dataSource = dataSource;
    }

    @Autowired
    private UserDetailsService userDetailsService;

    /**
     * 配置了这个Bean以后，从前端传递过来的密码将被加密
     *
     * @return PasswordEncoder实现类对象
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public PersistentTokenRepository tokenRepository() {
        JdbcTokenRepositoryImpl tokenRepository = new JdbcTokenRepositoryImpl();
        tokenRepository.setDataSource(dataSource);
        return tokenRepository;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {

        ValidateCodeFilter validateCodeFilter = new ValidateCodeFilter();
        validateCodeFilter.setAuthenticationFailureHandler(lemonAuthenticationFailureHandler);
        validateCodeFilter.setSecurityProperties(securityProperties);
        validateCodeFilter.afterPropertiesSet();

        http.addFilterBefore(validateCodeFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin()
                .loginPage("/authentication/require")
                .loginProcessingUrl("/authentication/form")
                .successHandler(lemonAuthenticationSuccessHandler)
                .failureHandler(lemonAuthenticationFailureHandler)
                .and()
                .rememberMe()
                .tokenRepository(tokenRepository())
                .tokenValiditySeconds(securityProperties.getBrowser().getRememberMeSeconds())
                .userDetailsService(userDetailsService)
                .and()
                .authorizeRequests()
                .antMatchers("/authentication/require", securityProperties.getBrowser().getLoginPage(), "/code/image").permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .csrf().disable();
    }
}

```
注意上面的代码，重新注入了 **DataSource** 和 **UserDetailsService**，其中 **UserDetailsService** 并没有使用构造器注入，而是字段注入，这是因为 **UserDetailsService** 的实现类中注入了 **PasswordEncoder** 的Bean，这就造成了依赖注入的循环应用问题。
配置完这么多，基本完成了“记住我”的功能，最后还需要在登录页面添加一个checkbox，如下所示：
```html
<tr>
    <td colspan="2"><input name="remember-me" type="checkbox" value="true">记住我</td>
</tr>
```
其中name属性必须是remember-me。

从数据库获取到记住我的token后，验证成功，则通过userDetailsService获取用户信息，然后在框架中写入认证信息，完成登录，
### 源码解析
```java
登录在验证成功之后会调用该方法
org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter#successfulAuthentication

然后委托了 org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices#onLoginSuccess

protected void onLoginSuccess(HttpServletRequest request,
    HttpServletResponse response, Authentication successfulAuthentication) {
  String username = successfulAuthentication.getName();

  logger.debug("Creating new persistent login for user " + username);

  PersistentRememberMeToken persistentToken = new PersistentRememberMeToken(
      username, generateSeriesData(), generateTokenData(), new Date());
  try {
    tokenRepository.createNewToken(persistentToken);
    addCookie(persistentToken, request, response);
  }
  catch (Exception e) {
    logger.error("Failed to save persistent token ", e);
  }
}

携带cookie访问的时候会触发这个方法
org.springframework.security.web.authentication.rememberme.PersistentTokenBasedRememberMeServices#processAutoLoginCookie

里面有验证过期等的逻辑

```
#### 第一次访问

- 第一步：当用户发送登录请求的时候，首先到达的是UsernamePasswordAuthenticationFilter这个过滤器，然后执行attemptAuthentication方法的代码

- 第二步：验证成功之后，将进入AbstractAuthenticationProcessingFilter类的successfulAuthentication的方法中，首先将认证信息通过代码SecurityContextHolder.getContext().setAuthentication(authResult);将认证信息存入到session中，紧接着这个方法中就调用了rememberMeServices的loginSuccess方法

- 第三步：进入rememberMeServices的loginSuccess方法中，可以看出，它方法内部调用了PersistentTokenBasedRememberMeServices的onLoginSuccess方法，这个方法中调用了tokenRepository来创建Token并存到数据库中，且将Token写回到了Cookie中。到这里，基本的登录过程基本完成，生成了Token存到了数据库，且写回到了Cookie中

#### 第二次访问

- 第一步：首先进入到了RememberMeAuthenticationFilter的doFilter方法中，这个方法首先检查在session中是否存在已经验证过的Authentication了，如果为空，就进行下面的RememberMe的验证代码，比如调用rememberMeServices的autoLogin方法

- 第二步：然后进入PersistentTokenBasedRememberMeService的processAutoLoginCookie方法中，从请求中的Cookie中拿到Token，并且调用tokenRepository的getTokenForSeries从数据库中查询到Token，接下来就是进行一系列的对比验证工作。最后调用UserDetailsService来完成返回UserDetails的实现类对象

- 第三步：再次返回到RememberMeAuthenticationFilter中将登录信息存储到session中，然后去访问自定义的RESTful API。