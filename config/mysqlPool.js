/**
 * mySql数据库连接池
 **/
var mysql = require('mysql');
var pool  = mysql.createPool({
    connectionLimit : 10,
    //host            : '101.132.97.220',
    host            : '127.0.0.1',
    port            :  6006,
    user            : 'root',
    password    : 'cfets@1234',
    database : 'blog'
});
module.exports=pool;
