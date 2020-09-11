---
title: itext生成pdf中文换行问题
date: 2020-04-01 01:14:2ß7
categories:
  - pdf
tags:
  - pdf
  - itext

---

解决itext生成pdf文件时中文换行的问题，由于使用低版本的flying saucer，不支持中文换行，本文给出了在不更改jar包的前提下的，可实施的解决方案。
<!-- more -->

------------

### 问题描述
 之前的文章提到了笔者使用itext+f lying saucer+freemarker生成pdf的实现方案，项目中所有的报表功能早期都使用了这种方案，由于flying saucer的版本的jar包不支持中文字符的自动换行，之前的功能由于都是固定的文字，在换行的位置，增加空格来手动换行。

但是最近的业务需求中，模板内容不是固定的，里面有变量的金额字段，由于变量的内容和数值与中文字符长度也不相同，之前手动加空格的解决方案显然是不行的。网上查资料了解到，大部分的解决方案是，**一是替换更新的jar包，支持中文换行；二是更改jar内容，增加中文的判断与换行**。

由于项目中报表功能涉及的功能较多，更换或者修改jar包的话，影响范围太大，根本没有时间来调整模板格式，和测试功能。所有只能尽量在影响范围小的情况下，实现中文换行问题。

### 解决方案

#### 根据变量长度手动换行

刚开始的想法是根据变量的长度，在ftl模板文件中，用if else 组合p标签手动换行，但是在code过程中发现，变量的值不确定，只能大致的划分换行范围，如果变量的值太大或者太小，均会有问题。并且在ftl模板中，写太多的if else模板逻辑会混乱。此方案放弃。

#### java代码中根据长度分割

既然在模板中if else判断不可行，然后就想能不能在java代码中来根据每行的字符数来分割内容呢，在实现后发现，变量的数值的长度和中文的长度相差太多，如果变量长度小的时候还可以，如果变量值长度很大，换行还是会出现问题。此方案不可行。

在思考过后发现出现这种情况是字体中中文字符和数值、英文字符字体宽度不同造成，并且了解到等宽字体可以解决此问题，但是等宽字体与常规字体长的不一样，不太符合当前的业务。

既然原因出在字体宽度上，那我们能不能获取到字体的宽度呢？答案是肯定的。获取到了字体宽度，也就实现了一半了。

#### 通过字体宽度切割每行的内容

通过查资料了解到，itextpdf包下的BaseFont类可以获取字符对应字体下的字体宽度，这样我们就可以利用这个方法，先获取一行的字体宽度，然后将要展示的内容切割，获取字体宽度的时候需要字体double型的字体大小，但是实际生成pdf设置的字体大小是像素。

其实设置字体大小时可以随意设置，只要在获取整行和整个内容时使用相同大小就可以，比例相同即可。

实现代码如下：

```java

private List<String> getPdfContentLineList(String content){
  // 结果行数据集合
  List<String> resultList = new ArrayList<String>();
  // 内容切割成字符数组
  char[] contentChars = content.toCharArray();
  // 要展示的单行
  String lineContent = "我是行内容我是行内容我是行内容我是行内容"；
  // 获得字体
  BaseFont font = BaseFont.createFont("STSong-Light","UniGB-UCS2-H",BaseFont.EMBEDDED);
  // 单行内容的字体宽度,给定大小1.2f
  float lineWidth = font.getWidthPoint(lineContent,1.2f);
  // 切割后的单行结构
  String lineResult = "";
  
  // 遍历切割
  for(int i=0;i<contentChars.lenth;i++){
    // 单个字符
    String contentChar = contentChars[i];
    // 拼接行内容
    lineResult += contentChar;
    // 拼接后的行宽度
    float currLineWidth = 
      font.getWidthPoint(lineResult,1.2f)；
    // 加上下一字符  
    float lineAddNextCharWidth = 0f;  
      
    if(i!=contentChars.length-1){
      // 加上下一个字符
      String lineAddNextCharWidth = currLineWidth+contentChars[i+1];
      //加后的宽度
      lineAddNextCharWidth = 
      font.getWidthPoint(lineResult,1.2f)；
    }else{
      //最后一个字符，加入行退出循环
      resultList.add(currLineWidth);
      break;
    }
    
    //满足行条件，行内容加入结果集合
    if(currLineWidth == lineWidth || (currLineWidth<lineWidth && lineAddNextCharWidth>lineWidth ){
      // 加入集合
      resultList.add(currLineWidth)
      // 行结果清空
      currLineWidth="";
    } 
  }
  
  return resultList;
    
}

```

