---
title: springsecurity系列-短信验证码登陆功能实现
date: 2019-09-18 23:14:27
categories:
  - springsecurity
tags:
  - springsecurity
---

springsecurity系列-短信验证码登陆功能实现，实现短信验证码生成、发送、校验。
<!-- more -->

------------
### 短信验证码生成与发送

#### 代码结构

短信验证码和图形验证码生成验证逻辑基本相同，可抽象出接口，分别不同实现，代码结构如下：

<img class="avatar" src="/img/smscode.png">

接口说明：

- **ValidateCodeController** 是这个验证码接口体系的入口，它主要抽象出可以同时接收两种验证码的请求方式，使用请求类型type来进行区分。

- **ValidateCodeProcessor** 是一个接口，专门用来生成验证码，并将验证码存入到session中，最后将验证码发送出去，发送的方式有两种，图片验证码是写回到response中，短信验证码调用第三方短信服务平台的API进行发送，比如阿里巴巴的短信服务。

- **AbstractValidateCodeProcessor** 是一个抽象类，它实现了 **ValidateCodeProcessor** 接口，并提供了抽象方法send方法，因为图片的发送方法和短信的发送方法具体实现不同，所以得使用具体的方法进行发送。这里面的create方法完成了验证码的生成、保存与发送功能。

- **ValidateCodeGenerator** 也是一个接口，它有两个实现类，分别是 **ImageCodeGenerator** 和 **SmsCodeGenerator**，它们具体是完成了代码的生成逻辑。

- **ImageCodeProcessor** 和 **SmsCodeProcessor** 是专门用来重写send方法的一个处理器，展示了两种验证码的不同发送方式。

#### 短信验证码实体
创建验证码父类，抽象出短信验证码和图形验证码相同的属性，短信验证码和图形验证后包含属性有code和expireTime，短信验证码只有这两个属性，而图形验证码还多一个BufferedImage实例对象属性，所以将共同属性进行抽取，抽取为ValidateCode类：
```java
@Data
@AllArgsConstructor
public class ValidateCode {

    private String code;

    private LocalDateTime expireTime;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expireTime);
    }
}

```
抽取后的图片验证码实体类为：
```java
@EqualsAndHashCode(callSuper = true)
@Data
public class ImageCode extends ValidateCode {

    private BufferedImage image;

    public ImageCode(BufferedImage image, String code, LocalDateTime expireTime) {
        super(code, expireTime);
        this.image = image;
    }

    public ImageCode(BufferedImage image, String code, int expireIn) {
        super(code, LocalDateTime.now().plusSeconds(expireIn));
        this.image = image;
    }
}

```
短信验证码实体：
```java
public class SmsCode extends ValidateCode {

    public SmsCode(String code, LocalDateTime expireTime) {
        super(code, expireTime);
    }

    public SmsCode(String code, int expireIn) {
        super(code, LocalDateTime.now().plusSeconds(expireIn));
    }
}
```
#### 短信验证码属性类
属性类和实体类一样，抽象出验证码属性父类：
```java
@Data
public class CodeProperties {

    /**
     * 验证码长度
     */
    private int length = 6;
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
图片验证码属性类：
```java
@EqualsAndHashCode(callSuper = true)
@Data
public class ImageCodeProperties extends CodeProperties {

    public ImageCodeProperties() {
        setLength(4);
    }

    /**
     * 验证码宽度
     */
    private int width = 67;
    /**
     * 验证码高度
     */
    private int height = 23;
}
```
短信验证码属性类：
```java
public class SmsCodeProperties extends CodeProperties {

}
```
为了实现配置信息可以由用户自定义配置，还需要将其加入到读取配置文件的配置类中，创建一个 **ValidateCodeProperties** 类，将图片验证码和短信验证码实例对象作为属性配置进去，代码如下：
```java
@Data
public class ValidateCodeProperties {

    private ImageCodeProperties image = new ImageCodeProperties();
    private SmsCodeProperties sms = new SmsCodeProperties();

}

```

再将ValidateCodeProperties封装到整个安全配置类SecurityProperties中，具体的代码如下：
```java
@Data
@ConfigurationProperties(prefix = "com.lemon.security")
public class SecurityProperties {

    private BrowserProperties browser = new BrowserProperties();

    private ValidateCodeProperties code = new ValidateCodeProperties();
}

```
配置文件中可配置验证码相应属性：

```xml
com.lemon.security.code.image.length=4
com.lemon.security.code.sms.length=6
```
#### 验证码生成接口
**ValidateCodeProcessor** 接口主要是完成了验证码的生成、保存与发送的一整套流程，接口的主要设计如下所示：

```java
public interface ValidateCodeProcessor {

    String SESSION_KEY_PREFIX = "SESSION_KEY_FOR_CODE_";
    String CODE_PROCESSOR = "CodeProcessor";

    /**
     * 生成验证码
     *
     * @param request 封装了 {@link HttpServletRequest} 实例对象的请求
     * @throws Exception 异常
     */
    void create(ServletWebRequest request) throws Exception;
}

```
由于图片验证码和短信验证码的生成和保存、发送等流程是固定的，只是在生成两种验证码的时候分别调用各自的生成方法，保存到session中是完全一致的，最后的发送各有不同，图片验证码是写到response中，而短信验证码是调用第三方短信发送平台的SDK来实现发送功能。所以这里写一个抽象类来实现 **ValidateCodeProcessor** 接口。
```java
@Component
public abstract class AbstractValidateCodeProcessor<C> implements ValidateCodeProcessor {

    private static final String SEPARATOR = "/code/";

    /**
     * 操作session的工具集
     */
    private SessionStrategy sessionStrategy = new HttpSessionSessionStrategy();

    /**
     * 这是Spring的一个特性，就是在项目启动的时候会自动收集系统中 {@link ValidateCodeGenerator} 接口的实现类对象
     */
    @Autowired
    private Map<String, ValidateCodeGenerator> validateCodeGeneratorMap;

    @Override
    public void create(ServletWebRequest request) throws Exception {
        C validateCode = generate(request);
        save(request, validateCode);
        send(request, validateCode);
    }

    /**
     * 生成验证码
     *
     * @param request ServletWebRequest实例对象
     * @return 验证码实例对象
     */
    @SuppressWarnings("unchecked")
    private C generate(ServletWebRequest request) {
        String type = getProcessorType(request);
        ValidateCodeGenerator validateCodeGenerator = validateCodeGeneratorMap.get(type.concat(ValidateCodeGenerator.CODE_GENERATOR));
        return (C) validateCodeGenerator.generate(request);
    }

    /**
     * 保存验证码到session中
     *
     * @param request      ServletWebRequest实例对象
     * @param validateCode 验证码
     */
    private void save(ServletWebRequest request, C validateCode) {
        sessionStrategy.setAttribute(request, SESSION_KEY_PREFIX.concat(getProcessorType(request).toUpperCase()), validateCode);
    }

    /**
     * 发送验证码
     *
     * @param request      ServletWebRequest实例对象
     * @param validateCode 验证码
     * @throws Exception 异常
     */
    protected abstract void send(ServletWebRequest request, C validateCode) throws Exception;

    /**
     * 获取请求URL中具体请求的验证码类型
     *
     * @param request ServletWebRequest实例对象
     * @return 验证码类型
     */
    private String getProcessorType(ServletWebRequest request) {
        // 获取URI分割后的第二个片段
        return StringUtils.substringAfter(request.getRequest().getRequestURI(), SEPARATOR);
    }
}

```
对上面的代码进行解释：

- 首先将验证码生成接口 **ValidateCodeGenerator** 的实现类对象注入到Map集合中，这个是Spring的一个特性。

- 抽象类中实现了 **ValidateCodeProcessor** 接口的create方法，从代码中可以看出，它主要是完成了验证码的创建、保存和发送的功能。

- generate方法根据传入的不同泛型而生成了特定的验证码，而泛型的传入是通过**AbstractValidateCodeProcessor** 的子类来实现的。

- save方法是将生成的验证码实例对象存入到session中，两种验证码的存储方式一致，所以代码也是通用的。

- send方法一个抽象方法，分别由 **ImageCodeProcessor** 和 **SmsCodeProcessor** 来具体实现，也是根据泛型来判断具体调用哪一个具体的实现类的send方法。

#### 验证码生成接口实现

##### 图片验证码
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
##### 短信验证码
```java
@Data
@Component("smsCodeGenerator")
public class SmsCodeGenerator implements ValidateCodeGenerator {

    private final SecurityProperties securityProperties;

    @Autowired
    public SmsCodeGenerator(SecurityProperties securityProperties) {
        this.securityProperties = securityProperties;
    }

    @Override
    public SmsCode generate(ServletWebRequest request) {
        String code = RandomStringUtils.randomNumeric(securityProperties.getCode().getSms().getLength());
        return new SmsCode(code, securityProperties.getCode().getSms().getExpireIn());
    }
}

```
两个实现类完成了具体的验证码生成逻辑，根据传入的泛型然后进行强转之后便可调用各自的生成逻辑方法。

#### 验证码发送
不同的验证码的发送逻辑是不一样的，图片验证码是写回response中，而短信验证码是将验证码发送到指定手机号的手机上。
##### 图形验证码
图片验证码的发送逻辑类的代码如下：
```java
@Component("imageCodeProcessor")
public class ImageCodeProcessor extends AbstractValidateCodeProcessor<ImageCode> {

    private static final String FORMAT_NAME = "JPEG";

    /**
     * 发送图形验证码，将其写到相应中
     *
     * @param request   ServletWebRequest实例对象
     * @param imageCode 验证码
     * @throws Exception 异常
     */
    @Override
    protected void send(ServletWebRequest request, ImageCode imageCode) throws Exception {
        ImageIO.write(imageCode.getImage(), FORMAT_NAME, request.getResponse().getOutputStream());
    }
}

```
##### 短信验证码
```java
@Component("smsCodeProcessor")
public class SmsCodeProcessor extends AbstractValidateCodeProcessor<SmsCode> {

    private static final String SMS_CODE_PARAM_NAME = "mobile";

    private final SmsCodeSender smsCodeSender;

    @Autowired
    public SmsCodeProcessor(SmsCodeSender smsCodeSender) {
        this.smsCodeSender = smsCodeSender;
    }

    @Override
    protected void send(ServletWebRequest request, SmsCode smsCode) throws Exception {
        String mobile = ServletRequestUtils.getRequiredStringParameter(request.getRequest(), SMS_CODE_PARAM_NAME);
        smsCodeSender.send(mobile, smsCode.getCode());
    }
}

```
注意到上面的短信发送调用了 **SmsCodeSender** 的实现类，因此和图片的发送有所区别。而在设计中，**SmsCodeSender** 有一个默认的实现，也就是自带的短信发送方式，但是在实际的开发过程中，往往需要开发者覆盖自带的发送逻辑，而是采用自定义的发送逻辑，所以需要默认的短信发送方式是可以被覆盖的。**SmsCodeSender** 接口代码如下：

```java
/**
 * 短信验证发送接口
 *
 */
public interface SmsCodeSender {

    /**
     * 短信验证码发送接口
     *
     * @param mobile 手机号
     * @param code   验证码
     */
    void send(String mobile, String code);
}

```
默认实现类代码：
```java
/**
 * 默认的短信发送逻辑
 *
 */
public class DefaultSmsCodeSender implements SmsCodeSender {

    @Override
    public void send(String mobile, String code) {
        // 这里仅仅写个打印，具体逻辑一般都是调用第三方接口发送短信
        System.out.println("向手机号为：" + mobile + "的用户发送验证码：" + code);
    }
}

```
注意到上面的代码并没有使用@Component注解来标注为一个Spring的Bean，这么做不是说它不由Spring管理，而是需要配置的可以被覆盖的形式，所以在 **ValidateCodeBeanConfig** 类中加上配置其为Spring Bean的代码，为了体现代码的完整性，这里贴出 **ValidateCodeBeanConfig** 类中的所有代码。
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

    @Bean
    @ConditionalOnMissingBean(SmsCodeSender.class)
    public SmsCodeSender smsCodeSender() {
        return new DefaultSmsCodeSender();
    }
}

```
在最后一个Bean的配置中，使用了@ConditionalOnMissingBean注解，这里是告诉Spring，如果上下文环境中没有**SmsCodeSender**接口的实现类对象，那么就执行下面的方法进行默认的Bean创建。所以对于用户自定义方式，只需要写一个类实现SmsCodeSender接口，并将其标注为Spring的Bean即可，就可以覆盖自带的短信发送逻辑。如果一开始使用@Component注解来进行标注了，那就无法获得这样自定义的效果。