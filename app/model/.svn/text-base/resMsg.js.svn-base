/**
 * 封装统一响应数据结构
 *
 * date:2018-07-30
 *
 */
const resMsg = {
    _successObj: {
        isok: true,
        code: 200,
        rs: undefined,
        page:{}
    },
    _errorObj: {
        isok: false,
        code: 500,
        rs: undefined
    },
    getSuccess: function(rs,page) {
        var obj=JSON.parse(JSON.stringify(resMsg._successObj))  ;
        // var obj=global._extend({},resMsg._successObj) ;
        obj.rs=rs;
        obj.page=page;
        return obj;
    },
    getMessage: function(rs) {
        if(rs){
            var obj=JSON.parse(JSON.stringify(resMsg._errorObj))  ;
            obj.rs=rs|| '系统繁忙，请联系管理员';
            return obj;

        } else{
            var obj=JSON.parse(JSON.stringify(resMsg._successObj))  ;
            obj.rs=rs|| '成功！';
            return obj;
        }

    },
    getError: (rs) => {
        var obj=JSON.parse(JSON.stringify(resMsg._errorObj))  ;
        obj.rs=rs|| '系统繁忙，请联系管理员';
        return obj;
    }


}

module.exports = resMsg;