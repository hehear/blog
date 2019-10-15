const express = require('express');
const logger = require('../../config/log4js');
const router = express.Router();
const resMsg=require('../model/resMsg');

router.use(function (req, res, next) {

    next();
});

router.get('/', function (req, res) {
    logger.info('关于rest');
    res.render('about/index',req.resRendCallBack);

});

//必须
module.exports = router;