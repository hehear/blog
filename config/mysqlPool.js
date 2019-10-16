/**
 * mySql数据库连接池
 **/
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,

    host            : '127.0.0.1',
    port            :  '',
    user            : '',
    password    : '',
    database : 'blog'
});
module.exports=pool;
