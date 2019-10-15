const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg=require('../model/resMsg');
const async = require('async');
const articleTypeService=require('../service/articleTypeService');
const tagService=require('../service/tagService');

router.use(function (req, res, next) {

    next();
});

router.get('/', function (req, res) {
    logger.info('分类');

    let result={};
    async.auto([

        //文章分类
        function(callback){

            articleTypeService.queryArticleType(function(err,rs){

                //console.log(rs);
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

        res.render('categories/index',result,req.resRendCallBack);

    });

});

//必须
module.exports = router;