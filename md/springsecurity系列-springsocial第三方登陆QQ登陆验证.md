---
title: springsecurity系列-springsocial第三方登陆QQ登陆验证
date: 2019-09-24 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
  - springsocial
---

springsecurity系列-springsocial第三方登陆QQ登陆验证，介绍Spring Social集成QQ登录的一个完整的开发流程。
<!-- more -->

------------
### 获取qq信息

**Spring Social**封装了**OAuth**协议的标准步骤，我们只需要配置第三方应用的认证服务器地址即可，就可以获取到访问令牌**Access Token**，拿着这个令牌就可以获取到用户信息了，QQ互联的文档中介绍到，要正确获取到用户的基础信息之前，还需要通过**Access Token**来获取到用户的**OpenID**，这个**OpenID**是每一个用户使用QQ登录到你的系统都会产生一个唯一的ID。

qq官方api：[qq官方获取用户信息api](https://wiki.connect.qq.com/api%E5%88%97%E8%A1%A8 "qq官方获取用户信息api")

#### 获取OpenID
获取**OpenID** **api**：

|  内容 |  说明 |
| :------------: | :------------: |
| 请求URL  |  https://graph.qq.com/oauth2.0/me |
|  请求方法 | GET  |
| 请求参数  |  access_token |
| 返回内容  | callback( {“client_id”:“YOUR_APPID”,“openid”:“YOUR_OPENID”} );  |

#### 获取用户信息
根据**OpenID**获取用户信息**api**：

|  内容 |  说明 |
| :------------: | :------------: |
| 请求URL  |  https://graph.qq.com/user/get_user_info |
|  请求方法 | GET  |
| 请求参数  |  access_token=ACCESS_TOKEN&oauth_consumer_key=APP_ID&openid=OPENID |
| 返回内容  | 返回内容是JSON格式的字符串  |

### 代码流程
开发流程如下，对着图片开发相应的模块。
<img class="avatar" src="/img/socialcode.jpg">

#### api

##### qq接口
```java
/**
 * 获取QQ用户信息的接口
 *
 */
public interface QQ {

    /**
     * 获取QQ用户的信息
     *
     * @return QQ用户信息
     */
    QQUserInfo getUserInfo();

}

```
##### QQUserInfo实体
实体类QQUserInfo则是封装了从腾讯服务器获取到的用户基础信息，具体的代码如下所示：
```java
/**
 * QQ用户信息
 *
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class QQUserInfo {

    /**
     * 用户的OpenId
     */
    private String openId;

    /**
     * 返回码
     */
    private Integer ret;

    /**
     * 返回消息，如果ret<0，会有相应的错误信息提示，返回数据全部用UTF-8编码
     */
    private String msg;

    /**
     * 是否丢失0否，1是
     */
    @JsonProperty("is_lost")
    private Integer isLost;

    /**
     * 用户在QQ空间的昵称
     */
    private String nickname;

    /**
     * 大小为30×30像素的QQ空间头像URL
     */
    @JsonProperty("figureurl")
    private String figureUrl30;

    /**
     * 大小为50×50像素的QQ空间头像URL
     */
    @JsonProperty("figureurl_1")
    private String figureUrl50;

    /**
     * 大小为100×100像素的QQ空间头像URL
     */
    @JsonProperty("figureurl_2")
    private String figureUrl100;

    /**
     * 大小为40×40像素的QQ头像URL
     */
    @JsonProperty("figureurl_qq_1")
    private String figureUrlQq40;

    /**
     * 大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有
     */
    @JsonProperty("figureurl_qq_2")
    private String figureUrlQq100;

    /**
     * 性别。 如果获取不到则默认返回"男"
     */
    private String gender;

    /**
     * 省份
     */
    private String province;

    /**
     * 城市
     */
    private String city;

    /**
     * 出生年份
     */
    private String year;

    /**
     * 星座
     */
    private String constellation;

    /**
     * 是否是黄钻，0否，1是
     */
    @JsonProperty("is_yellow_vip")
    private String isYellowVip;

    /**
     * 是否是会员，0否，1是
     */
    private String vip;

    /**
     * 黄钻等级
     */
    @JsonProperty("yellow_vip_level")
    private String yellowVipLevel;

    /**
     * 等级
     */
    private String level;

    /**
     * 是否是黄钻年费VIP，0否，1是
     */
    @JsonProperty("is_yellow_year_vip")
    private String isYellowYearVip;

}

```
上面的代码中，使用Jackson将JSON字符串序列化为QQUserInfo实例对象的时候，将带有下划线的字段值映射到了对应的驼峰字段上，使用的Jackson的@JsonProperty注解来完成的。

##### qq接口实现
```java
/**
 * 获取QQ用户信息的实现类
 *
 */
@Slf4j
public class QQImpl extends AbstractOAuth2ApiBinding implements QQ {

    /**
     * Open ID的获取链接，它需要传递令牌，也就是OAuth协议的前五步获取到的数据访问令牌
     */
    private static final String URL_GET_OPEN_ID = "https://graph.qq.com/oauth2.0/me?access_token=%s";

    /**
     * 获取用户信息的链接：https://graph.qq.com/user/get_user_info?access_token=YOUR_ACCESS_TOKEN&oauth_consumer_key=YOUR_APP_ID&openid=YOUR_OPENID
     * 其中，access_token会被父类AbstractOAuth2ApiBinding处理，在请求之前，会被拼接到请求链接中，故这里删除即可
     */
    private static final String URL_GET_USER_INFO = "https://graph.qq.com/user/get_user_info?oauth_consumer_key=%s&openid=%s";

    /**
     * appId是腾讯要求的应用ID，需要开发者去QQ互联上申请，对应的参数字段是oauth_consumer_key
     */
    private String appId;

    /**
     * openId是腾讯对应用和用户之间的关系管理的一个参数，用户在一个应用的openID唯一
     */
    private String openId;

    private ObjectMapper objectMapper = new ObjectMapper();

    public QQImpl(String accessToken, String appId) {
        // 这里的父类构造方法传入两个参数，第二个参数的意思是在构造方法中构建restTemplate的时候，将accessToken作为请求参数集成到请求链接中
        // 父类的默认构造也就是一个参数的构造，默认行为是将参数放到了请求头中，这个就和QQ的API接口要求的传参方式不一样了
        super(accessToken, TokenStrategy.ACCESS_TOKEN_PARAMETER);
        this.appId = appId;
        // 获取openId
        String url = String.format(URL_GET_OPEN_ID, accessToken);
        String result = getRestTemplate().getForObject(url, String.class);
        // 返回的数据结构体为：callback( {"client_id":"YOUR_APPID","openid":"YOUR_OPENID"} );
        this.openId = StringUtils.substringBetween(result, "\"openid\":\"", "\"}");
    }

    @Override
    public QQUserInfo getUserInfo() {
        String url = String.format(URL_GET_USER_INFO, appId, openId);
        String result = getRestTemplate().getForObject(url, String.class);
        log.info("获取到用户的信息为：{}", result);
        try {
            QQUserInfo userInfo = objectMapper.readValue(result, QQUserInfo.class);
            // 这里需要将openId存储到userInfo中
            userInfo.setOpenId(openId);
            log.info("封装后的UserInfo为：{}", userInfo);
            return userInfo;
        } catch (IOException e) {
            e.printStackTrace();
            log.error("转换QQ用户信息失败：{}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

}

```
QQImpl类说明：

- **QQImpl**继承了**AbstractOAuth2ApiBinding**，这在上一篇文章中也介绍了**AbstractOAuth2ApiBinding**帮助我们完成了一些基础操作，方便我们快速开发。

- **QQImpl**的构造方法中调用了父类**AbstractOAuth2ApiBinding**的两个参数的构造方法，在父类的构造方法中，我们将第二个参数设置为**TokenStrategy.ACCESS_TOKEN_PARAMETER**，这样在父类的构造方法中构建**RestTemplate**对象的时候，就会将**accessToken**放到请求参数中，如果调用一个参数的父类构造方法，那么它默认的行为是将**accessToken**放到请求头中，这就和QQ互联要求的请求方式不一样了。

- 没有将**QQImpl**标注为**Spring Bean**，这是因为**Spring Bean**是单例的，这里的每一个用户应该对应一个**QQImpl**对象。当用户选择QQ登录的时候，就会去创建一个**QQImpl**对象，在调用构造方法的时候，就会去事先设定好的链接获取该用户在应用中唯一的**OpenID**，拿到**OpenID**后就会调用**getUserInfo**方法来获取用户信息。

#### QQServiceProvider

开发完获取用户的QQ信息的接口后，那么接着开发**QQServiceProvider**，**OAuth2Operations**是不需要我们开发的，**Spring Social**提供了**OAuth2Template**，已经帮我们封装好了**OAuth**协议规定的基础步骤，我们直接调用即可，在调用之前，需要配置好授权的**URL**和获取**Access Token**的**URL**。

```java
/**
 * QQ的Service Provider
 *
 */
public class QQServiceProvider extends AbstractOAuth2ServiceProvider<QQ> {

    /**
     * 引导用户授权的URL，获取授权码
     */
    private static final String URL_AUTHORIZE = "https://graph.qq.com/oauth2.0/authorize";

    /**
     * 获取令牌的URL
     */
    private static final String URL_ACCESS_TOKEN = "https://graph.qq.com/oauth2.0/token";

    private String appId;

    public QQServiceProvider(String appId, String appSecret) {
        // 使用Spring Social的默认的OAuth2Template
        super(new OAuth2Template(appId, appSecret, URL_AUTHORIZE, URL_ACCESS_TOKEN));
        this.appId = appId;
    }

    @Override
    public QQ getApi(String accessToken) {
        return new QQImpl(accessToken, appId);
    }

}

```
**QQServiceProvider**的代码编写还是很简单的，**AbstractOAuth2ServiceProvider**用到的泛型是**API**的接口类型，在这里配置了授权的URL和获取**Access Token**的**URL**，然后调用**AbstractOAuth2ServiceProvider**的构造方法就可以获得了**Access Token**的值，**OAuth**协议中规定的参数传递等步骤都由**Spring Social**提供的**OAuth2Template**来完成了。也许你有一个疑问，在**OAuth**协议中，在获取授权和获取**Access Token**的时候都会设置一个参数**redirect_uri**，但是我们并没有设置这个参数啊？**Spring Social**是如何帮助我们设置的呢？这里暂时不回答这个问题，请接着往下阅读，后面将会为您解释这个参数设置问题。至此，我们已经开发完了与第三方服务提供商相关的代码，也就是第一幅图的最右边需要的代码。

#### ConnectionFactory

**Connection**是一个接口，它有一个实现类**OAuth2Connection**，该实现类中封装了与用户相关的信息，这些信息，比如**DisplayName**（显示名称），**ProfileUrl**（主页地址），**ImageUrl**（头像地址）等基本信息，这些信息是**Spring Social**所规定的用户信息（固定字段），我们现在要做的就是将拿到的用户信息转换成**OAuth2Connection**所封装的用户信息。生成**Connection**实现类对象需要用到**ConnectionFactory**工厂，而创建**ConnectionFactory**对象就需要用到我们开发的**QQServiceProvider**，还有一个**ApiAdapter**实现类对象，前者我们已经开发好了，那么现在就需要开发**ApiAdapter**的实现类，从**ApiAdapter**这个名称可以看出，它就是一个适配器，负责将从第三方应用拿到的用户基础数据转换成**OAuth2Connection**的封装的数据，但是进入**ApiAdapter**的源码看到，我们并不是直接将数据转换成**OAuth2Connection**封装的属性值，而是设置到**ConnectionValues**中，后期的转换工作交给**Spring Social**来完成。分析到这里，我们可以开始编写**ApiAdapter**实现类的代码了，具体代码如下所示：

```java

public class QQAdapter implements ApiAdapter<QQ> {

    /**
     * 这个方法用来判断QQ服务是否可用
     *
     * @param api API接口
     * @return 是否可用
     */
    @Override
    public boolean test(QQ api) {
        return true;
    }

    /**
     * 将API中获取到的用户信息转换成创建Connection所需的值
     *
     * @param api    用户信息获取API
     * @param values 创建Connection所需的值
     */
    @Override
    public void setConnectionValues(QQ api, ConnectionValues values) {
        QQUserInfo userInfo = api.getUserInfo();
        values.setDisplayName(userInfo.getNickname());
        values.setImageUrl(userInfo.getFigureUrlQq40());
        // QQ用户信息接口没有主页这个值
        values.setProfileUrl(null);
        values.setProviderUserId(userInfo.getOpenId());
    }

    @Override
    public UserProfile fetchUserProfile(QQ api) {
        return null;
    }

    @Override
    public void updateStatus(QQ api, String message) {

    }
}

```

这里主要是编写了**setConnectionValues方**法的代码，将从QQ获取到的数据封装到了**ConnectionValues**中。现在有了**QQServiceProvider**和**QQAdapter**，那么就可以来开发**ConnectionFactory**的实现类了，这里贴出代码：

```java
public class QQConnectionFactory extends OAuth2ConnectionFactory<QQ> {

    /**
     * QQ Connection Factory的构造方法
     *
     * @param providerId 第三方服务提供商的ID，如facebook，qq，wechat
     * @param appId      第三方服务提供商给予的应用ID
     * @param appSecret  第三方服务提供商给予的应用Secret
     */
    public QQConnectionFactory(String providerId, String appId, String appSecret) {
        super(providerId, new QQServiceProvider(appId, appSecret), new QQAdapter());
    }
}

```

写到这里，主要的内容算是写完了，其中**UsersConnectionRepository**这一块内容封装了对**UserConnection**表的基础操作，是不需要我们开发的，我们要做的就是将**JdbcUsersConnectionRepository**配置进来即可，主要代码如下：

```java
/**
 * 社交配置类
 *
 */
@Configuration
@EnableSocial
public class SocialConfig extends SocialConfigurerAdapter {

    private final DataSource dataSource;

    @Autowired
    public SocialConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public UsersConnectionRepository getUsersConnectionRepository(ConnectionFactoryLocator connectionFactoryLocator) {
        // 创建一个JDBC连接仓库，需要dataSource、connectionFactory加载器，对存到数据库中的加密策略，这里选择不做加密，信息原样存入数据库
        // 这里创建的JdbcUsersConnectionRepository可以设置UserConnection表的前缀
        return new JdbcUsersConnectionRepository(dataSource, connectionFactoryLocator, Encryptors.noOpText());
    }

    @Bean
    public SpringSocialConfigurer lemonSocialSecurityConfig() {
        return new SpringSocialConfigurer();
    }
}

```
这里使用注解@EnableSocial启用社交登录，并配置了**JdbcUsersConnectionRepository**，代码中**Encryptors.noOpText()**表示将用户信息以明文的方式存储到数据库中，也可以以加密的方式进行存储。并将**SpringSocialConfigurer**的实例对象交给了Spring来管理。最后将**SpringSocialConfigurer**的对象注入到了**BrowserSecurityConfig**中，并**apply**到配置代码中，如下所示：

```java
@Autowired
private SpringSocialConfigurer lemonSocialSecurityConfig;

http.apply(lemonSocialSecurityConfig);
```
#### 配置
我们开发一个配置类来接收来自配置文件中的值，定义配置类名称为**QQProperties**，该类继承**SocialProperties**，在**SocialProperties**中，已经存在了**appId**和**appSecret**，**QQProperties**继承了**SocialProperties**，就相当于已经有了**appId**和**appSecret**两个属性，再添加一个**providerId**属性即可，且设置默认值为qq，代码如下：

##### QQProperties
```java
@Getter
@Setter
public class QQProperties extends SocialProperties {

    private String providerId = "qq";

}
```
##### SocialProperties基类：
```java
@Getter
@Setter
public class SocialProperties {

    private QQProperties qq = new QQProperties();

}
```
##### SecurityProperties ：
```java
@Data
@ConfigurationProperties(prefix = "com.lemon.security")
public class SecurityProperties {

    private BrowserProperties browser = new BrowserProperties();

    private ValidateCodeProperties code = new ValidateCodeProperties();

    private SocialProperties social = new SocialProperties();

}

```
这样设置以后，我们就可以在application.properties中设置appId、appSecret以及providerId了，例如：
```java
com.lemon.security.social.qq.appId=xxxxxx
com.lemon.security.social.qq.appSecret=xxxxxx
com.lemon.security.social.qq.providerId=xxxxxx
```

以上最后一个字段名称appId可以替换为app-id，appSecret和providerId同理，Spring读取配置文件是支持横杠转换为驼峰形式的参数。
我们还需要写一个自动配置类，当检测到用户在**application.properties**中配置了属性**com.lemon.security.social.qq.appId**后，就应该将**QQConnectionFactory**实例化，并交给**Spring**来管理。也就是说，只要开发者开发的系统中配置了属性**com.lemon.security.social.qq.appId**后，说明该系统就支持QQ登录，那么就应该实例化**QQConnectionFactory**，且该工厂类是单例的，负责创建与用户信息相关的**Connection**。自动配置类的代码如下所示：

```java
@Configuration
@ConditionalOnProperty(prefix = "com.lemon.security.social.qq", name = "app-id")
public class QQAutoConfiguration extends SocialAutoConfigurerAdapter {

    private final SecurityProperties securityProperties;

    @Autowired
    public QQAutoConfiguration(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Override
    protected ConnectionFactory<?> createConnectionFactory() {
        QQProperties qqProperties = securityProperties.getSocial().getQq();
        return new QQConnectionFactory(qqProperties.getProviderId(), qqProperties.getAppId(), qqProperties.getAppSecret());
    }

}

```
##### 页面：
```html
<h2>社交登录</h2>
<!-- /auth是类SocialAuthenticationFilter规定的，/qq是providerId -->
<a href="/auth/qq"><img src="http://qzonestyle.gtimg.cn/qzone/vas/opensns/res/img/Connect_logo_3.png"></a>

```
这里的QQ登录按钮地址为什么是**/auth/qq？**这是因为**Spring Social**对社交登录的拦截地址做了默认值，它拦截的请求地址就是**/auth**，而后面的**/qq**则是**providerId**，这是默认规则。

##### 配置url：
我们在配置类**SocialConfig**中实例化了一个**SpringSocialConfigurer**的**Spring Bean**，在这个**Bean**中直接返回的是**SpringSocialConfigurer**的实例对象，在这个类的**configure**方法中，如下所示：

```java
@Override
public void configure(HttpSecurity http) throws Exception {		
	ApplicationContext applicationContext = http.getSharedObject(ApplicationContext.class);
	UsersConnectionRepository usersConnectionRepository = getDependency(applicationContext, UsersConnectionRepository.class);
	SocialAuthenticationServiceLocator authServiceLocator = getDependency(applicationContext, SocialAuthenticationServiceLocator.class);
	SocialUserDetailsService socialUsersDetailsService = getDependency(applicationContext, SocialUserDetailsService.class);
	
	SocialAuthenticationFilter filter = new SocialAuthenticationFilter(
			http.getSharedObject(AuthenticationManager.class), 
			userIdSource != null ? userIdSource : new AuthenticationNameUserIdSource(), 
			usersConnectionRepository, 
			authServiceLocator);
	
	RememberMeServices rememberMe = http.getSharedObject(RememberMeServices.class);
	if (rememberMe != null) {
		filter.setRememberMeServices(rememberMe);
	}
	
	if (postLoginUrl != null) {
		filter.setPostLoginUrl(postLoginUrl);
		filter.setAlwaysUsePostLoginUrl(alwaysUsePostLoginUrl);
	}
	
	if (postFailureUrl != null) {
		filter.setPostFailureUrl(postFailureUrl);
	}

	if (signupUrl != null) {
		filter.setSignupUrl(signupUrl);
	}

	if (connectionAddedRedirectUrl != null) {
		filter.setConnectionAddedRedirectUrl(connectionAddedRedirectUrl);
	}

	if (defaultFailureUrl != null) {
		filter.setDefaultFailureUrl(defaultFailureUrl);
	}
	
	http.authenticationProvider(
			new SocialAuthenticationProvider(usersConnectionRepository, socialUsersDetailsService))
		.addFilterBefore(postProcess(filter), AbstractPreAuthenticatedProcessingFilter.class);
}

```

在这个方法中，首先创建了一个**SocialAuthenticationFilter**对象，最后将其加到了**AbstractPreAuthenticatedProcessingFilter**这个过滤器之前，在加入之前，调用了**postProcess**方法，而这个**postProcess**方法是可以被覆盖掉的，在这里我们可以对**SocialAuthenticationFilter**进行个性化处理，在个性化处理的过程中将社交登录的拦截路径设置到其中，开发一个配置类，来覆盖一下**postProcess**方法，代码如下：

```java
/**
 * 配置社交登录的拦截路径
 *
 */
@AllArgsConstructor
public class LemonSpringSocialConfigurer extends SpringSocialConfigurer {

    private String filterProcessesUrl;

    @Override
    @SuppressWarnings("unchecked")
    protected <T> T postProcess(T object) {
        // 获取父类的处理结果
        SocialAuthenticationFilter filter = (SocialAuthenticationFilter) super.postProcess(object);
        filter.setFilterProcessesUrl(filterProcessesUrl);
        return (T) filter;
    }

}

```
写完这个代码以后，我们在**SocialConfig**类中就不能在实例化**SpringSocialConfigurer**了，而是要实例化我们自己写的那个**LemonSpringSocialConfigurer**类了，在实例化之前，需要修改一些配置，**SocialProperties**类修改后代码如下：

```java
@Getter
@Setter
public class SocialProperties {

    /**
     * 这个属性是为了设置自定义社交登录拦截路径的
     */
    private String filterProcessesUrl = "/auth";

    private QQProperties qq = new QQProperties();

}

```
修改后的SocialConfig类如下所示：

```java
/**
 * 社交配置类
 *
 */
@Configuration
@EnableSocial
public class SocialConfig extends SocialConfigurerAdapter {

    private final DataSource dataSource;

    private final SecurityProperties securityProperties;

    @Autowired
    public SocialConfig(DataSource dataSource, SecurityProperties securityProperties) {
        this.dataSource = dataSource;
        this.securityProperties = securityProperties;
    }

    @Override
    public UsersConnectionRepository getUsersConnectionRepository(ConnectionFactoryLocator connectionFactoryLocator) {
        // 创建一个JDBC连接仓库，需要dataSource、connectionFactory加载器，对存到数据库中的加密策略，这里选择不做加密，信息原样存入数据库
        // 这里创建的JdbcUsersConnectionRepository可以设置UserConnection表的前缀
        return new JdbcUsersConnectionRepository(dataSource, connectionFactoryLocator, Encryptors.noOpText());
    }

    @Bean
    public SpringSocialConfigurer lemonSocialSecurityConfig() {
        String filterProcessesUrl = securityProperties.getSocial().getFilterProcessesUrl();
        return new LemonSpringSocialConfigurer(filterProcessesUrl);
    }
}

```
到这里，我们就解决了不能自定义拦截社交登录的路径问题了，但是要注意的是，当我们没有使用默认的/auth拦截路径的时候，在配置文件中配置的路径一定要和在QQ互联网站上创建的应用配置的回调地址一致，否则还会被提示“回调地址非法”的错误。在这里，我把QQ互联上登记的应用的回调地址改成了**http://www.itlemon.cn/authentication/qq**，所以我需要在demo项目中添加一个配置**com.lemon.security.social.filterProcessesUrl=/authentication**，并且将默认的登录页面QQ登录按钮地址改成了**/authentication/qq**。
