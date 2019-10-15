/**
 * 全局配置信息
 **/
const config={
    port:3000,
    // www:'www.life.runningcoder.top',
    www:'127.0.0.1',
    jwt:{
        //需要鉴权的url列表
        authority:new Set([/*"/rest/user/register"*/"/rest/wish/add","/rest/user/detail","/rest/user/upddetail"]),
        secret:"cola",
        expiresIn : 3600000*12// 授权时效(单位秒)
    }
};
module.exports=config;