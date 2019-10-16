---
title: springsecurity系列-图形验证码登陆验证
date: 2019-09-17 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
---

springsecurity系列-图形验证码登陆验证，springsecurity实现图形验证码登陆验证。
<!-- more -->

------------
### 图形验证码实体类及属性类

#### 图形验证码实体类

```java
/**
 * 图片验证码
 *
 */
@Data
public class ImageCode {
	//图片
    private BufferedImage image;
	//验证码
    private String code;
	//过期日期
    private LocalDateTime expireTime;

    public ImageCode(BufferedImage image, String code, LocalDateTime expireTime) {
        this.image = image;
        this.code = code;
        this.expireTime = expireTime;
    }

    public ImageCode(BufferedImage image, String code, int expireIn) {
        this.image = image;
        this.code = code;
        this.expireTime = LocalDateTime.now().plusSeconds(expireIn);
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expireTime);
    }
}

```
这里设置了两个有参构造方法，常用的第二个有参构造方法的最后一个参数指定了验证码的过期时间，也就是在多少秒后失效。具体的判断方法由LocalDateTime.now().isAfter(expireTime)来进行判断的。

#### 图形验证码属性类

图形验证码的实体类是承载验证码的具体信息，而属性类是为了定义图形验证码的长度、图片的宽度高度以及验证码的过期时间等基本属性。这些属性支持用户在XML配置文件中进行配置的，当然也具备了默认值。具体代码如下：

```java
/**
 * 图形验证码的默认配置
 *
 */
@Data
public class ImageCodeProperties {

    /**
     * 验证码宽度
     */
    private int width = 67;
    /**
     * 验证码高度
     */
    private int height = 23;
    /**
     * 验证码长度
     */
    private int length = 4;
    /**
     * 验证码过期时间
     */
    private int expireIn = 60;

    /**
     * 需要验证码的url字符串，用英文逗号隔开
     */
    private String url;
    
}

```
图形验证码属性类包装在验证码属性类中，层级分割开，有利于后期扩展，例如验证码属性类以后可扩展手机验证码属性类等：
```java
@Data
public class ValidateCodeProperties {

    private ImageCodeProperties image = new ImageCodeProperties();
}
```
验证码属性类在包装入securitypropoties中，各种类别的属性类都统一封装在一起管理注册：
```java
@Data
@ConfigurationProperties(prefix = "com.lemon.security")
public class SecurityProperties {

    private BrowserProperties browser = new BrowserProperties();

    private ValidateCodeProperties code = new ValidateCodeProperties();
}

```
在配置文件中配置的方法如下：
```xml
com.lemon.security.code.image.length= 6
com.lemon.security.code.image.url= /user,/user/*
```
这个配置相当于用户自定义了验证码的长度为6，以及需要验证码的URI为/user和/uset/*，在默认的情况下，长度为4。这几个类基本完成了图形验证码的自定义功能。

### 图形验证码生成接口和实现类
```java
public interface ValidateCodeGenerator {

    /**
     * 生成图片验证码
     *
     * @param request 请求
     * @return ImageCode实例对象
     */
    ImageCode generate(ServletWebRequest request);
}

```
默认实现类：
```java
@Data
public class ImageCodeGenerator implements ValidateCodeGenerator {

    private static final String IMAGE_WIDTH_NAME = "width";
    private static final String IMAGE_HEIGHT_NAME = "height";
    private static final Integer MAX_COLOR_VALUE = 255;

    private SecurityProperties securityProperties;

    @Override
    public ImageCode generate(ServletWebRequest request) {
        int width = ServletRequestUtils.getIntParameter(request.getRequest(), IMAGE_WIDTH_NAME, securityProperties.getCode().getImage().getWidth());
        int height = ServletRequestUtils.getIntParameter(request.getRequest(), IMAGE_HEIGHT_NAME, securityProperties.getCode().getImage().getHeight());
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics g = image.getGraphics();

        Random random = new Random();

		// 生成画布
        g.setColor(getRandColor(200, 250));
        g.fillRect(0, 0, width, height);
        g.setFont(new Font("Times New Roman", Font.ITALIC, 20));
        g.setColor(getRandColor(160, 200));
        for (int i = 0; i < 155; i++) {
            int x = random.nextInt(width);
            int y = random.nextInt(height);
            int xl = random.nextInt(12);
            int yl = random.nextInt(12);
            g.drawLine(x, y, x + xl, y + yl);
        }

		// 生成数字验证码
        StringBuilder sRand = new StringBuilder();
        for (int i = 0; i < securityProperties.getCode().getImage().getLength(); i++) {
            String rand = String.valueOf(random.nextInt(10));
            sRand.append(rand);
            g.setColor(new Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110)));
            g.drawString(rand, 13 * i + 6, 16);
        }

        g.dispose();

        return new ImageCode(image, sRand.toString(), securityProperties.getCode().getImage().getExpireIn());
    }

    /**
     * 生成随机背景条纹
     *
     * @param fc 前景色
     * @param bc 背景色
     * @return RGB颜色
     */
    private Color getRandColor(int fc, int bc) {
        Random random = new Random();
        if (fc > MAX_COLOR_VALUE) {
            fc = MAX_COLOR_VALUE;
        }
        if (bc > MAX_COLOR_VALUE) {
            bc = MAX_COLOR_VALUE;
        }
        int r = fc + random.nextInt(bc - fc);
        int g = fc + random.nextInt(bc - fc);
        int b = fc + random.nextInt(bc - fc);
        return new Color(r, g, b);
    }
}

```
本来这个类是可以使用@Component注解来标记为Spring的Bean的，但是没有这么做，这是因为这个实现类是本项目默认的，不一定完全符合用户的需求，所以可以将其进行配置，而不是一定成为Spring的Bean。具体的配置如下代码：
```java
@Configuration
public class ValidateCodeBeanConfig {

    private final SecurityProperties securityProperties;

    @Autowired
    public ValidateCodeBeanConfig(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Bean
    @ConditionalOnMissingBean(name = "imageCodeGenerator")
    public ValidateCodeGenerator imageCodeGenerator() {
        ImageCodeGenerator imageCodeGenerator = new ImageCodeGenerator();
        imageCodeGenerator.setSecurityProperties(securityProperties);
        return imageCodeGenerator;
    }
}

```
其实这个配置和在 **ImageCodeGenerator** 类上使用@Component注解效果是一致的，都会被标记为Spring的Bean，但是在这里，在配置的过程中使用了一个条件：@ConditionalOnMissingBean(name = "imageCodeGenerator")，也就是说上下文环境中如果没有名称为 **imageCodeGenerator** 的Spring Bean的话，那么就配置项目默认的Bean，否则将不配置这个Bean，这也就是说，如果用户自定义了一个类实现了 **ValidateCodeGenerator** 接口，并且实现类的在Spring容器中Bean的名字为**imageCodeGenerator**，那么将使用用户的实现类来生成图形验证码。到现在这一步，基本完成了图形验证码的核心需求。

### 生成图片验证码
图形验证码接口将生成一个JPEG的图片，那么在前端就可以写一个img标签，src属性指向接口。具体的Controller方法如下所示：
```java
@RestController
public class ValidateCodeController {

    static final String SESSION_KEY = "SESSION_KEY_IMAGE_CODE";
    private static final String FORMAT_NAME = "JPEG";

    private final ValidateCodeGenerator imageCodeGenerator;

    private SessionStrategy sessionStrategy = new HttpSessionSessionStrategy();

    @Autowired
    public ValidateCodeController(ValidateCodeGenerator imageCodeGenerator) {
        this.imageCodeGenerator = imageCodeGenerator;
    }

    @GetMapping("/code/image")
    public void createCode(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // 第一步：根据请求生成一个图形验证码对象
        ImageCode imageCode = imageCodeGenerator.generate(new ServletWebRequest(request));
        // 第二步：将图形验证码对象存到session中,第一个参数可以从传入的请求中获取session
        sessionStrategy.setAttribute(new ServletRequestAttributes(request), SESSION_KEY, imageCode);
        // 第三步：将生成的图片写到接口的响应中
        ImageIO.write(imageCode.getImage(), FORMAT_NAME, response.getOutputStream());
    }
}

```
这里使用imageCodeGenerator对象的generate方法生成了图形验证码，并将验证码存入到了session中，最后将图片写回到输出流中。

### 验证码的校验
验证码生成以后自动写回到了浏览器页面上，并以图片的形式进行了展示，与此同时，生成的图形验证码被设置了过期时间，并存入到session中，当用户登录的时候，正确的逻辑是将登录的验证码参数取出来和session中的验证码进行对比，如果验证码对比通过后才开始验证用户名和密码，由于用户名和密码的验证用的是 **UsernamePasswordAuthenticationFilter** 来进行验证的，所以这里也需要写一个过滤器，并且将这个过滤器放在 **UsernamePasswordAuthenticationFilter** 之前。先来编写过滤器：

```java
@EqualsAndHashCode(callSuper = true)
@Data
public class ValidateCodeFilter extends OncePerRequestFilter implements InitializingBean {

    private static final String SUBMIT_FORM_DATA_PATH = "/authentication/form";

    private AuthenticationFailureHandler authenticationFailureHandler;

    private SessionStrategy sessionStrategy = new HttpSessionSessionStrategy();

    private Set<String> urls = new HashSet<>();

    private SecurityProperties securityProperties;

    private final AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Override
    public void afterPropertiesSet() throws ServletException {
        super.afterPropertiesSet();
        String[] configUrls = StringUtils.splitByWholeSeparatorPreserveAllTokens(securityProperties.getCode().getImage().getUrl(), ",");
        urls.addAll(Arrays.asList(configUrls));
        // 登录的链接是必须要进行验证码验证的
        urls.add(SUBMIT_FORM_DATA_PATH);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        boolean action = false;
        for (String url : urls) {
            // 如果实际访问的URL可以与用户在XML配置文件中配置的相同，那么就进行验证码校验
            if (antPathMatcher.match(url, request.getRequestURI())) {
                action = true;
            }
        }
        if (action) {
            try {
                validate(new ServletWebRequest(request));
            } catch (ValidateCodeException e) {
                authenticationFailureHandler.onAuthenticationFailure(request, response, e);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * 验证码校验逻辑
     *
     * @param request 请求
     * @throws ServletRequestBindingException 请求异常
     */
    private void validate(ServletWebRequest request) throws ServletRequestBindingException {
        // 从session中获取图片验证码
        ImageCode imageCodeInSession = (ImageCode) sessionStrategy.getAttribute(request, ValidateCodeController.SESSION_KEY);
        // 从请求中获取用户填写的验证码
        String imageCodeInRequest = ServletRequestUtils.getStringParameter(request.getRequest(), "imageCode");
        if (StringUtils.isBlank(imageCodeInRequest)) {
            throw new ValidateCodeException("验证码不能为空");
        }
        if (null == imageCodeInSession) {
            throw new ValidateCodeException("验证码不存在");
        }
        if (imageCodeInSession.isExpired()) {
            sessionStrategy.removeAttribute(request, ValidateCodeController.SESSION_KEY);
            throw new ValidateCodeException("验证码已过期");
        }
        if (!StringUtils.equalsIgnoreCase(imageCodeInRequest, imageCodeInSession.getCode())) {
            throw new ValidateCodeException("验证码不匹配");
        }
        // 验证成功，删除session中的验证码
        sessionStrategy.removeAttribute(request, ValidateCodeController.SESSION_KEY);
    }
}

```
这个过滤器继承了 **OncePerRequestFilter**，这就保证了一次请求仅仅会运行一次过滤器，不会重复运行。而实现 **InitializingBean** 是为了当前类作为Spring Bean进行实例化完成（成员属性全部初始化完成）的时候，会自动调用这个接口的 **afterPropertiesSet** 方法，当然，如果这个类没有被Spring进行实例化，那么就需要手动调用这个方法，这里就是使用的手动调用 **afterPropertiesSet** 方法。这里 **afterPropertiesSet** 方法是将用户配置的需要对验证码进行校验的连接进行装配，将以英文逗号隔开的连接装配到字符串数组中。在后面的 **doFilterInternal** 方法中，将遍历这个字符串数组，如果当前访问的链接包含在这个数组中，将进行校验操作，否则该过滤器直接放行。具体的校验逻辑请看上面的代码，很简单。前面已经说了，需要将该过滤器加入到 **UsernamePasswordAuthenticationFilter** 之前，具体的做法就是使用 **addFilterBefore** 方法，具体的代码如下：
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
                .authorizeRequests()
                .antMatchers("/authentication/require", securityProperties.getBrowser().getLoginPage(), "/code/image").permitAll()
                .anyRequest()
                .authenticated()
                .and()
                .csrf().disable();
    }
}

```
至此就完成了全部的需求和功能，对于简单的需求，生成验证码的逻辑很简单，直接使用一个请求方法即可，但是这里为什么使用绕这么多的逻辑，这是因为这样设计有框架设计的思想，给予了用户更多的自定义条件，而不是一味的写死。代码很简单，思想很重要！
