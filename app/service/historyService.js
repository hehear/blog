const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const historyService={};



/**
 * 查询当前有效的版本历史
 */
historyService.queryHistories=function(callback){

    var querySql= "select "+
        " ID,HISTORY_CONTENT,HISTORY_DT,CREATE_TIME,USER_NM,ST,CAST((@rownum :=@rownum + 1) as SIGNED) as rownum "+
        " from blog.history,(SELECT @rownum := 0) rw " +
        " where st='1' order by id  ";

    //logger.info(querySql);

    pool.query(querySql, function (err, rows) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{
            //logger.info(rows);
            callback(err,rows);
        }

    });

}



module.exports=historyService;