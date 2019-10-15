const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const wikiService={};



/**
 * 查询所有
 */
wikiService.queryWikiList=function(callback){


    var querySql=" select * from blog.article_wiki a  order by wiki_id " ;

    pool.query(querySql, function (err, rows) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{
            callback(err,rows);
        }

    });

}


/**
 * 查询子菜单
 */
wikiService.queryWikiChildList=function(id,callback){


    var querySql=" select * from blog.article_wiki a where wiki_pid=? order by wiki_id " ;

    pool.query(querySql,[id], function (err, rows) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{
            callback(err,rows);
        }

    });

}

/**
 * 根据id查询
 */
wikiService.queryWikiById=function(id,callback){


    var querySql=" select * from blog.article_wiki a where wiki_id=?  " ;

    pool.query(querySql,[id], function (err, rows) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{
            callback(err,rows);
        }

    });

}





module.exports=wikiService;