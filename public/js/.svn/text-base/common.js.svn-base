function dateTimeFormat(time) {
    var date=new Date(time);
    var year=date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
    var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();
    var hours=date.getHours()<10 ? "0"+date.getHours() : date.getHours();
    var minutes=date.getMinutes()<10 ? "0"+date.getMinutes() : date.getMinutes();
    var seconds=date.getSeconds()<10 ? "0"+date.getSeconds() : date.getSeconds();
    // 拼接
    return year+"-"+month+"-"+day+" "+hours+":"+minutes+":"+seconds;
}

function dateFormat(time) {
    var date=new Date(time);
    var year=date.getFullYear();
    /* 在日期格式中，月份是从0开始的，因此要加0
     * 使用三元表达式在小于10的前面加0，以达到格式统一  如 09:11:05
     * */
    var month= date.getMonth()+1<10 ? "0"+(date.getMonth()+1) : date.getMonth()+1;
    var day=date.getDate()<10 ? "0"+date.getDate() : date.getDate();

    // 拼接
    return year+"-"+month+"-"+day;
}


function getCookie(sName)
{
    var aCookie = document.cookie.split("; ");
    for (var i=0; i < aCookie.length; i++)
    {
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0])
            return unescape(aCrumb[1]);
    }
    return null;
}

(function($){
    let jqueryAjax=$.ajax;
    $.ajax=function(option){
        //统一加上了token
        option.beforeSend= function(xhr) {
            xhr.setRequestHeader('token',getCookie('token'));
            xhr.setRequestHeader('uid',getCookie('uid'));
        }
        //然后调用真正的jquery的ajax()
        jqueryAjax(option);
    }

})(jQuery);

/**
 * 查询常量公共函数(用于下拉列表)
 * @date 2019-01-10
 */

(function($){
    $.loadSelectOptionFromConst=function(tp,callback){
        $.ajax({
            url:'/api/const/query',
            type:'get',
            data:{tp:tp,st:'1'},
            success:function(rs){
               callback(rs);
            }
        });
    }
})(jQuery);