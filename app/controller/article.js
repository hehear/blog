const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg=require('../model/resMsg');
const articleService=require('../service/articleService');
const articleTypeService=require('../service/articleTypeService');
const tagService=require('../service/tagService');
const async = require('async');


router.use(function (req, res, next) {

    next();
});

router.get('/content', function (req, res) {
    logger.info('文章');

    let id=req.query.id;

    let result={};
    async.auto([

        //根据文章id获取文章
        function(callback){

            articleService.getByArticleId({id:id},function(err,rs){

                //logger.info(rs);
                result.article=rs;
                //结束操作，否则无法响应
                callback(err);

            })

        },
        //根据文章id获取标签列表
        function(callback){

            tagService.queryTagsByArticleId({id:id},function(err,rs){

                result.tagList=rs;
                //结束操作，否则无法响应
                callback(err);
            })

        }

    ], function (err, results) {
        if (err) {
            logger.error(err);
            return false;
        }


        if(result==null ){
            res.render('404',result,req.resRendCallBack);
        }else{
            res.render('article/index',result,req.resRendCallBack);

        }

    });


});

router.get('/list', function (req, res) {
    logger.info('博客列表');

    let filter=req.query;

    //console.log('id:'+id);

    let result={};
    async.auto([
        //获取文章列表信息

        function(callback){

            articleService.queryArticles(filter,function(err,rs){

                result.articleList=rs;

                //logger.info(rs);
                //结束操作，否则无法响应
                callback(err);
            })

        },
        //文章分类
        function(callback){

            articleTypeService.queryArticleType(function(err,rs){

                result.articleTypeList=rs;
                //结束操作，否则无法响应
                callback(err);
            })

        },
        //标签
        function(callback){

            tagService.queryArticleTag(function(err,rs){

                result.articleTagList=rs;
                //结束操作，否则无法响应
                callback(err);
            })

        }

    ], function (err, results) {
        if (err) {
            logger.error(err);
            return false;
        }


        if(result==null || result.articleList.length==0){
            res.render('404',result,req.resRendCallBack);
        }else{
            res.render('articleList/index',result,req.resRendCallBack);

        }

    });

});

//必须
module.exports = router;