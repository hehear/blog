const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const historyService={};



/**
 * 查询当前有效的版本历史
 */
historyService.queryHistories=function(callback){

    var querySql= "select "+
        " ID,HISTORY_CONTENT,HISTORY_DT,CREATE_TIME,USER_NM,ST,(@i:= @i+1) as rank "+
        " from blog.history,(SELECT @i:=0) as i " +
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