---
title: springboot系列-springboot开发技巧
date: 2019-09-16 23:14:27
categories:
  - springboot
tags:
  - springboot
---

springboot开发过程中常用的注解、工具类等开发技巧。
<!-- more -->

------------
### spring依赖管理

```xml
	<dependencyManagement>
		<dependencies>
			<dependency>
				<groupId>io.spring.platform</groupId>
				<artifactId>platform-bom</artifactId>
				<version>Brussels-SR4</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
			<dependency>
				<groupId>org.springframework.cloud</groupId>
				<artifactId>spring-cloud-dependencies</artifactId>
				<version>Dalston.SR2</version>
				<type>pom</type>
				<scope>import</scope>
			</dependency>
		</dependencies>
	</dependencyManagement>
```
配置好Spring的依赖管理，则不用配置Spring相关的jar包，spring会自动管理解决jar包冲突。

### 工具类
#### 常用工具类
```xml
		<dependency>
			<groupId>commons-lang</groupId>
			<artifactId>commons-lang</artifactId>
		</dependency>
		<dependency>
			<groupId>commons-collections</groupId>
			<artifactId>commons-collections</artifactId>
		</dependency>
		<dependency>
			<groupId>commons-beanutils</groupId>
			<artifactId>commons-beanutils</artifactId>
		</dependency>
```
常用工具类，org.apache.commons 包括String、集合、bean等的常用操作。
#### session操作
- `org.springframework.social.connect.web.SessionStrategy`
功能：session大部分操作都包括

#### 路径匹配
- `org.springframework.util.AntPathMatcher`
功能：给定2个url，判定是否匹配，支持srping中带通配符的url

### 常用注解
#### bean条件注入
##### 是否存在注入
```java
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean

    // spring 容器中如果存在imageCodeGenerate的bean就不会再初始化该bean了
    // 条件注解，不指定name的话，应该是按类型来判定的
    // 所以spring中貌似是不指定name的
    @Bean
    @ConditionalOnMissingBean(name = "imageCodeGenerate")
    public ValidateCodeGenerate imageCodeGenerate() {
        ImageCodeGenerate imageCodeGenerate = new  ImageCodeGenerate(securityProperties.getCode().getImage());
        return imageCodeGenerate;
    }

```

##### 是否配置
```java
    // matchIfMissing ：当tokenStore没有值的时候是否生效
    // 当tokenStore = jwt的时候或则tokenStore没有配置的时候使用下面的配置
  @Configuration
  @ConditionalOnProperty(prefix = "imooc.security.oauth2", name = "tokenStore", havingValue = "jwt", matchIfMissing = true)
    public static class JwtTokenConfig {
}
```
```java
@Configuration
// 当配置了app-id的时候才启用
@ConditionalOnProperty(prefix = "imooc.security.social.qq", name = "app-id")
public class QQAutoConfig extends SocialConfigurerAdapter {
}
```
可以利用@ConditionalOnMissingBean和@ConditionalOnProperty搭配使用，灵活配置，即用户自定义配置生效，用户不配置取默认的配置。
#### bean注入顺序
```java
@Component
public class DefaultAuthorizeConfigManager implements AuthorizeConfigManager {
    // 由于需要有序的，所以不能再使用set了
    // 依赖查找技巧
    @Autowired
    private List<AuthorizeConfigProvider> providers;

@Component
@Order(Integer.MIN_VALUE)
public class CommonAuthorizeConfigProvider implements AuthorizeConfigProvider {

@Component
@Order(Integer.MAX_VALUE)
public class DemoAuthorizeConfigProvider implements AuthorizeConfigProvider {
｝
```
bean的注入顺序，可以按照order指定的来放入。

