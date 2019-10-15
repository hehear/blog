const log4js = require('log4js');
log4js.configure({
    appenders: {
        fee: {type: 'file',
              filename: 'logs/fee.log',
              // 假设当前要写入日志的文件叫 cheese.log，使用默认 pattern：.yyyy-MM-dd，
              // 则一开始会创建一个日志文件名为 cheese.log，
              // 到第二天 cheese.log 会被重命名为 cheese.log.2017-04-30
              // 并且一个新的日志文件名为 cheese.log 又会被创建。
              pattern:"-yyyy-MM-dd.log",
              alwaysIncludePattern: true
        },
        out: {type: 'stdout'}
    },
    categories: {default: {appenders: ['fee', 'out'], level: 'info'}}
});

const logger = log4js.getLogger('fee');

module.exports = logger;