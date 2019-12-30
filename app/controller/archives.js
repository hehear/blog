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

router.get('/', function (req, res) {
    logger.info('归档');

    var filter = {};
    let result={};
    async.auto([

        //归档
        function(callback){

            articleService.queryArticles(filter,function(err,rs){

                //logger.info(rs);

                for(let i  in rs){

                    if(i==0){
                        rs[i].year=rs[i].ARTICLE_UPDTDT.getFullYear();
                    }else if(rs[i].ARTICLE_UPDTDT.getFullYear()!=rs[i-1].ARTICLE_UPDTDT.getFullYear()){
                        rs[i].year=rs[i].ARTICLE_UPDTDT.getFullYear();
                    }
                }

                result.articleList=rs;
                //结束操作，否则无法响应
                callback(err);
            })

        },
        //文章类型
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

        res.render('archives/index',result,req.resRendCallBack);

    });


});

//必须
module.exports = router;