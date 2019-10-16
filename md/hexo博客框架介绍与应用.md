---
title: hexo博客框架介绍与应用
date: 2019-06-20 02:29:27
categories:
  - hexo
tags:
  - hexo
  - 博客
---

hexo博客框架的安装及启动，利用hexo生成模板页面。
<!-- more -->

### 前言
#### 使用缘由
- ##### 博客数据库被黑客攻击
辛辛苦苦的十几篇博客瞬间灰飞烟灭(ps:由于没有良好的定期备份的习惯，导致不仅数据丢失，连数据结构也没有留下，唉！说多了都是泪啊，mysql数据备份电梯入口：[mysql数据库备份和还原](http://hehear.com "mysql数据库备份和还原"))，另：如果你的redis被黑客攻击了，并注入了挖矿病毒，据说这有解决办法：[redis被攻击植入qW3xT.2服务器矿工病毒](http://hehear.com "redis被攻击植入qW3xT.2服务器矿工病毒")
- ##### 见景生情想换个微博模板
伤心欲绝的博主看着空荡荡的博客就不止的悲伤难过，本身对上一博客的主题和样式不是很满意（当时不知道hexo的存在，傻傻的用爬网站工具爬去的别人博客的html和样式）
- ##### hexo博客主题丰富
打算重新爬别人的博客样式的时候发现，爬取博客是基于hexo框架的（同时发现我之前用的博客模板也是基于hexo的，而且发现了很多同一样子的博客更加加剧了我重做博客的想法），进入hexo官方发现了hexo丰富多样的主题，然后就深陷其中无法自拔

#### hexo介绍
Hexo 是一个快速、简洁且高效的博客框架。Hexo 使用 Markdown（或其他渲染引擎）解析文章，在几秒内，即可利用靓丽的主题生成静态网页。官网入口及api：[hexo官网](https://hexo.io/zh-cn/ "hexo官网")

#### hexo静态网页生成器
hexo可以快速的生成静态页面，由于hexo的项目必须要部署在github上面，博主想要自己来部署，所以博主用来当做博客的前端页面，定制页面非常高效，和之前的爬取别人的页面相比方便多了，再也不用将爬取的上百页面、css、js、image分类和调试了。

### hexo安装

------------

#### 安装前提：
安装过程参考hexo官方文档：[hexo文档](https://hexo.io/zh-cn/docs/ "hexo文档")
- ##### Node.js (Should be at least nodejs 6.9)
node安装过程请参考文章，电梯入口：[node.js安装配置](http://hehear.com "node.js安装配置")
- ##### Git
git安装，电梯入口：[git安装配置](http://hehear.com "git安装配置")

#### 安装命令
```
$ npm install -g hexo-cli
```

#### 安装完成
此时只是hexo框架安装完成，并不是生成静态文件的项目，切记！安装完hexo框架后，可在终端（cmd命令窗口）执行hexo命令

### hexo使用

------------

#### 新建hexo项目
博主打算在workspace路径下新建名为hexo的项目，用来生成博客的html静态文件
- 进入终端（windows的cmd）,进入workspace所在路径
```shell
$ cd workspace
```
- 使用hexo命令生成hexo项目
```shell
$ hexo init hexo
$ cd hexo
$ npm install
```
- 生成的hexo结构如下：
```
.
├── _config.yml
├── package.json
├── scaffolds
├── source
|   ├── _drafts
|   └── _posts
└── themes
```
	- _config.yml：hexo模板的配置信息
	- package.json：应用程序的信息
	- scaffolds：存放模板，如文章、分类、归档等动态模板
	- source：存放所需资源
	- themes：主题文件夹，用于存放下载的主题

#### 生成静态文件
```shell
$ hexo generate
```
监控文件变动自动生成静态文件：
```shell
$ hexo generate --watch
```
生成的静态文件会放在public文件夹下，直接将public拷贝即可获得静态的博客模板了

#### 启动hexo项目
```shell
$ hexo server
```
启动hexo项目默认4000端口，查看生成的模板样式，启动静态模式，只访问静态页面：
```shell
$ hexo server -s
```
其他参数：
```shell
-p, --port	#重设端口
-s, --static	#只使用静态文件
-l, --log	#启动日记记录，使用覆盖记录格式
```
hexo启动后，访问默认主题。
#### 更换模板与博客所需页面生成
请参考文章：[hexo更换主题与博客页面生成](http://hehear.com "hexo更换主题与博客页面生成")
