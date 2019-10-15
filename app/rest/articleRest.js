const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const articleService=require('../service/articleService');
const resMsg = require('../model/resMsg');


router.get('/queryArticles', function (req, res) {

    logger.info('查询当前时间所有有效的文章');

    var filter={
    }

    articleService.queryArticles(filter,function(rows){

        if(rows==='error'){
            res.json(resMsg.getError('加载article出错啦'));
        }else{
            res.json(resMsg.getSuccess(rows));
        }
    })

});

router.post('/queryTargetsByTp', function (req, res) {

    logger.info('按类型查询');

    var filter=req.body;

    filter.uid=req.cookies.uid;

    articleService.queryTargetsByTp(filter,function(rows){

        if(rows==='error'){
            res.json(resMsg.getError('加载target出错啦'));
        }else{
            res.json(resMsg.getSuccess(rows));
        }
    })

});

router.post('/queryArticleContent', function (req, res) {

    logger.info('按内容查询');

    var filter=req.body;

    articleService.queryArticleContent(filter,function(err,rows){

        //console.log(rows);

        if(err){
            res.json(resMsg.getError('加载target出错啦'));
        }else{
            res.json(resMsg.getSuccess(rows));
        }
    })

});

router.post('/updtCompleteSt', function (req, res) {

    logger.info('更改任务状态');

    var filter=req.body;

    articleService.updtCompleteSt(filter,function(rows){

        if(rows==='error'){
            res.json(resMsg.getError('加载target出错啦'));
        }else{
            res.json(resMsg.getSuccess(rows));
        }
    })

});

router.post('/updtCompleteContent', function (req, res) {

    logger.info('更改任务完成情况说明');

    var filter=req.body;

    articleService.updtCompleteContent(filter,function(rows){

        if(rows==='error'){
            res.json(resMsg.getError('加载target出错啦'));
        }else{
            res.json(resMsg.getSuccess(rows));
        }
    })

});

router.post('/save', function (req, res) {

    var filter=req.body;

    filter.uid=req.cookies.uid;

    if(filter.id){

        logger.info('修改任务');
        articleService.upt(filter,function(err){

            res.json(resMsg.getMessage(err));
        })

    }else{

        logger.info('新增任务');

        articleService.add(filter,function(err){

            res.json(resMsg.getMessage(err));
        })
    }

});

router.get('/delete', function (req, res) {

    var id=req.query.id;

    logger.info('删除任务，id：'+id);
    articleService.delete(id,function(err){

        res.json(resMsg.getMessage(err));
    })



});


//必须
module.exports = router;