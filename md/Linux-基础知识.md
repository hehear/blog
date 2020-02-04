---

title: Linux-基础知识

date: 2020-01-12 01:14:27

categories:

  - Linux

tags:

  - Linux

---

Linux-基础知识，简单介绍linux系统的文件目录结构，和基础命令。

<!-- more -->

------------

### 系统结构

- /bin ：存放二进制可执行文件（ls、cat、mkdir），常用命令一般都在这里。
- /etc：存放系统管理和配置文件。
- /home：存放所有用户文件的根目录，是用户目录的基点，比如用户user的主目录就是/home/user。
- /usr：用于存放系统应用程序。
- /opt：额外安装的可选应用程序包所放置的位置。一般情况下，我们可以把tomcat等安装到这里。
- /proc：虚拟文件系统目录，是系统内存的映射，可直接访问这个目录来获得系统信息。
- /root：系统管理员的主目录。
- /sbin：存放二进制可执行文件，只有root才能访问，这里存放的是系统管理员使用的系统级别的管理命令和程序，如ifconfig等。
- /dev：用于存放设备等文件。
- /mnt：系统管理员安装临时文件系统的安装点，系统提供这个目录是让用户临时挂在其他的文件系统。
- /boot：存放用于系统引导时使用的各种文件。
- /lib：存放和系统运行相关的库文件。
- /temp：用于存放各种临时文件，是公用的临时文件存放点。
- /var：用于存放运行时需要改变数据的文件，，也是某些大文件的溢出区，例如各种服务的日志文件（系统启动日志等）。
- /lost+found：这个目录平时是空的，系统非正常关机而留下的无家可归的文件都在这里。

### 基本命令

#### 文件夹切换命令

-  进入该目录下的hehear文件夹里

  ```shell
  cd hehear
  ```

- 切换到上一层文件夹

  ```shell
  cd ..(或 cd ../)
  ```

-  切换到系统根目录

  ```shell
  cd /
  ```

-  切换到用户的主目录

  ```shell
  cd ~
  ```

-  切换到上一个操作所在目录

  ```shell
  cd -
  ```

#### 文件夹操作命令

-  创建文件夹hehear

  ```shell
  mkdir hehear
  ```

- 查看文件夹下所有的文件/文件夹

  ```shell
  ls
  ```

- 查看文件夹下所有文件/文件夹的详细信息

  ```shell
  ll（ls -l）
  ```

- 列出当前文件夹及子文件夹下所有的文件和文件夹

  ```shell
  find . 
  ```

- 在/home文件下查找所有以.txt结尾的文件

  ```shell
  find /home -name "*.txt" 
  ```

- 当前文件夹及子文件夹下查找所有以.txt和.pdf的文件

- ```shell
  find . -name "*.txt" -o -name "*.pdf"
  ```

- 修改文件夹名称,将和hear文件夹名称改为newhehear

  ```shell
  mv hehear newhehear
  ```

- 移动文件夹位置，将当前目录下的hehear文件夹**移动**到/home文件夹下，并将名称改为newhehear

  ```shell
  mv hehear /home/newhehear
  ```

- 复制拷贝文件夹，将当前目录下的hehear文件夹**复制**到/home文件夹下，并将名称改为newhehear

  ```shell
  cp -r hehear /home/newhehear
  ```

- 删除文件夹

  ```shell
  rm -rf hehear
  ```

#### 文件操作命令

- 创建文件

  ```shell
  touch hehear.txt
  ```

- 查看文件

  ```shell
  cat hehear.txt
  # 查看显示文件内容
  
  more hehear.txt
  # 可以显示百分比，回车可以向下一行，空格可以向下一页，q结束查看
  
  less hehear.txt 
  # 使用键盘的PgUp和PgOn向上下翻页，q结束查看
  
  tail -10 hehear.txt
  # 查看文件的后10行，Ctrl+C结束
  ```

- 查看日志，动态监控

  ```shell
  tail -fn 2000 /catalina.out
  # tail -f 文件，可以对某个文件进行动态监控，上面的意思为，查看当前日志向上2000行的日志信息
  ```

- 查看时间范围内的指定报错信息的日志

  ```shell
  sed -n '/2019-12-24/,/2019-12-25/p' /catalina.out | grep "系统出错" -C 10
  
  # 打印日志文件中 2019-12-24日一整天，所有“系统出错“行日志的前后10行 -C 前后   -B 前  -A 后
  ```

- 修改文件

  ```shell
  vim hehear.txt
  # 进入文件，按i进入编辑模式，修改文件后，按Esc进入命令模式，输入:wq(保存退出)
  ```

- 删除文件

  ```shell
  rm -rf hehear.txt
  # 记住 rm -rf
  ```

#### 压缩文件操作命令

- 打包压缩文件

  ```shell
  tar -cvf hehear.tar hehear
  # -c –create 指导tar创建归档文件。
  # -v–verbose（adj，冗长的，啰嗦的）用于列出命令的执行过程，如果嫌麻烦，大可省略。
  # -f –file用于指定归档文件的文件名。
  # hehear.tar代表你自己起的归档文件的名字。
  ```

- 解压缩文件

  ```shell
  tar -xvf hehear
  # -x用于解压缩
  
  yum install -y unzip zip
  unzip hehear.zip
  # 安装zip解压缩工具，unzip解压缩zip包
  ```

#### 其他常用命令

- 显示当前位置

  ```shell
  pwd
  ```

- 以系统管理员的身份执行命令，root亲自执行

  ```shell
  sudo find /Users/runningcoder/git -name ".svn" -exec rm -r {} \;
  
  # 删除/Users/runningcoder/git 目录下所有以.svn结尾的文件
  ```

- 搜索字符串高亮显示

  ```shell
  grep 要搜索的字符串 文件 --color
  ```

- 查看进程

  ```shell
  ps -ef
  ps -aux
  # 这两个命令都是查看系统正在进行进程，两者区别是显示的格式不同，查看特定进程：
  ps -aux | grep redis
  pgrep redis -a
  ```

- 杀掉进程

  ```shell
  kill -9 进程id
  # -9表示强制终止
  ```

- 网络通信命令

  ```shell
  ifconfig
  # 查看当前网络信息
  
  ping ip地址
  # 查看ip地址是否联通
  
  netstat -an
  # 查看当前系统的端口使用情况
  ```

- 防火墙端口

  ```shell
  # centos 7
  # 查看
  firewall-cmd --list-ports
  # 开启防火墙
  systemctl start firewalld
  # 开放
  firewall-cmd --zone=public --add-port=8080/tcp --permanent
  
  # 查看
  firewall-cmd --zone= public --query-port=80/tcp
  
  # 删除
  firewall-cmd --zone=public --remove-port=6379/tcp --permanent
  # 重启生效
  firewall-cmd --reload
  
  # centos 7以下
  # 开服务
  service iptables start
  
  # 1.开放8080 端口
  /sbin/iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
  # 关闭端口：
  iptables -A OUTPUT -p tcp --dport 18018 -j DROP
  
  # 2.保存
  /etc/rc.d/init.d/iptables save
  
  # 3.查看打开的端口
  /etc/init.d/iptables status
  
  # 4.关闭防火墙 
  # 1） 永久性生效，重启后不会复原
  # 开启： 
  chkconfig iptables on
  # 关闭： 
  chkconfig iptables off
  # 2） 即时生效，重启后复原
  # 开启： 
  service iptables start
  # 关闭： 
  service iptables stop
  ```

- 关机重启

  ```shell
  shutdown -h now
  # 现在立即关机
  
  shutdown +5 
  # 指定五分钟后关机，同时发送警告信息给用户
  
  reboot
  # 重启
  ```

  