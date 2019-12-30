const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const articleService={};


/**
 * 获取符合条件的数据条数
 * @param news
 * @param callback
 */
articleService.getTotal=function(filter,callback){

}


/**
 * 分页查询数据
 * @param page 分页信息
 * @param callback
 */
articleService.query4Page=function(page,callback){

    var querySql='select * from article WHERE 1=1  ';

    var querySqlParams=[];


    var queryCountSql=querySql;

    var queryCountSqlParams=querySqlParams;

    querySql+=' order by id desc ';


    if(page.pgindex){
        querySql+=' limit ?,?';

        querySqlParams.push((page.pgindex-1)*page.pgsize);
        querySqlParams.push(page.pgsize);

    }

    pool.query(querySql, querySqlParams, function (err, rows1) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{

            queryCountSql="select count(*) as count from ( "+queryCountSql+" ) tgt";

            pool.query(queryCountSql,queryCountSqlParams,function(err, rows){
                //logger.info(rows);
                if(err){
                    logger.error(err);
                    callback('error');
                }else{
                    page.totalCount=rows[0].count;
                    page.pageCount=page.totalCount%page.pgsize==0?page.totalCount/page.pgsize:parseInt(page.totalCount/page.pgsize)+1;
                    callback(rows1,page);
                }
            });
        }

    });

}

/**
 * 查询当前有效的文章
 */
articleService.queryArticles=function(filter,callback){


    var querySql="select "+
        " a.ID, ARTICLE_NAME, ARTICLE_SHORT, a.ARTICLE_TP_ID, ARTICLE_TP_NM, ARTICLE_CLICK, ARTICLE_UP,"+
        " ARTICLE_MODLE, ARTICLE_UPDTDT,ARTICLE_CONTENT,ARTICLE_CONTENT_MARKDOWN,ARTICLE_HTML_NAME,ARTICLE_KEYWORDS,"+
        " case when c.count is null then 0 else c.count end as ARTICLE_COMMENTS "+
        " from blog.ARTICLE a left join blog.ARTICLE_TYPE b"+
        " on a.ARTICLE_TP_ID=b.ARTICLE_TP_ID "+
        " left join (select article_id,count(id) as count from blog.comment group by article_id) c "+
        " on a.id=c.article_id ";

    if(filter!=null && filter.tagId!=null){

        querySql+= " left join blog.article_tag d" +
            " on a.id=d.article_id "+
            " left join blog.tag e" +
            " on d.tag_id=e.tag_id ";

    }

    querySql+=" where article_st = 1 ";


    if(filter!=null && filter.id!=null){
        querySql+=" and a.ARTICLE_TP_ID = "+filter.id;
    }

    if(filter!=null && filter.tagId!=null){

        querySql+=" and d.TAG_ID = "+filter.tagId;
    }

    querySql+=" order by a.id desc ";

    var querySql1 = querySql ;

    var page = filter.page;
    if(page){
        querySql+=" limit "+(page.pgindex-1)*page.pgsize+","+page.pgsize;

    }

    pool.query(querySql, function (err, rows) {
        if (err) {
            logger.error(err);
            callback('error');
        }else{

            for(var i=0;i<rows.length;i++){

                var queryTagsSql=" select b.TAG_ID,b.TAG_NM " +
                    " from blog.article_tag a " +
                    " left join blog.tag b on a.tag_id=b.tag_id " +
                    " where a.article_id= "+rows[i].ID;
                let size=rows.length;
                var cnt=0;

                (function(i){

                    pool.query(queryTagsSql, function (err, rows1) {

                        cnt++;

                        if (err) {
                            logger.error(err);
                            callback('error');
                        }else{

                            //console.log(i);
                            rows[i]['tags']=rows1;
                            //console.log(rows1);
                        }

                        if(size==cnt){

                            var queryCountSql="select count(*) as count from ( "+querySql1+" ) tgt";

                            pool.query(queryCountSql,function(err, rows2){
                                //logger.info(rows);
                                if(err){
                                    logger.error(err);
                                    callback('error');
                                }else{

                                    if(page){

                                        page.totalCount=rows2[0].count;
                                        page.pageCount=page.totalCount%page.pgsize==0?page.totalCount/page.pgsize:parseInt(page.totalCount/page.pgsize)+1;
                                        page.pgNextIndex = (parseInt(page.pgindex)+1) > page.pageCount ? null : parseInt(page.pgindex)+1;
                                        page.pgLastIndex = parseInt(page.pgindex)-1==0 ? null : parseInt(page.pgindex)-1;

                                        callback(err,rows,page);
                                    } else {

                                        callback(err,rows);

                                    }
                                }
                            });


                        }
                    });
                })(i);

            }

        }

    });

}

/**
 * 根据id获取
 *
 */
articleService.getByArticleId=(filter,callback)=>{

    var querySql= "select "+
        " a.ID, a.ARTICLE_NAME, a.ARTICLE_SHORT, a.ARTICLE_TP_ID, b.ARTICLE_TP_NM, a.ARTICLE_CLICK, a.ARTICLE_UP,"+
        " a.ARTICLE_MODLE, a.ARTICLE_UPDTDT,a.ARTICLE_CONTENT,a.ARTICLE_CONTENT_MARKDOWN,a.ARTICLE_HTML_NAME,a.ARTICLE_KEYWORDS,"+
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
articleService.queryArticleContent=(filter,callback)=>{

    var querySqlParams=["%"+filter.query+"%"];
    var querySql= "select "+
        " a.ID, a.ARTICLE_NAME, a.ARTICLE_SHORT, a.ARTICLE_TP_ID,a.ARTICLE_CLICK, a.ARTICLE_UP,a.ARTICLE_KEYWORDS,"+
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


module.exports=articleService;