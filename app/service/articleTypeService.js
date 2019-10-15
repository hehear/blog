const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const articleTypeService={};



/**
 * 查询当前有效的文章
 */
articleTypeService.queryArticleType=function(callback){

    var querySql="select "+
        "a.ARTICLE_TP_ID,a.ARTICLE_TP_NM,a.UPDT_TM,a.ID,COUNT(b.ARTICLE_TP_ID) AS ARTICLE_TP_NO "+
        " from blog.article_type a LEFT JOIN blog.article b"+
        " ON a.ARTICLE_TP_ID=b.ARTICLE_TP_ID "+
        " GROUP BY a.ARTICLE_TP_ID,a.ARTICLE_TP_NM,a.UPDT_TM,a.ID "+
        " order by a.id,updt_tm desc ";

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
 * 根据id获取
 *
 */
articleTypeService.getByArticleId=(filter,callback)=>{

    var querySql= "select "+
        " a.ID, a.ARTICLE_NAME, a.ARTICLE_SHORT, a.ARTICLE_TP_ID, b.ARTICLE_TP_NM, a.ARTICLE_CLICK, a.ARTICLE_UP,"+
        " a.ARTICLE_MODLE, a.ARTICLE_UPDTDT,a.ARTICLE_CONTENT,a.ARTICLE_CONTENT_MARKDOWN,a.ARTICLE_HTML_NAME,"+
        " case when c.count is null then 0 else c.count end as ARTICLE_COMMENTS, "+
        " d.ARTICLE_NAME as LAST_ARTICLE_NAME,d.ID as LAST_ID, "+
        " e.ARTICLE_NAME as NEXT_ARTICLE_NAME,e.ID as NEXT_ID "+
        " from blog.ARTICLE a left join blog.ARTICLE_TYPE b"+
        " on a.ARTICLE_TP_ID=b.ARTICLE_TP_ID "+
        " left join (select article_id,count(id) as count from blog.comment group by article_id) c "+
        " on a.id=c.article_id "+
        " left join blog.article d on a.id-1=d.id "+
        " left join blog.article e on a.id+1=e.id "+
        " where a.article_st='1' and a.id=? ";

    pool.query(querySql,[filter.id], function (err, rows) {
        if(err){
            logger.error("根据id获取文章明细信息失败");
        }

        callback(err,rows[0]);
    });
}

/**
 * 根据查询内容模糊查询文章内容
 *
 */
articleTypeService.queryArticleContent=(filter,callback)=>{

    var querySqlParams=["%"+filter.query+"%"];
    var querySql= "select "+
        " a.ID, a.ARTICLE_NAME, a.ARTICLE_SHORT, a.ARTICLE_TP_ID,a.ARTICLE_CLICK, a.ARTICLE_UP,"+
        " a.ARTICLE_MODLE, a.ARTICLE_UPDTDT,a.ARTICLE_CONTENT,a.ARTICLE_CONTENT_MARKDOWN,a.ARTICLE_HTML_NAME"+
        " from blog.ARTICLE a "+
        " where a.article_st='1' and a.ARTICLE_CONTENT like ? ";

    pool.query(querySql,querySqlParams, function (err, rows) {
        if(err){
            logger.error("根据查询内容模糊查询文章内容失败");
        }

        callback(err,rows);
    });
}


module.exports=articleTypeService;