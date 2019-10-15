const logger = require('../../config/log4js');
const pool = require('../../config/mysqlPool');

const articleService={};

/**
 * 新增
 * @param news
 * @param callback
 */
articleService.add=function(filter,callback){

    logger.info('add target :{}',filter);

    var  addSql = 'INSERT INTO target (target_name,target_content,target_complete_content,target_date,target_tp,user_id,update_tm,update_user,st) VALUES (?,?,?,?,?,?,?,?,?)';
    var  addSqlParams = [filter.target_name,filter.target_content,filter.target_complete_content,filter.target_date,filter.target_tp,filter.uid,new Date(),filter.uid,filter.st];

    pool.query(addSql,addSqlParams,function (err, result) {

        if(err){
            logger.info('新增报错',err.message);
            return;
        }

        //回掉
        callback(err,result);

    });

}

/**
 * 删除
 * @param id
 * @param callback
 */
articleService.delete=function(id,callback){

    var  deleteSql = 'delete from target where id=? ';
    var  deleteSqlParams = [id];

    pool.query(deleteSql,deleteSqlParams,function (err, result) {

        if(err){
            logger.info('删除出错',err.message);
            return;
        }

        //回掉
        callback(err,result);

    });

}

/**
 * 修改
 * @param news
 * @param callback
 */
articleService.upt=function(filter,callback){

    var  uptSql = 'update target set target_name=?,target_content=?,target_complete_content=?,target_date=?,target_tp=?,update_tm=?,update_user=?,st=? where id=?';
    var  uptSqlParams = [filter.target_name,filter.target_content,filter.target_complete_content,filter.target_date,filter.target_tp,new Date(),filter.uid,filter.st,filter.id];

    pool.query(uptSql,uptSqlParams,function (err, result) {

        if(err){
            console.log('修改出错',err.message);
            return;
        }

        //回掉
        callback(err,result);

    });

}

/**
 * 获取符合条件的数据条数
 * @param news
 * @param callback
 */
articleService.getTotal=function(filter,callback){

}


/**
 * 分页查询数据
 * @param news 条件
 * @param page 分页信息
 * @param callback
 */
articleService.query4Page=function(filter,page,callback){

    var querySql='select * from target WHERE 1=1  ';

    var querySqlParams=[];

    if(filter.uid){
        querySql+=' and  user_id = ?';
        querySqlParams.push(filter.uid)
    }

    if(filter.target_tp){
        querySql+=' and target_tp=? ';
        querySqlParams.push(filter.target_tp);
    }

    if(filter.target_name){
        querySql+=' and target_name like ?  ';
        querySqlParams.push("%"+filter.target_name+"%");

    }

    if(filter.target_content){
        querySql+=' and target_content like ?  ';
        querySqlParams.push("%"+filter.target_content+"%");

    }

    if(filter.st){
        querySql+=' and st =? ';
        querySqlParams.push(filter.st);

    }

    if(filter.info_remind_st){
        querySql+=' and info_remind_st =? ';
        querySqlParams.push(filter.info_remind_st);

    }

    if(filter.strtDt && filter.endDt){
        querySql+=' and target_date  between ? and ? ';
        querySqlParams.push(filter.strtDt);
        querySqlParams.push(filter.endDt);

    }

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

    querySql+=" where article_st='1' ";


    if(filter!=null && filter.id!=null){
        querySql+=" and a.ARTICLE_TP_ID = "+filter.id;
    }

    if(filter!=null && filter.tagId!=null){

        querySql+=" and d.TAG_ID = "+filter.tagId;
    }

    querySql+=" order by a.id desc ";


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

                            //console.log(rows);
                            callback(err,rows);

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