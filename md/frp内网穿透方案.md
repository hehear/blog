---
title: frp内网穿透方案
date: 2020-08-24 01:14:27
categories:
  - tools
tags:
  - frp
---

frp内网穿透方案，frp反向代理实现内网穿透，通过访问映射的外网域名端口，实现对内网服务器ssh、web、ftp等功能。
<!-- more -->

------------

### 需求背景

之前活动办的单核2g的阿里云服务器性能有限，运行一个mysql加2个应用内存就快被打满了，所以就打算用自己的台式机作为家用服务器，本文记录了外网能够访问内网应用的实现过程。

网上查询了很多内网做服务器的实现方案：

- 具有公网ip，如果能获得公网ip的的话，直接访问ip即可
- 内网穿透，即通过第三方代理，访问代理服务器转到内网

由于家里是移动的宽带，获得公网ip没得可能，据说电信宽带可能有公网ip，电信网的童鞋可以试一试。所以想要内网做对外服务器，只能通过内网穿透来实现了。

### 方案选定

网上好多内网穿透的应用，如花生壳、nat123等等，可以将内网的端口穿透到外网，博主开始用花生壳实现了，但是免费版限流限量，操作繁琐，想绑定自己的域名也不好操作。所以抛弃此方案。

偶然间发现了frp内网穿透，可对外提供ssh、web端口，刚好满足我的需求，并且可免费使用（白嫖党首选，哈哈哈）。

### 环境准备

- 一台部署应用的内网机器（最好linux，windows开发ssh22端口比较麻烦，尝试失败后放弃；windows子系统linux同样的问题）
- 一台具有公网ip的云服务器（安装nginx进行域名转发）
- 一个备案好的域名（配置不同二级域名映射不同的web应用）

### 方案执行

#### 下载安装frp

frp官方文档：https://gofrp.org/docs/

frp官方下载地址：https://github.com/fatedier/frp/releases

github下载速度贼慢的，可以通过加速网站下载，将下载链接贴入即可：https://toolwa.com/github/

linux上下载，可用wget+下载连接，即：

```shell
wget https://download.fastgit.org/fatedier/frp/releases/download/v0.33.0/frp_0.33.0_linux_amd64.tar.gz
```

##### 内网电脑

将下载的frp压缩包解压：

```shell
tar xzvf frp_0.33.0_linux_amd64.tar.gz
```

将解压的文件夹移动重命名到/opt/frp下

```shell
mv frp_0.33.0_linux_amd64 /opt/frp
```

##### 云服务器

和内网一样，解压并移动重命名，放到自己统一管理的位置，以便统一配置记录。正常来说应该移动到opt下，由于我所有的应用配置都放在etc/config下了，frp也放在这下面了。

```shell
tar xzvf frp_0.33.0_linux_amd64.tar.gz
mv frp_0.33.0_linux_amd64 /etc/config/frp
```

#### 配置frp

##### 内网电脑

配置frcp.ini文件

```ini
[common]
#阿里云服务器ip
server_addr = 101.132.97.220
#映射云服务端口
server_port = 7000

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
#云服务端口，ssh连接时，即云服务的ip，和这里配置的端口,登陆时输入内网的账号密码
remote_port = 6000

[web1]
#web应用端口1
type = http 
#本地应用端口
local_port = 3000  
#应用映射的域名
custom_domains = mysite.hehear.com

[web2]
#web应用端口2
type = http         
local_port = 8080   
custom_domains = mysite1.hehear.com

[mysql]
type = tcp
local_ip = 127.0.0.1
local_port = 3306
#云服务器的映射端口
remote_port = 7002
```

##### 云服务器

配置frps.ini

```ini
[common]
#frp服务的开发端口，和内网对应
bind_port = 7000
#应用的开放端口
vhost_http_port = 8088
#frp监控统计端口
dashboard_port = 7001
```

配置nginx

```conf
server {
        listen       80;
        server_name mysite.hehear.com www.mysite.hehear.com ;

         location / {
			 proxy_pass http://mysite.hehear.com:8088;
        }
}
```

配置阿里云安全组，开放6000、7000、7001、7002、8088端口

配置云服务器防火墙，开发上述端口：

```shell
firewall-cmd --zone=public --add-port=6000/tcp --permanent
firewall-cmd --reload
```

#### 启动frp

##### 内网电脑

```shell
cd /opt/frp
#临时启动
./frpc -c ./frpc.ini
#后台启动
nohup ./frpc -c ./frpc.ini &
```

##### 云服务器

```shell
cd /etc/config/frp
#临时启动
./frps -c ./frps.ini
#后台启动
nohup ./frps -c ./frps.ini &
```
##### 启动sh

编写内网开机启动脚本start.sh,开机启动直接运行 sh start.sh即可：

```shell
#启动docker
systemctl start docker
#启动应用容器
docker start mysql
#后台启动frpc客户端
cd /opt/frp
nohup ./frpc -c ./frpc.ini &
```

#### 关闭frp

```shell
#查看进程
ps -ef|grep frp|grep -v grep
#杀掉进程
kill -9 进程id
```


#### 配置frp服务

远程增加应用端口时，需要修改frp配置文件，增加端口映射。更改完需要重启frp，此时就需要配置frp服务，重启服务来实现。下文以配置frpc为例，frps配置与frpc相同。

##### 进入服务编写路径

```shell
cd /usr/lib/systemd/system
```

##### 编写frpc服务

```shell
vi frpc.service
```

```shell
[Unit]
Description=frpc
After=network.target network-online.target syslog.target
Wants=network.target network-online.target

[Service]
Type=simple
# 配置启动路径
ExecStart=/opt/frp/frpc -c /opt/frp/frpc.ini

[Install]
WantedBy=multi-user.target
```

##### 启动服务

```shell
# 启动服务
sudo systemctl start frpc
# 开机启动
sudo systemctl enable frpc
# 查看运行状态
systemctl status frpc
# 重启服务
systemctl restart frpc
# 停止服务
systemctl stop frpc
```

### 方案完成

自此配置完成，可通过公网的ip和对应的映射端口，进行ssh连接，和web应用的访问了，ssh连接时发现不能直接root用户连接，但是可以su root切换到root用户，所以不影响使用(ps:内网为deepin时，出现此情况，centos可以root直接连接，deepin经测试非常不稳定，桌面容易黑屏死机，推荐centos)。


总结下来，除去配置服务器环境，frp的配置使用贼简单，是目前网上找到的符合当前需求的最完美解决方案，8核cpu，16g内存的服务器不要太爽，哈哈哈哈哈。