---
title: pdf生成的java实现方案
date: 2019-08-09 23:14:27
categories:
  - itext
tags:
  - itext
  - flying-saucer
  - freemarker
  - pdf
---

itext+flying-saucer+freemarker生成pdf的java实现方案，本文介绍利用模板动态生成pdf的java实现方案，包括freemarker模板渲染(支持css样式渲染)、动态生成报表、支持中文字体、全角半角空格等，生成pdf并实现预览。
<!-- more -->


------------

### 生成pdf

#### pom引入所需jar包

```xml
		<!--itext -->
		<dependency>
			<groupId>com.itextpdf</groupId>
			<artifactId>itextpdf</artifactId>
			<version>5.5.8</version>
		</dependency>
		<!--flying-saucer -->
		<dependency>
			<groupId>org.xhmtlrenderer</groupId>
			<artifactId>flying-saucer-pdf</artifactId>
			<version>9.1.18</version>
		</dependency>
		<!--freemarker -->
		<dependency>
			<groupId>org.freemarker</groupId>
			<artifactId>freemarker</artifactId>
			<version>2.3.20</version>
		</dependency>
```
itext版本5.0以上，flying-saucer版本9.1以上，低版本的itext不支持中文，低版本flying-saucer字体库加中文后不支持中文换行，需要支持需要更改flying-saucer源代码，并且不支持全角半角空格，对于格式严格要求的报表pdf很不友好。

#### html生成工具类

```java

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

/**
 * 采用FreeMarker，将ftl文件处理成HTML文件的工具类
 *
 */
@Component
public class HtmlGenerator {

	private static final Logger LOGGER = Logger.getLogger(HtmlGenerator.class);

    private  String templatePath = "/home/app/html";
    
    private static Configuration config = null;
    @PostConstruct
    public void init(){
        config = new Configuration();
        config.setDefaultEncoding("UTF-8");
        try {
            config.setDirectoryForTemplateLoading(new File(templatePath));
        } catch (IOException e) {
        	LOGGER.warn(e.getMessage());
        	LOGGER.warn("初始化freemarker环境失败");
        }
    }

    /**
     * 根据FTL模板文件生成HTML
     *
     * @param ftlInput
     *          ftl模板文件的位置
     * @param htmlOutput
     *          html的输出路径
     * @param variables
     *          模板需要的内容
     */
    public static int generate(String ftlInput, String htmlOutput, Map<String, Object> dataMap){
        Template template;
		try {

			File outFile = new File(htmlOutput);
			FileOutputStream fos = new FileOutputStream(outFile);

			// 字符编码设置好
			Writer out = new BufferedWriter(new OutputStreamWriter(fos, "UTF-8"));

			config.setDefaultEncoding("UTF-8");
			template = config.getTemplate(ftlInput);
			template.setEncoding("UTF-8");
			template.process(dataMap, out);
			out.flush();

			fos.close();
			out.close();

			return 0;
		} catch (TemplateException | IOException e) {
        	LOGGER.warn(e.getMessage());
        	LOGGER.warn("根据ftl,生成HTML失败");
        }
        return 1;
    }
}

```
#### 文件处理工具类

```java

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.cfets.cwap.s.util.StringUtil;

/**
 * 文件处理相关功能的类
 */
public class FileUtil {

    /**
     * 获取指定目录下所有的文件的文件名，递归
     *
     * @param baseDir
     * @return
     */
    public static List<String> getAllFileNames(String baseDir) {
        File baseFile = new File(baseDir);

        if (!baseFile.exists()) {
            return null;
        }
        if (baseFile.isFile()) {
            return null;
        }
        List<String> fileNameList = new ArrayList<String>();
        File[] srcFiles = baseFile.listFiles();
        for (File file : srcFiles) {
            if (file.isDirectory()) {
                fileNameList.addAll(getAllFileNames(file.getAbsolutePath()));
            } else {
                fileNameList.add(file.getAbsolutePath());
            }
        }
        return fileNameList;
    }
}
```

#### pdf生成工具类

```java
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import javax.annotation.PostConstruct;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.xhtmlrenderer.pdf.ITextFontResolver;
import org.xhtmlrenderer.pdf.ITextRenderer;

import com.itextpdf.text.pdf.BaseFont;

/**
 * 采用IText将html格式的文件，渲染成PDF的处理类
 */
@Component
public class PdfGenerator {

	private static final Logger LOGGER = Logger.getLogger(PdfGenerator.class);

	private String fontPath = "/home/app/report/font";

	private static String staticFontPath;
    @PostConstruct
    public void init(){
        PdfGenerator.staticFontPath = this.fontPath;
    }

	/**
	*	初始化 ITextRenderer
	**/
    public static ITextRenderer getRenderer(){
        ITextRenderer renderer = new ITextRenderer();
		//获得字体路径集合
        List<String> fonts = FileUtil.getAllFileNames(staticFontPath);
        ITextFontResolver fontResolver = renderer.getFontResolver();
        try{
			//加载所有字体
            for(String font:fonts) {
                fontResolver.addFont(font, BaseFont.IDENTITY_H, BaseFont.NOT_EMBEDDED);
            }
        } catch (Exception e) {
        	LOGGER.warn(e.getMessage());
        	LOGGER.warn("初始化IText环境失败");
        }
        return renderer;
    }
    /**
     * 根据html文件生成pdf文件
     *
     * @param htmlInput
     *          html的文件位置
     * @param pdfOutput
     *          pdf输出路径
     */

    public  static int generate(String htmlInput, String pdfOutput, ITextRenderer iTextRenderer){
        File pdf = new File(pdfOutput);
        OutputStream out = null;
        try {
            out = new FileOutputStream(pdf);
            String htmlURL = new File(htmlInput).toURI().toURL().toString();
            iTextRenderer.setDocument(htmlURL);
            iTextRenderer.layout();
            iTextRenderer.createPDF(out);
            out.flush();
            out.close();
            return 0;
        } catch ( Exception e) {
        	LOGGER.warn(e.getMessage());
        	LOGGER.warn("根据HTML渲染PDF失败");
        }
        return 1;
    }
}

```
#### ftl模板

```html
<html>
<head>
<#-- css样式 -->
<link rel="stylesheet" type="text/css" href="ntc.css"/>
</head>
<body>
	<h1>Just a blank page</h1>
	<table>
		<tr>
			<td>Name</td>
			<td>Age</td>
			<td>Sex</td>
		</tr>
		<#list userList as user>
			<tr>
				<td>${user.name}</td>
				<td>${user.age}</td>
				<td>
					<#if user.sex =1>
						male
					<#else>
						female
					</#if>	
				</td>
			</tr>
		</#list>
	</table>

</body>
</html>
```
#### 模板数据对象

```java
public class User {

	private String name;
	private int age;
	private int sex;
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getAge() {
		return age;
	}
	public void setAge(int age) {
		this.age = age;
	}
	public int getSex() {
		return sex;
	}
	public void setSex(int sex) {
		this.sex = sex;
	}
}
```
#### 调用方法生成pdf
```java
		//pdf生成路径
		String outputFile = "/home/app/pdf/demo.pdf";
		//	html路径
		String htmlStr="/home/app/html/demo.html";
		//模板数据map
		Map<String,Object> dataMaps = new HashMap<String,Object>();
		List<User> userList = new ArrayList<User>();
		User tom = new User("Tom", 3, 1);
		User merry = new User("merry", 3, 0);
		User leo = new User("leo", 22, 1);
		userList.add(tom);
		userList.add(merry);
		userList.add(leo);
		dataMaps.put("userList", userList);

		//dataMaps.put("不间断全角空格", "\u00a0");
		//dataMaps.put("英文半角空格 ", "\u0020");
		//dataMaps.put("中文全角空格", " \u3000");

		//生成html文件
		HtmlGenerator.generate("/home/app/pdf/demo.ftl",htmlStr, dataMaps);

		//生成pdf
		ITextRenderer iTextRenderer = PdfGenerator.getRenderer();
		PdfGenerator.generate(htmlStr,outputFile, iTextRenderer);
```
### pdf预览

#### 后端读取pdf流

```java
/**
	 * pdf预览
	 * 
	 */
	@RequestMapping(value = "/preview")
	public static void previewPdf(HttpServletResponse rep)
			throws IOException {
		String pdfPath = "/home/app/pdf/demo.pdf";
		File pdfFile = new File(pdfPath);
		rep.setContentType("application/pdf");
		rep.setStatus(HttpServletResponse.SC_OK);
		//设置预览名称
		rep.setHeader("content-disposition", "filename=" + pdfFile.getName());
		FileInputStream inputStream = new FileInputStream(pdfFile);
		OutputStream outputStream = rep.getOutputStream();
		byte[] buffer = new byte[1024];
		int len = 0;
		//读取返回客户端
		while ((len = inputStream.read(buffer)) > 0) {
			outputStream.write(buffer, 0, len);
		}
		inputStream.close();
		outputStream.close();
	}
```
#### 前端调用预览请求
```html
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>pdf demo</title>
</head>
<body>
	<div align="center" style="background: #eee;">
		<br> <font size="3"><b>PDF DEMO</b></font> <br>
	</div>

	<div align="center" style="background: #eee;">
		<br> <input name="button" type="button" onclick="preview()"
			value="预览"> <br>
	</div>
	<script type="text/javascript">
      	function preview(){
      		window.open("pdfdemo?method=previewPdf", "newwindow", "height=500,width=600,top=100,left=350");
<%--       		window.location.href ="<%=request.getContextPath() %>/pdfdemo?method=previewPdf";
 --%>      	}
      </script>
</body>
</html>
```
