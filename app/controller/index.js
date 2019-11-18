const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg=require('../model/resMsg');
const async = require('async');
const articleService=require('../service/articleService');
const articleTypeService=require('../service/articleTypeService');
const tagService=require('../service/tagService');


router.use(function (req, res, next) {

    next();
});

router.get('/', function (req, res) {
    logger.info('博客首页');

    let pageIndex=req.pgindex;

    var page={
        pgsize:10,
        pgindex:pageIndex||1
    }

    var filter = {"page":page};

    let result={};
    async.auto([
        //获取文章列表信息
        function(callback){

            articleService.queryArticles(filter,function(err,rs,pager){

                result.articleList=rs;
                result.page=pager;
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

        res.render('index',result,req.resRendCallBack);

    });

});

router.get('/page', function (req, res) {
    logger.info('博客分页');

    let pageIndex=req.query.pgindex;

    var page={
        pgsize:10,
        pgindex:pageIndex||1
    }


    let result={};
    async.auto([
        //获取文章列表信息
        function(callback){

            var filter = {"page":page};

            articleService.queryArticles(filter,function(err,rs,pager){

                result.articleList=rs;
                result.page=pager;
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

        //res.json(resMsg.getSuccess(result));
        res.render('articlePage/index',result,req.resRendCallBack);

    });

});

//必须
module.exports = router;