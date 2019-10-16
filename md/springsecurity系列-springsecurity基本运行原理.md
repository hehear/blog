---
title: springsecurity系列-springsecurity基本运行原理
date: 2019-09-17 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
---

springsecurity系列-springsecurity基本运行原理，及个性化登陆实现验证。
<!-- more -->

------------
### springsecurity基本原理

springsecurity的整个工作流程如下所示：
<img class="avatar" src="/img/springsecurity.jpg">

- 其中绿色部分的每一种过滤器代表着一种认证方式，主要工作检查当前请求有没有关于用户信息，如果当前的没有，就会跳入到下一个绿色的过滤器中，请求成功会打标记。绿色认证方式可以配置，比如短信认证，微信。比如如果我们不配置 **BasicAuthenticationFilter** 的话，那么它就不会生效。

- **FilterSecurityInterceptor** 过滤器是最后一个，它会决定当前的请求可不可以访问Controller，判断规则放在这个里面。当不通过时会把异常抛给在这个过滤器的前面的 **ExceptionTranslationFilter** 过滤器。

- **ExceptionTranslationFilter** 接收到异常信息时，将跳转页面引导用户进行认证。橘黄色和蓝色的位置不可更改。当没有认证的request进入过滤器链时，首先进入到 **FilterSecurityInterceptor**，判断当前是否进行了认证，如果没有认证则进入到 **ExceptionTranslationFilter**，进行抛出异常，然后跳转到认证页面（登录界面）。


### 自定义用户认证
**springsecurity** 将用户信息的获取逻辑封装在一个接口里面，这个接口是 **UserDetailsService**,这个接口只有一个方法：
```java
UserDetails loadUserByUsername(String username) throws UsernameNotFoundException
```
自定义用户认证即实现 **UserDetailsService**接口，重写 **loadUserByUsername**方法。

这个方法需要传递一个参数，这个参数是username，通过username就可以去数据库查询用户信息，如果查询到，就可以将查询到的相关信息封装到UserDetail的一个实现类对象中，并返回，然后就可以交给Spring Security进行认证，如果没有查到，将抛出 **UsernameNotFoundException** 异常。返回的用户对象是User，它是 **org.springframework.security.core.userdetails.User** 提供的实体类，这个实体类有几个成员属性，分别是：
```java
private String password;  // 数据库中查询到的密码；
private final String username;  // 用户输入的用户名；
private final Set<GrantedAuthority> authorities;  // 授权列表；
private final boolean accountNonExpired;  // 当前账户是否过期；
private final boolean accountNonLocked;  // 账户是否被锁定；
private final boolean credentialsNonExpired;  // 账户的认证时间是否过期；
private final boolean enabled;  // 账户是否有效。

```
这个实体类有两个构造方法，分别是：
```java
public User(String username, String password,
			Collection<? extends GrantedAuthority> authorities) {
		this(username, password, true, true, true, true, authorities);
	}

public User(String username, String password, boolean enabled,
			boolean accountNonExpired, boolean credentialsNonExpired,
			boolean accountNonLocked, Collection<? extends GrantedAuthority> authorities) {

		if (((username == null) || "".equals(username)) || (password == null)) {
			throw new IllegalArgumentException(
					"Cannot pass null or empty values to constructor");
		}

		this.username = username;
		this.password = password;
		this.enabled = enabled;
		this.accountNonExpired = accountNonExpired;
		this.credentialsNonExpired = credentialsNonExpired;
		this.accountNonLocked = accountNonLocked;
		this.authorities = Collections.unmodifiableSet(sortAuthorities(authorities));
	}

```
自定义实现代码：
```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 */
@Component
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserDetailsServiceImpl(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("登陆用户名： {}", username);
        // 这里可以根据用户名到数据库中查询用户,获得数据库中得到的密码（这里不进行查询操作，使用固定代码）
        // 在实际的开发中，存到数据库的密码不是明文的，而是经过加密的
        String password = "123456";
        String encodedPassword = passwordEncoder.encode(password);
        log.info("加密后的密码为： {}", encodedPassword);
        // 这里查询该账户是否过期，这里使用固定代码，假设没有过期
        boolean accountNonExpired = true;
        // 这里查询该账户被删除，假设没有被删除
        boolean enabled = true;
        // 这里查询该账户认证是否过期，假设没有过期
        boolean credentialsNonExpired = true;
        // 查询该账户是否被锁定，假设没有被锁定
        boolean accountNonLocked = true;
        // 关于密码的加密，应该是在创建用户的时候进行的，这里仅仅是举例模拟
        return new User(username, encodedPassword,
                enabled, accountNonExpired,
                credentialsNonExpired, accountNonLocked,
                AuthorityUtils.commaSeparatedStringToAuthorityList("admin"));
    }
}

```
注入 **PasswordEncoder**，Spring管理：
```java
/**
 * 配置了这个Bean以后，从前端传递过来的密码将被加密
 *
 * @return PasswordEncoder实现类对象
 */
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}

```

### 个性化用户认证

在实际的开发中，对于用户的登录认证，不可能使用Spring Security自带的方式或者页面，需要自己定制适用于项目的登录流程。开发一个模块，支持用户在配置文件中配置自己的登录页面，如果用户配置了，则采用用户自己的页面，否则采用模块内置的登录页面。

#### 自定义登陆页面
对于用户自定义的登录行为，往往是登录后跳转或者是登录后返回提示用户签到等信息，开发者要编写一个类来继承WebSecurityConfigurerAdapter从而实现自定义的登录行为，并且要重写configure方法。这里先把代码贴出来，然后逐一说明。

```java
import com.lemon.security.core.properties.SecurityProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

/**
 * 浏览器安全验证的配置类
 *
 */
@Configuration
public class BrowserSecurityConfig extends WebSecurityConfigurerAdapter {

    private final SecurityProperties securityProperties;
    private final AuthenticationSuccessHandler lemonAuthenticationSuccessHandler;
    private final AuthenticationFailureHandler lemonAuthenticationFailureHandler;

    @Autowired
    public BrowserSecurityConfig(SecurityProperties securityProperties, AuthenticationSuccessHandler lemonAuthenticationSuccessHandler, AuthenticationFailureHandler lemonAuthenticationFailureHandler) {
        this.securityProperties = securityProperties;
        this.lemonAuthenticationSuccessHandler = lemonAuthenticationSuccessHandler;
        this.lemonAuthenticationFailureHandler = lemonAuthenticationFailureHandler;
    }

    /**
     * 配置了这个Bean以后，从前端传递过来的密码将被加密
     *
     * @return PasswordEncoder实现类对象
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.formLogin()
                .loginPage("/authentication/require")
                .loginProcessingUrl("/authentication/form")
                .successHandler(lemonAuthenticationSuccessHandler)
                .failureHandler(lemonAuthenticationFailureHandler)
                .and()
                .authorizeRequests()
                .antMatchers("/authentication/require", securityProperties.getBrowser().getLoginPage()).permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .csrf().disable();
    }
}

```
现在主要讲解重写的 **configure** 方法：

- **http.formLogin()**指定的表单登录方式。

- **loginPage("/authentication/require")**设置了登录页面，这里将URL指向了一个Controller，这个Controller可以根据用户的设置选择传递JSON数据还是返回一个登录页面。

- **loginProcessingUrl("/authentication/form")**是更改了 **UsernamePasswordAuthenticationFilter** 默认的处理表单登录的/login的API，现在前端的form标签的action就可以写**/authentication/form**而不是固定的/login了

- **successHandler(lemonAuthenticationSuccessHandler)**指定了登录成功后的处理逻辑，一般都是跳转或者返回一个JSON数据。

- **failureHandler(lemonAuthenticationFailureHandler)**指定了登录失败后的处理逻辑，一般是是跳转或者返回一个JSON数据。

- **antMatchers("/authentication/require", securityProperties.getBrowser().getLoginPage()).permitAll()**意思是指**/authentication/require**和登录页面的请求无需验证权限。

- **csrf().disable()**是指关闭跨站请求伪造的防护，这里是为了前期开发方便，关闭它。

整体描述：当用户访问系统的**RESTful API**的时候，第一次访问会检查当前访问的用户有没有权限访问，如果没有权限，就会进入到 **BrowserSecurityConfig** 的 **configure** 方法中，从而进入到 **/authentication/require **的Controller方法中判断用户是否是访问HTML，如果是则跳转到登陆页面，否则返回一段JSON数据提示用户登录。这里还自定义配置了用户登陆成功和失败的处理逻辑，对于**/authentication/require**和登录页面的请求则无需验证权限，否则将陷进死循环中。

根据**/authentication/require**，编写一个Controller，来控制是跳转到登陆页面还是返回一段JSON，代码如下：

```java
/**
 */
@RestController
@Slf4j
public class BrowserSecurityController {

    private RequestCache requestCache = new HttpSessionRequestCache();

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    private static final String HTML = ".html";

    private final SecurityProperties securityProperties;

    @Autowired
    public BrowserSecurityController(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    /**
     * 当需要进行身份认证的时候跳转到此方法
     *
     * @param request  请求
     * @param response 响应
     * @return 将信息以JSON形式返回给前端
     */
    @RequestMapping("/authentication/require")
    @ResponseStatus(code = HttpStatus.UNAUTHORIZED)
    public SimpleResponse requireAuthentication(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 从session缓存中获取引发跳转的请求
        SavedRequest savedRequest = requestCache.getRequest(request, response);
        if (null != savedRequest) {
            String redirectUrl = savedRequest.getRedirectUrl();
            log.info("引发跳转的请求是：{}", redirectUrl);
            if (StringUtils.endsWithIgnoreCase(redirectUrl, HTML)) {
                // 如果是HTML请求，那么就直接跳转到HTML，不再执行后面的代码
                redirectStrategy.sendRedirect(request, response, securityProperties.getBrowser().getLoginPage());
            }
        }
        return new SimpleResponse("访问的服务需要身份认证，请引导用户到登录页面");
    }
}

```
当用户没有登录就访问某些API的时候，就会被引导进入此Controller，这里仅仅是模拟了用户如果是访问的HTML的话，就引导它到登录页面，如果是AJAX发送的请求的，往往需要返回JSON数据到前端。当用户访问的是HTML的时候，**securityProperties.getBrowser().getLoginPage()**就决定了用户是跳转到自定义的登录页面，还是此项目中自带的登录页面中。请看下面的配置类：
```java
@Data
public class BrowserProperties {

    private String loginPage = "/login.html";

    private LoginType loginType = LoginType.JSON;
}
```
这里提供的是项目中自带的登录页面，在loginPage变量中给定了默认值，通过下面的代码从配置文件中读取：
```java

/**
 */
@Data
@ConfigurationProperties(prefix = "com.lemon.security")
public class SecurityProperties {

    private BrowserProperties browser = new BrowserProperties();
}

```
为了使这个读取配置的类生效，需要写一个类：
```java
@Configuration
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityCoreConfig {
}
```
至于用户自定义界面，可以在application.xml配置，具体的配置如下：
```xml
# 配置自定义的登录页面
com.lemon.security.browser.loginPage= /my-login.html
```
#### 自定义登录成功处理

用户登录成功后，**Spring Security**的默认处理方式是跳转到原来的链接上，这也是企业级开发的常见方式，但是有时候采用的是AJAX方式发送的请求，往往需要返回JSON数据，所以这里给出了简单的登录成功的案例：
```java
@Component("lemonAuthenticationSuccessHandler")
@Slf4j
public class LemonAuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    private final ObjectMapper objectMapper;
    private final SecurityProperties securityProperties;

    @Autowired
    public LemonAuthenticationSuccessHandler(ObjectMapper objectMapper, SecurityProperties securityProperties) {
        this.objectMapper = objectMapper;
        this.securityProperties = securityProperties;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        log.info("登录成功");
        if (LoginType.JSON.equals(securityProperties.getBrowser().getLoginType())) {
            // 如果用户自定义了处理成功后返回JSON（默认方式也是JSON），那么这里就返回JSON
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(authentication));
        } else {
            // 如果用户定义的是跳转，那么就使用父类方法进行跳转
            super.onAuthenticationSuccess(request, response, authentication);
        }
    }
}

```
**SavedRequestAwareAuthenticationSuccessHandler** 是Spring Security默认的成功处理器，默认是跳转。这里将认证信息作为JSON数据进行了返回，也可以返回其他数据，这个是根据业务需求来定的，同样，这里也是配置了用户的自定义的登录类型，要么是跳转，要么是JSON，**securityProperties.getBrowser().getLoginType()**决定了登录的类型，默认是JSON，如果需要跳转，也是需要在XML配置文件中进行配置的。
```java
# 配置自定义成功和错误处理方式
com.lemon.security.browser.loginType = REDIRECT
```
#### 自定义登录失败处理
```java
/**
 * {@link SimpleUrlAuthenticationFailureHandler}是Spring Boot默认的失败处理器
 *
 */
@Component("lemonAuthenticationFailureHandler")
@Slf4j
public class LemonAuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final ObjectMapper objectMapper;
    private final SecurityProperties securityProperties;

    @Autowired
    public LemonAuthenticationFailureHandler(ObjectMapper objectMapper, SecurityProperties securityProperties) {
        this.objectMapper = objectMapper;
        this.securityProperties = securityProperties;
    }
    
    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {
        log.info("登录失败");
        if (LoginType.JSON.equals(securityProperties.getBrowser().getLoginType())) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(exception));
        } else {
            // 如果用户配置为跳转，则跳到Spring Boot默认的错误页面
            super.onAuthenticationFailure(request, response, exception);
        }
    }
}

```
