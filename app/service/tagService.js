const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const tagService={};



/**
 * 查询当前有效
 */
tagService.queryArticleTag=function(callback){


    var querySql=" select a.TAG_ID,b.TAG_NM,count(c.id) as ARTICLE_TAG_COUNT from blog.article_tag a  " +
        "left join blog.tag b " +
        "on a.TAG_ID=b.TAG_ID " +
        "left join blog.article c " +
        "on a.ARTICLE_ID=c.ID " +
        "group by a.TAG_ID,b.TAG_NM ";


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
 * 根据文章id查询标签
 *
 */
tagService.queryTagsByArticleId=(filter,callback)=>{

    var queryTagsSql=" select b.TAG_ID,b.TAG_NM " +
        " from blog.article_tag a " +
        " left join blog.tag b on a.tag_id=b.tag_id " +
        " where a.article_id= "+filter.id;

    pool.query(queryTagsSql, function (err, rows) {


        if (err) {
            logger.error(err);
            callback('error');
        }else{

            callback(err,rows);
        }
    });

}



module.exports=tagService;