---
title: hehear博客创建过程
date: 2019-06-30 03:29:27
categories:
  - node.js
tags:
  - node.js
  - hexo
  - docker
  - elasticsearch
  - nginx
  
---

最近上线了新的个人博客项目，使用hexo博客模板主题作为博客的前端页面，node.js作为前端服务器，elasticsearch作为搜索引擎（ps:由于es部署最低2g的内存，博主的乞丐版服务器一共才2g，上线时改用直接查库，由于本地部署了es，在此记录一下如何使用部署es），数据库使用mysql,在阿里云使用docker进行项目的部署,nginx进行域名转发，此篇博客记录实现全过程。
<!-- more -->

### 前端页面
#### hexo博客框架搭建
电梯直达：[hexo博客框架介绍与应用](http://hehear.com/article/2.html "hexo博客框架介绍与应用")
#### hexo博客主题应用，获得博客静态页面
电梯直达：[hexo博客主题应用，获得博客静态页面](http://hehear.com "hexo博客主题应用，获得博客静态页面")
### node.js搭建前端服务器
电梯直达：[node.js搭建博客服务器](http://hehear.com "node.js搭建博客服务器")
### mysql数据库表设计
电梯直达：[mysql博客数据库搭建及设计](http://hehear.com "mysql博客数据库搭建及设计")
### elasticsearch实现检索
电梯直达：[elasticsearch部署及应用](http://hehear.com "elasticsearch部署及应用")
### docker部署node.js项目
电梯直达：[docker部署node.js项目](http://hehear.com "docker部署node.js项目")
### nginx域名转发
电梯直达：[nginx配置域名端口转发](http://hehear.com "nginx配置域名端口转发")