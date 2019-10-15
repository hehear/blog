const express =require('express');
const app=express();
const config=require('./config/config');
const logger = require('./config/log4js');
const fs=require('fs');
const moment=require('moment');
const http =  require('http');
const querystring=require('querystring');
const { URL } = require('url');
const request = require('request');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const htmlStaticParse = require('./app/util/htmlStatic');
const staticConfig=require("./config/htmlStaticConfig");



app.listen(config.port,function(){
    logger.info('服务已经就绪[%d]',config.port);
});

const bodyParser = require('body-parser');
const path = require('path');

// 添加 body-parser 中间件就可以了,用來接收post提交的數據
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//配置摸板引擎
var swig = require('swig');
//参数1，摸板引擎的名称，固定字段
//参数2，摸板引擎的方法
// app.engine('html',swig.renderFile);
//摸板引擎存放目录的关键字，固定字段
//实际存在的目录，html文件就在html文件夹下面
// app.set('views',__dirname+'/html');
//注册摸板引擎，固定字段
// app.set('view engine','html');
//关闭swig缓存,缓存的目的也是提高node服务器的响应速度
swig.setDefaults({cache:false});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', swig.renderFile);
app.set('view engine', 'html');

//对应用未处理的异常，进行统一处理
process.on('uncaughtException', function (err) {
    //打印出错误
    logger.info(err);
    //打印出错误的调用栈方便调试
    logger.info(err.stack);
});
app.use(cookieParser());

app.use(function(req,res,next){
    res.myUrl=config.www+req.url;

    if(req.url=="/"){
        req.url="/index.html";
    }

    //1.非html后置的请求，直接放行
    if(req.url.indexOf('.html')===-1  || htmlStaticParse(req,res)){
        next();
    }
});

//模块化
//es
let es=require('./app/elasticsearch/elasticsearch.js');
app.use('/es',es);
// controller 页面跳转
let index=require('./app/controller/index.js');
app.use('/',index);
let about=require('./app/controller/about.js');
app.use('/about',about);
let archives=require('./app/controller/archives.js');
app.use('/archives',archives);
let article=require('./app/controller/article.js');
app.use('/article',article);
let categories=require('./app/controller/categories.js');
app.use('/categories',categories);
let friends=require('./app/controller/friends.js');
app.use('/friends',friends);
let history=require('./app/controller/history.js');
app.use('/history',history);
let tags=require('./app/controller/tags.js');
app.use('/tags',tags);
let wiki=require('./app/controller/wiki.js');
app.use('/wiki',wiki);


//rest 请求跳转
let articleRest=require('./app/rest/articleRest.js');
app.use('/rest/article',articleRest);



let multer  = require('multer');
//指定文件存放路径
let upload = multer({dest: 'public/upload/ck/'});

app.post('/ckImgUpload', upload.any(),function(req,res){
    console.log('你上传了图片信息');
    console.log(req.files[0]);  // 上传的文件信息
    let file=req.files[0];
    //获取文件原名
    let originalname=file.originalname;
    //取原文件后缀
    let suffix=originalname.substring(originalname.lastIndexOf('.'));
    //获取上传时生成的随机名(无后缀信息)
    let hashName=file.filename;
    //最终文件全名
    let fileName=hashName+suffix;
    //上传文件最终存放目录 TODO tl 改为配置
    let basePath=file.destination;
    //根据当前日期生成目录
    let yyyymmdd=moment().format('YYYYMMDD');
    if(!fs.existsSync(basePath+yyyymmdd)){
        console.log('生成存放目录');
        fs.mkdirSync(basePath+yyyymmdd);
    }

    //临时文件path
    let tempFilePath=file.path;

    //最终文件（含路径）
    let des_file = basePath+yyyymmdd+'/' + fileName;
    fs.readFile( tempFilePath, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                //ck需要返回的格式
                res.jsonp({'uploaded':'true', 'url':des_file.replace('public','')});
            }

            //移除临时图片
            fs.unlink(tempFilePath,function(){
                console.log('删除临时文件:'+tempFilePath);
            });
        });
    });

});


app.post('/mdImgUpload', upload.any(),function(req,res){
    console.log('你上传了图片信息');
    console.log(req.files[0]);  // 上传的文件信息
    let file=req.files[0];
    //获取文件原名
    let originalname=file.originalname;
    //取原文件后缀
    let suffix=originalname.substring(originalname.lastIndexOf('.'));
    //获取上传时生成的随机名(无后缀信息)
    let hashName=file.filename;
    //最终文件全名
    let fileName=hashName+suffix;
    //上传文件最终存放目录 TODO tl 改为配置
    let basePath=file.destination;
    //根据当前日期生成目录
    let yyyymmdd=moment().format('YYYYMMDD');
    if(!fs.existsSync(basePath+yyyymmdd)){
        console.log('生成存放目录');
        fs.mkdirSync(basePath+yyyymmdd);
    }

    //临时文件path
    let tempFilePath=file.path;

    //最终文件（含路径）
    let des_file = basePath+yyyymmdd+'/' + fileName;
    fs.readFile( tempFilePath, function (err, data) {
        fs.writeFile(des_file, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                //ck需要返回的格式
                res.jsonp({'success':1, 'url':des_file.replace('public','')});
            }

            //移除临时图片
            fs.unlink(tempFilePath,function(){
                console.log('删除临时文件:'+tempFilePath);
            });
        });
    });

});



//实在匹配不上(要放在所有匹配的最底部)
app.use(function(req,res){
     //返回状态码，可写可不写，但是告诉浏览器状态码，更好
     res.render('404');
     //res.status(404).send('404哥们你迷路了');
 });
