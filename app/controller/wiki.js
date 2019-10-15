const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg = require('../model/resMsg');
const wikiService = require('../service/wikiService');
const async = require('async');


router.use(function (req, res, next) {

    next();
});


router.get('/', function (req, res) {
    logger.info('wiki ');

    let wikiId=req.query.wikiId;

    let rs = {};
    rs.wikiList=[];
    rs.wiki={};

    async.waterfall([

        function (callback) {

            if(wikiId!=null){


                wikiService.queryWikiById(wikiId,function (err, rs1) {

                    //console.log(rs1);
                    rs.wiki=rs1[0];

                    callback(null, rs);

                })

            }else {
                callback(null, rs);
            }

        },

        function (rs,callback) {

            wikiService.queryWikiList(function (err, result) {

                //rs=JSON.stringify(rs);//把results对象转为字符串，去掉RowDataPacket

                for (var i = 0; i < result.length; i++) {

                    if(result[i].wiki_pid=="0"){

                        //console.log("一级菜单");
                        //console.log(rs[i]);

                        //if(wikiId!=null && (wikiId==result[i].wiki_id || rs.wiki.wiki_pid==result[i].wiki_id)){
                            result[i].childList=[];
                            for (var j = 0; j < result.length; j++) {

                                if(result[j].wiki_pid==result[i].wiki_id){

                                    //console.log("二级菜单");
                                    //console.log(rs[j]);

                                    result[i].childList[j]=result[j];
                                }
                            }

                        //}
                        rs.wikiList[i]=result[i];
                    }
                }
                callback(null, rs);

            })

        }
    ], function (err, rs) {


        //console.log(rs);

        ///最后得到所有
        res.render('wiki/index', rs, req.resRendCallBack);

    });

});


//必须
module.exports = router;