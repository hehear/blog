const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg=require('../model/resMsg');
const async = require('async');

const { Client } = require('elasticsearch');

router.post('/', function (req, res) {

    var query=req.body.query;

    logger.info(query);

    let result={};
    async.auto([
        //获取文章列表信息

        async function(callback){

            const client = new Client({ node: 'http://localhost:9200' });

            const body = await client.search({
                index: 'blog',
                body: {
                    query: {
                        match: {
                            "article_content_markdown":query
                        }
                    }
                }
            })
            result=body.hits.hits;

            callback("");

        }


    ], function (err, results) {
        if (err) {
            logger.error(err);
            return false;
        }
        res.json(resMsg.getSuccess(result));

    });



});

//必须
module.exports = router;