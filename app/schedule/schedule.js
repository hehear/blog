var schedule = require('node-schedule');
const logger = require('../../config/log4js');
const infoService=require('../service/infoService');
const targetService=require('../service/targetService');
const dayService=require('../service/dayService');
const userService=require('../service/userService');
const resMsg = require('../model/resMsg');


// 每分钟的第30秒触发： '30 * * * * *'
//
// 每小时的1分30秒触发 ：'30 1 * * * *'
//
// 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'
//
// 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'
//
// 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'
//
// 每周1的1点1分30秒触发 ：'30 1 1 * * 1'

//设定消息
schedule.setInfoJob=function(req, res){
    // schedule.scheduleJob('10 * * * * *', function(){
    schedule.scheduleJob('0 30 * * * *', function(){

        logger.info('定时任务:设定消息开始。。。' + new Date());

        //1.查询明天的有效任务
        var date=new Date();
        date.setDate(date.getDate()+1);
        var year=date.getFullYear();
        var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
        var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
        var tom= year+"-"+month+"-"+day;
        var strtDt= new Date(year,month-1,day,0,0,0);
        var endDt= new Date(year,month-1,day,23,59,59);

        var filter = {
            st:'1',
            strtDt:strtDt,
            endDt:endDt,
            info_remind_st:'0'
        };

        var page = {};


        targetService.query4Page(filter,page,function(rows,page){

            if(rows==='error'){

                console.log("定时任务:设定消息失败！！！！！！！！！！！");
            }else{

                //遍历任务列表，将将要进行的任务发消息进信息表
                if(rows.length>0){

                    for(var i=0;i<rows.length;i++){

                        var data={
                            info_tp:"任务提醒",
                            info_content:"任务提醒：您于 "+tom+" 有"+rows[i].target_tp+"任务："+rows[i].target_content,
                            st:'1',
                            info_strt_dt:new Date(),
                            info_end_dt:new Date(9999,11,31,23,59,59),
                            info_level:'B',
                            user_id:rows[i].user_id

                        };

                        //添加信息
                        infoService.add(data,function(err){

                            resMsg.getMessage(err);
                        });

                        var filter1={
                            id:rows[i].id,
                            info_remind_st:'1'
                        };

                        //设置任务状态
                        targetService.updtInfoRemindSt(filter1,function(err){

                            resMsg.getMessage(err);
                        });

                    }

                }else{

                    logger.info("当前暂无消息！");
                }
                logger.info('定时任务:设定消息结束，共刷新消息'+rows.length+'条。。。' + new Date());
            }
        })


    });
}

//清空已读消息
schedule.updtInfoStJob=function(){
    // schedule.scheduleJob('10 0 0 * * *', function(){
    schedule.scheduleJob('10 50 23 * * *', function(){


        logger.info('定时任务:清空已读消息开始。。。' + new Date());


        infoService.updtHaveReadSt(function(rows){

            if(rows==='error'){

                console.log("定时任务:清空已读消息失败！！！！！！！！！！！");
            }else{

                logger.info('定时任务:清空已读消息结束，共清空消息：'+rows+'条。。。' + new Date());

            }
        })


    });
}

//将今天未完成的任务置为未完成
schedule.updtTargetStJob=function(){
    // schedule.scheduleJob('10 0 0 * * *', function(){
    schedule.scheduleJob('5 55 23 * * *', function(){


        logger.info('定时任务:将今天未完成的任务置为未完成开始。。。' + new Date());


        targetService.updtUnCompleteSt(function(rows){

            if(rows==='error'){

                console.log("定时任务:将今天未完成的任务置为未完成失败！！！！！！！！！！！");
            }else{

                logger.info('定时任务:将今天未完成的任务置为未完成结束,共置任务：'+rows+'个。。。' + new Date());

            }
        })


    });
}


// //每日刷新
schedule.addDailyInfo=function(){
    schedule.scheduleJob('10 * * * * *', function(){
    //  schedule.scheduleJob('0 0 0 * * *', function(){

        logger.info('定时任务:新增当日数据信息。。。' + new Date());

        //查询所有会员
        userService.queryMbrs(function(err,rows){

            for(var i=0;i<rows.length;i++){

                // logger.info(rows[i]);

                var filter =  {
                    date:new Date(),
                    wake_tm:null,
                    sleep_tm:null,
                    is_study:'0',
                    is_excercise:'0',
                    is_savemoney:'0',
                    is_completed:'0',
                    st:'1',
                    user_id:rows[i].uid,
                    update_user:'SYSTEM'

                };

                dayService.add(filter,function(rows){

                    if(rows==='error'){

                        console.log("定时任务:新增当日数据信息失败！！！！！！！！！！！");
                    }else{

                        logger.info('定时任务:新增当日数据信息' + new Date());

                    }
                })
            }

        });



    });
}


module.exports=schedule;