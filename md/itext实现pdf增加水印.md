---
title: itext实现pdf增加水印
date: 2019-09-16 15:14:27
categories:
  - pdf
tags:
  - itext
  - pdf
---

java itext 实现pdf文件增加文字水印、图片水印。
<!-- more -->

------------

### 所需jar包

```xml
<dependency>
		<groupId>com.itextpdf</groupId>
		<artifactId>itextpdf</artifactId>
		<version>5.5.13</version>
	</dependency>
	<dependency>
		<groupId>com.itextpdf</groupId>
		<artifactId>itext-asian</artifactId>
		<version>5.2.0</version>
	</dependency>

```
不要引com.lowagie的jar包，在实现过程中com.lowagie会导致字体无法引入，报错：
`Font 'STSong-Light' with 'UniGB-UCS2-H' is not recognized.`
更换com.itextpdf的itext后解决此问题。

### 代码

```java
/**
     * 
     * 【功能描述：添加图片和文字水印】 【功能详细描述：功能详细描述】
     * @param srcFile 待加水印文件
     * @param destFile 加水印后存放地址
     * @param text 加水印的文本内容
     * @throws Exception
     */
    public void setWaterMark(String input, String output, String text,
            int textWidth, int textHeight) throws Exception
    {
        // 待加水印的文件
        PdfReader reader = new PdfReader(input);
        // 加完水印的文件
        PdfStamper stamper = new PdfStamper(reader, new FileOutputStream(
                output));
        int total = reader.getNumberOfPages() + 1;
        PdfContentByte content;
        // 设置字体
        BaseFont base = BaseFont.createFont("STSong-Light", "UniGB-UCS2-H", BaseFont.EMBEDDED);
        // 循环对每页插入水印
        for (int i = 1; i < total; i++)
        {
            // 水印的起始 下面
            content = stamper.getUnderContent(i);
			//上面覆盖水印
			//content = stamper.getOverContent(i);
			//透明度
			PdfGState gs = new PdfGState();
			gs.setFillOpacity(2f);
			gs.setStrokeOpacity(2f);
			content.setGState(gs);
			
            // 开始
            content.beginText();
            // 设置颜色
            //content.setColorFill(BaseColor.BLACK);
             content.setColorFill(Color.GRAY);
            // 设置字体及字号
            content.setFontAndSize(font, 50);
            // 设置起始位置
            //content.setTextMatrix(70, 200);
            content.setTextMatrix(textWidth, textHeight);
            // 开始写入水印
            content.showTextAligned(Element.ALIGN_LEFT, text, 300,350, 45);
			
			//图片
			Image image = Image.getInstance("G:/2.jpeg");
            img.setAlignment(Image.LEFT | Image.TEXTWRAP);
            img.setBorder(Image.BOX); img.setBorderWidth(10);
            img.setBorderColor(BaseColor.WHITE); img.scaleToFit(100072);//大小
            img.setRotationDegrees(-30);//旋转
            image.setAbsolutePosition(200, 206); // set the first background
             // image of the absolute
            image.scaleToFit(200, 200);
            content.addImage(image);
            content.setColorFill(Color.BLACK);
            content.setFontAndSize(base, 8);
            content.showTextAligned(Element.ALIGN_CENTER, text, 300, 10, 0);
			
            content.endText();
        }
        stamper.close();
		bos.close();
		reader.close();
    }
```