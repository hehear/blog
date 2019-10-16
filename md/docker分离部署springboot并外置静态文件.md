---
title: docker分离部署springboot并外置静态文件
date: 2019-05-17 02:29:27
categories:
  - docker
  - springboot
tags:
  - docker
  - springboot
---

docker部署springboot项目时，每次上传war/jar包耗时耗力，并且每次都要修改配置文件，所以用docker部署时，将springboot项目打包时将项目的代码、静态文件、配置文件、lib分离，每次升级只需上传修改的代码即可，同时将静态文件等外挂到服务器，修改时只需修改完重启容器应用即可，无需重新build镜像。

<!-- more -->
### 配置打包springboot项目
#### 1. 修改pom.xml文件
- 设定打成jar包
```html
	<groupId>com.blog</groupId>
	<artifactId>MyBlog</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>jar</packaging>
```
- build标签下设定打包的名称
```html
<finalName>MyBlog</finalName>
```
- build plugins标签下配置打包成jar
```html
<!--打包jar-->
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-jar-plugin</artifactId>
	<configuration>
		<excludes>
			<exclude>**/*.properties</exclude>
			<exclude>**/*.xml</exclude>
		</excludes>
		<archive>
			<manifest>
				<mainClass>com.blog.MyBlogApplication</mainClass>
				<addClasspath>true</addClasspath>
				<classpathPrefix>lib/</classpathPrefix>
			</manifest>
			<manifestEntries>
				<Class-Path>./</Class-Path>
			</manifestEntries>
		</archive>
		<outputDirectory>${project.build.directory}</outputDirectory>
	</configuration>
</plugin>
```
- build plugins标签下配置打包依赖lib
```html
<!--打包依赖lib-->
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-dependency-plugin</artifactId>
	<executions>
		<execution>
			<id>copy-dependencies</id>
			<phase>prepare-package</phase>
			<goals>
				<goal>copy-dependencies</goal>
			</goals>
			<configuration>
				<outputDirectory>${project.build.directory}/lib</outputDirectory>
			</configuration>
		</execution>
	</executions>
</plugin>
```
- build plugins标签下配置打包resource
```html
<!--打包resource-->
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-resources-plugin</artifactId>
	<executions>
		<execution>
			<id>copy-resources</id>
			<phase>prepare-package</phase>
			<goals>
				<goal>copy-resources</goal>
			</goals>
			<configuration>
				<encoding>UTF-8</encoding>
				<resources>
					<resource>
						<directory>src/main/resources</directory>
					</resource>
				</resources>
				<outputDirectory>${project.build.directory}/</outputDirectory>
			</configuration>
		</execution>
	</executions>
</plugin>
```
- build resources标签下配置打包时将jsp文件拷贝到META-INF目录
```html
		<resources>
			<!-- 打包时将jsp文件拷贝到META-INF目录下 -->
			<resource>
				<!-- 指定resources插件处理哪个目录下的资源文件 -->
				<directory>src/main/webapp</directory>
				<!--注意此次必须要放在此目录下才能被访问到 -->
				<targetPath>META-INF/resources</targetPath>
				<includes>
					<include>**/**</include>
				</includes>
			</resource>
			<resource>
				<directory>src/main/resources</directory>
				<includes>
					<include>**/**</include>
				</includes>
				<filtering>false</filtering>
			</resource>
		</resources>
```

#### 2. maven build springboot项目
命令或者ide `clean install`

### 配置dockerfile
```html
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ARG DEPENDENCY=MyBlog
COPY ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY ${DEPENDENCY}/META-INF /app/META-INF
COPY ${DEPENDENCY}/BOOT-INF/classes /app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.blog.MyBlogApplication"]
```
 - FROM jdk，运行jar文件
 - VOLUME /tmp springboot内置tomcat存放
 - ARG 解压springboot的文件夹
 - COPY 将解压项目中的静态文件等copy到容器中指定位置，用于指定外挂
 - ENTRYPOINT 中com.blog.MyBlogApplication为springboot启动类

### 使用docker部署项目
#### 1. 在linux服务器上创建文件夹blog
#### 2. 将解压的springboot项目、Dockerfile文件传输到服务器的blog文件夹
#### 3. docker build镜像
- 进入linux的blog文件夹
- 执行docker命令将springboot项目build成镜像

```html
docker build -t blog:1.1 .
```
- 注意语句结束后的“.”,不可省略

#### 4. 创建容器，并外挂静态文件
```html
docker run --name blog -it -p 8080:8081 -v /etc/localtime:/etc/localtime -v /etc/config/blog/lib:/app/lib -v /etc/config/blog/static:/app/static -v /etc/config/blog/templates:/app/templates -v /etc/config/blog/config:/app/config  -v /home/app/blog/editormd/images/:/home/app/blog/editormd/images/ -d blog:1.1
```
- --name容器名称
- -p 8081:8080 端口映射，8081服务器端口映射到容器的8080端口
- -v /etc/config/blog/static:/app/static 将容器中/app/static（静态文件）挂载到服务器的/etc/config/blog/static目录下，其他几个-v命令也是如此。
- -d blog 镜像名称

 到此部署成功。


