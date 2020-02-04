---
title: docker-简单介绍与应用
date: 2020-02-03 01:14:27
categories:
  - docker
tags:
  - docker

---

docker-简单介绍与应用。
<!-- more -->

------------
### 简介

基于GO语言，引擎基础linux容器技术

Slogan：“Build,Ship and Run Any App,Anywhere”“一次封装，到处运行”

Docker容器可以理解为一个沙盒，每个容器内运行一个应用，相互隔离互不干扰，容器又可以建立通信。

Docker 基于linux 多项开源技术提供了高效、快捷和轻量级的容器方案，并且支持了主流平台和本地系统的部署，docker为应用的开发和部署提供了一站式的解决方案

### 优势

- 快速的交付和部署，使用镜像快速的构建标准开发环境，docker快速创建删除容器,节约时间

- 高效资源利用，内核级虚拟化，更高性能,对资源额外需求很低

- 更轻松的迁移和扩展，兼容性好.多平台轻松转移

- 更简单的更新简管理，使用Dockerfile， 只需小小的配置修改，就可以替代以最大量更新工作

### 对比虚拟机
| 特性  |  docker容器 | 虚拟机  |
| :------------ | :------------ | :------------ |
| 启动速度  | 秒  | 分钟  |
| 硬盘使用  | MB  | GB  |
| 性能  | 接近原生系统  | 弱于原生系统  |
| 系统支持量  | 上千容器  | 几十个  |
| 隔离性  | 完全隔离  | 完全隔离  |

### 核心概念

- Docker 镜像，类似虚拟机镜像，面向docker引擎的只读模板，包含了文件系统，是创建容器的基础

- Docker 容器，类似轻量级沙箱，docker利用容器来运行和隔离应用，容器是从镜像创建的运行实例，可以启动、开始、停止、删除，可以将容器当做一个简易的linux系统环境

- Docker 仓库，类似代码仓库，docker集中存放镜像的场所，分为公开仓库，和私有仓库

### 安装

- Docker 支持在主流平台上安装使用，包括Ubuntu，centos，windows，mac os等等，在linux原生系统表现最好

- Centos 7
```shell
sudo yum install –y docker-ce
```

- 启动docker
```shell
sudo systemctl start docker
```

### 镜像

- 从远程仓库搜索镜像  
```shell
docker search IMAGE[:TAG]   
docker search ubuntu:1.4.1 
```

- 获取镜像  
```shell
docker pull IMAGE[:TAG]  
docker pull ubuntu 不明确tag默认最近的latest，从默认公有仓库下载
docker pull dl.dockerpool.com:5000/ubuntu:1.14.1 从确定的仓库下载
```

- 查看镜像  
```shell
docker images
查看镜像详细信息
docker inspect 容器id  返回json类型数据
```

- 添加标签  
```shell
docker tag dl.dockerpool.com:5000/ubuntu:latest ubuntu:latest
```

- 删除镜像 (删除镜像前需停止删除容器) 
```shell
docker rmi IMAGE
```

- 镜像存出  
```shell
docker  save –o ubuntu_14.04.tar ubuntu:14.04 将镜像存出为压缩包
```

- 镜像载入 
```shell
docker load –input ubuntu_14.04.tar  或 docker load < ubuntu_14.04.tar
```

- 镜像上传 
```shell
docker push [name][tag]  默认上传dockerhub服务器
docker push xxxx.com:5000/name:tag 上传到url地址的私有仓库
```

- 创建镜像 a.基于已有镜像的容器创建 b.基于本地模板导入 c.基于dockerfile创建

#### 镜像创建
##### 基于已有镜像的容器创建
```shell
命令：docker commit [OPTIONS]
     --a ,--author 作者信息
     --m, --message 提交信息
     --p,--pause 提交时暂停容器
     例：在Ubuntu原有镜像的基础上，新建文件，创建新的镜像
     sudo docker run –it ubuntu:14.04  /bin/bash    进入容器
     touch test  创建文件 (记住进入容器的id,创建新镜像时使用，aq34b4ete)
     exit  退出容器 （ctrl+p+q）
     sudo docker commit –m “add file” –a “admin” aq34b4ete  nwImgNm
     从已有的容器提交创建新的镜像，新镜像名称为nwImgNm
```

##### 基于本地模板导入
利用模板压缩包导入 docker import
```shell
sudo cat ubuntu-14.04-x86_64-minimal.tar.gz|docker import – ubuntu:14.04

```

##### 基于Dockerfile创建镜像
1. 创建dockerfile配置文件，并编写相关的配置

2. 创建镜像
```shell
docker buid –t [tag] [选项] 路径 . (结束“.”不可省略,-t 指定镜像的标签)
例：dockerfile所在路径为 /tmp/docker_builder，指定标签 build_repo/first_image
sudo docker build –t build_repo/first_image /tmp/docker_builder .
如果当前所在路径即为dockerfile所在路径，后面的路径可省略
sudo docker build –t build_repo/first_image .
docker images 即可查询新创建的镜像
```

#### dockerfile
Dockerfile分为4部分：

1. 基础镜像信息
```shell
FROM <IMAGE>:<TAG> 第一条指令必须为from,同一dockerfile文件创建多镜像可多from
```

2. 维护者信息
```shell
MAINTAINER <NAME>  维护者信息
```

3. 镜像操作指令
```shell
RUN <COMMAND> 或 RUN [“executable”,”param1”,”param2”] 
在当前镜像基础上执行的命令，命令长用“\”换行
```

4. 容器启动时执行指令	
```shell
 CMD[“executable”,”param1”,”param2”] 或 CMD command param1 param2
 CMD [“param1”,”param2”] 为ENTRYPOINT提供参数
 ENTRYPOINT[“executable”,”param1”,”param2”] 或 ENTRYPOINT command param1 param2
```

##### dockerfile指令
```shell
#开头注释
EXPOSE <PORT> 暴露端口
ENV <KEY> <VALUE> 指定环境变量，RUN指令可使用
ARG <NAME>=<VALUE> 定义变量，编译时传递变量
ADD <SRC> <DEST> 复制src到容器的dest,src是dockerfile所在的相对路径，也可以是url,tar压缩包时自动解压
COPY <SRC> <DEST> 复制src到容器的dest,目标路径不存在自动创建
VOLUME [“/DATA”] 创建本地主机或其他容器挂载点
USER daemon 指定用户名Uid 后续RUN 命令用此用户
WORKDIR [PATH] 为后续RUN CMD ENTRYPOINT提供工作目录
ONBUID [INSTRUCTION] 配置当所创建的镜像作为其他新创建镜像的基础时所执行后连接的指令，即对当前镜像的子镜像有效
```
ENTRYPOINT和CMD对比
- 相同点：
都只能写1条，多条只有最后一条有效
都是容器启动时执行，运行时机相同
- 不同点：
ENTRYPOINT不会被运行的command覆盖，cmd会
两命令同时存在时，cmd不完整，cmd为ENTRYPOINT提供参数
两命令同时存在时，都完整命令，谁在后面谁生效

### 容器

- 新建容器：
```shell
docker create –it ubuntu:latest  镜像tag或者name
```

- 启动容器：
```shell
docker start 容器id  或 docker restart 容器id  重新启动
```
- 新建并启动容器：
	1. 交互模式（可执行命令行）
```shell
 docker run –name blog –p 8080:8080 –v /etc/blog/static:/app/static –it blog:latest
--name 命名容器
-p 端口映射，容器应用端口映射到服务器的端口，服务器端口：容器端口
-v 挂载，将容器的配置文件静态文件等挂载到服务器上，服务器：容器
-it 交互式启动容器
```
	1. 守护态运行（不能执行命令行）
```shell
 docker run –d blog:latest
-d 守护态运行容器
```
- 中止容器 
```shell
docker stop 容器id   或  docker kill 容器id  强制停止  
```

- 查看容器
	1. 查看所有启动中的容器：
```shell
docker ps
```
	1. 查看所有容器: 
```shell
docker ps -a
```
	1. 查看所有中止的容器: 
```shell
docker ps –a -q
```

- 进入容器
```shell
docker attach 容器id  多个窗口同时操同一个容器时，所有窗口都会同步显示，某个阻塞其他无法操作
docker exec –it 容器id bash 或 docker exec –it 容器id sh (退出容器 ctrl+p+q)
```

- 删除容器（删除前需要先停止容器）
```shell
docker rm 容器id 
docker rm –f 容器id  强制删除
```

- 查看容器运行日志 
```shell
docker logs –f –t –tail 2000 容器id
```

- 导出容器 
```shell
docker export 容器id > test.tar
```

- 导入容器 
```shell
cat test.tar|docker import – test
```

- 容器互通  
```shell
docker run –d –p –name web –link db:db 镜像  --link 连接的容器：别名
```

### docker仓库
- 官方仓库，也是默认仓库 https://hub.docker.com

- 国内仓库 http://dockerpool.com

- 创建私有仓库
	1. 使用registry镜像创建私有仓库  
```shell
docker run –d –p 5000:5000 registry 自动下载并启动一个registry容器，并创建私有仓库
```

	1. 私有仓库默认存放/tmp/registry,可-v挂载 
```shell
 docker run –d –p 5000:5000 –v /opt/data/registry:/tmp/registry registry
```
#### 私有仓库管理
- 上传镜像
	1. 查看现有镜像 
```shell
docker images
```

	1. 将镜像重打标签 
```shell
	docker tag IMAGE[:TAG] [Registryhost/][username/]name[tag]
docker tag ubuntu:14.04 10.0.2.2:5000/test
```
	1. 上传镜像 
```shell
docker push 10.0.2.2:5000/test
```

- 查看仓库镜像 
```shell
curl http://10.0.2.2:5000/v1/search
```

- 下载仓库镜像 
```shell
docker pull 10.0.2.2:5000/test
```

### docker命令关系图
<img class="avatar" src="/img/docker.emf">

### 部署springboot
阿里云分离部署springboot应用

- 分离打包springboot代码，将代码、lib、static、配置文件分离

- 编写dockerfile文件
```shell
FROM frolvlad/alpine-oraclejdk8:slim
VOLUME /tmp
ARG DEPENDENCY=MyBlog
COPY ${DEPENDENCY}/BOOT-INF/lib /app/lib
COPY ${DEPENDENCY}/META-INF /app/META-INF
COPY ${DEPENDENCY}/BOOT-INF/classes /app
ENTRYPOINT ["java","-cp","app:app/lib/*","com.blog.MyBlogApplication"]
```

- 在dockerfile所在路径创建镜像  
```shell
docker build -t blog . 
```

- 创建容器，外挂配置文件 
```shell
docker run --name myblog -it -p 8081:8080 -v /etc/config/blog/META-INF:/app/META-INF  -v /etc/config/blog/lib:/app/lib -v /etc/config/blog/static:/app/static -v /etc/config/blog/application.properties:/app/application.properties -d blog
```

- 查看应用运行日志  
```shell
sudo docker logs -f -t --tail 2000 543b07175ece(容器id)
```
