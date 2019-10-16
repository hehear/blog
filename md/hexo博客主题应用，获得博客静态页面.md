---
title: hexo博客主题应用，获得博客静态页面
date: 2019-06-29 02:29:27
categories:
  - hexo
tags:
  - hexo
  - 博客
---

hexo博客框架主题安装及配置，获得定制的博客模板静态页面。博主选择的是hexo的Material X主题（官网主题入口：[hexo官网主题](https://hexo.io/themes/ "hexo官网主题")），Material X主题官网：[Material X主题官网](https://xaoxuu.com/wiki/material-x/ "Material X主题官网")
<!-- more -->

### hexo主题下载
#### 下载主题到 themes/ 文件夹
进入hexo所在目录
```bash
cd hexo
```
或者直接在webstorm/visual studio打开hexo项目，打开终端命令窗口，git拉取Material X主题代码：
```bash
git clone https://github.com/xaoxuu/hexo-theme-material-x themes/material-x
```
#### 安装必要的依赖包
```bash
npm i -S hexo-generator-search hexo-generator-json-content hexo-renderer-less
```
#### 博客主题修改为MaterialX
修改hexo的根目录下配置文件_config.yml：
```yaml
themes: material-x
```
### hexo配置文件配置
#### 站点信息配置
hexo根目录下配置文件_config.yml：
```yaml
# Site
title: hehear
subtitle: blog
description: hehear's Blog
keywords: blog
author: cola
favicon: /img/logo.ico
avatar: /img/hear.png
language: zh-CN
timezone:
```
hexo/themes/material-x/_config.yml配置文件：
```yaml
info:
  name: hehear
  docs: https://hehear.com
  cdn: # 把对应的那一行注释掉就使用本地的文件
    css:
       style: https://cdn.jsdelivr.net/gh/xaoxuu/cdn-material-x@19.4.19/css/style.css
    js:
      app: https://cdn.jsdelivr.net/gh/xaoxuu/cdn-material-x@19.4.19/js/app.js
      search: https://cdn.jsdelivr.net/gh/xaoxuu/cdn-material-x@19.4.19/js/search.js
      volantis: https://cdn.jsdelivr.net/gh/xaoxuu/volantis@1/js/volantis.min.js
```
css文件js文件路径配置，注掉使用本地文件，可进行修改，定制化使用。

#### 页面功能导航URL配置
##### 主页封面菜单
hexo/themes/material-x/_config.yml配置文件：
```yaml
# page的封面
cover:
  scheme: search    # 后期将会提供多种封面方案
  # height: half      # full（默认值）: 首页封面占据整个第一屏幕，其他页面占半个屏幕高度， half: 所有页面都封面都只占半个屏幕高度
  title: "hehear"
  # logo: assets/logo.png    # logo和title只显示一个，若同时设置，则只显示logo
  # search_placeholder: '搜索'
  # 主页封面菜单
  features:
    - name: 博文
      icon: fas fa-rss
      url: /
    - name: 归档
      icon: fas fa-archive
      url: archives/
    - name: 版本
      icon: fas fa-history
      url: history/
      rel: nofollow
    - name: 关于
      icon: fas fa-info-circle
      url: about/
      rel: nofollow
```
##### 桌面端导航栏菜单
hexo/themes/material-x/_config.yml配置文件：
```yaml
# 桌面端导航栏菜单
menu_desktop:
  - name: HOME
    icon: fas fa-home
    url: /
  - name: 分类
    icon: fas fa-folder-open
#    url: blog/categories/
    url: categories/
    rel: nofollow
  - name: 标签
    icon: fas fa-hashtag
#    url: blog/tags/
    url: tags/
    rel: nofollow
  - name: 归档
    icon: fas fa-archive
    url: archives/
    rel: nofollow
```
##### 手机端导航菜单
hexo/themes/material-x/_config.yml配置文件：
```yaml
# 手机端导航菜单（从右上角的按钮点击展开）
menu_mobile:
  - name: HOME
    icon: fas fa-home
    url: /
  - name: 文章归档
    icon: fas fa-archive
    url: archives/
    rel: nofollow
  - name: 版本历史
    icon: fas fa-history
    url: projects/
  - name: 我的友链
    icon: fas fa-link
    url: friends/
    rel: nofollow
  - name: 正在建设中
    icon: fas fa-book
    url: \#/
    rel: nofollow
  - name: 关于小站
    icon: fas fa-info-circle
    url: about/
    rel: nofollow
```
##### Valine评论插件配置
Valine官网：[valine官网](https://valine.js.org "valine官网")
hexo/_config.yml:
```yaml
leancloud:
  app_id: 你的appId
  app_key: 你的appKey
```
themes/material-x/_config.yml：
```yaml
valine:
  enable: true # 如果你想用Valine评论系统，请设置enable为true
  volantis: true # 是否启用volantis版本（禁止匿名，增加若干贴吧、QQ表情）
  # 还需要在根目录配置文件中添加下面这三行内容
  # leancloud:
  #   app_id: 你的appId
  #   app_key: 你的appKey
  guest_info: nick,mail,link #valine comment header info
  placeholder: 快来评论吧~ # valine comment input placeholder(like: Please leave your footprints )
  avatar: mp # gravatar style https://valine.js.org/avatar
  pageSize: 20 # comment list page size
  verify: false # valine verify code (true/false)
  notify: false # valine mail notify (true/false)
  lang: zh-cn
  highlight: false
```

### 写博客
hexo博客框架支持markdown格式文件生成html静态文件。在 hexo/source/_posts 下创建 *.md格式的博客文章模板文件。格式如下：
```markdown
---
#文章标题
title: hexo博客框架介绍与应用
#发布日期
date: 2019-06-20 02:29:27
#分类
categories:
  - hexo
#标签
tags:
  - hexo
  - 博客
---

hexo博客框架的安装及启动，利用hexo生成模板页面。
#增加阅读全文按钮，后面的内容折叠，点击阅读全文显示文章内容
<!-- more -->
文章内容。。。。。。
```
### 生成博客静态页面
执行hexo命令生成html静态页面：
```bash
hexo generate
```
静态文件生成路径：hexo/public,直接copy文件夹可做完全静态的博客使用，至此博客静态页面准备完毕。
