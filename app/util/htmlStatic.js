const fs = require('fs');
const path = require('path');
const config=require("../../config/htmlStaticConfig");
//静态化基础配置
const staticConfig=config;

//静态化规则
const htmlStaticRules = {


    '^/article$': {
        action: 'article/list',
        file: '/article/list.html'
    },
    '^/article-tag-(\\d+)$': {
        action: 'article/list?tagId={1}',
        file: '/article/article-tag-{1}.html'
    },
    '^/wiki/article-wiki-(\\d+)$': {
        action: 'wiki?wikiId={1}',
        file: '/wiki/article-wiki-{1}.html'
    },
    '^/article-type-(\\d+)$': {
        action: 'article/list?id={1}',
        file: '/article/article-type-{1}.html'
    },
    '^/article/(\\S+)$': {
        action: 'article/content?id={1}',
        file: '/article/{1}.html'
    },
    '^/about$': {
        action: 'about',
        file: '/about/index.html'
    },
    '^/archives$': {
        action: 'archives',
        file: '/archives/index.html'
    },
    '^/categories$': {
        action: 'categories',
        file: '/categories/index.html'
    },
    '^/tags$': {
        action: 'tags',
        file: '/tags/index.html'
    },
    '^/friends$': {
        action: 'friends',
        file: '/friends/index.html'
    },
    '^/history$': {
        action: 'history',
        file: '/history/index.html'
    },
    '^/index$': {
        action: '/',
        file: '/index.html'
    },
}

//第一次启动时，根据定义的规则生成对应的正则表达式,避免每次判断反复创建
const staticRulesRegExp=function(){
    var temp={};
    for (var p in htmlStaticRules) {
        // var reg = new RegExp(p);
        temp[p]=new RegExp(p);
    }

    return temp;

}();




//TODO TL 正则对象缓存起来，避免每次操作都反复创建
const htmlStaticParse = function (req, res) {

    //console.info("******************")

    const url = req.url.replace('.html','');
    for (var p in htmlStaticRules) {
        // var reg = new RegExp(p);
        var reg =staticRulesRegExp[p];
        // console.log(url.match(reg));
        //如果匹配，则提取其匹配项，得到最终的请求信息
        if (reg.test(url)) {
            //获取正则到的参数信息
            var items = url.match(reg);
            var tempAction = htmlStaticRules[p].action;
            var tempFile = htmlStaticRules[p].file;
            for (var i = 1,len=items.length; i < len; i++) {
                tempAction = tempAction.replace('{' + i + '}', items[i]);
                tempFile = tempFile.replace('{' + i + '}', items[i]);
            }
            //文件路径加上前缀
            tempFile=staticConfig.bashPath+tempFile;

            //如果开启了静态化，判断文件是否存在，如果存在直接响应
            if (staticConfig.enable && fs.existsSync(tempFile)) {
                // console.debug('发送已经生产的静态文件');

                // var htmlContent = fs.readFileSync( tempFile)
                res.set('Content-Type', 'text/html');
                // res.send(fs.readFileSync( tempFile));
                fs.readFile(tempFile,(err,data)=>{
                    res.send(data);
                })
                return false;
            }

            //获取参数信息(截取参数部分：?后面部分)
            const params = new URLSearchParams(tempAction.substr(tempAction.indexOf('?')));
            var tempParams = {};
            for (const [name, value] of params) {
                // console.log(name, value);
                tempParams[name] = value;
            }

            if("/"==tempAction){
                tempAction="";
            }
            req.url = '/' + tempAction;
            req.originalUrl = '/' + tempAction;
            // //绑定解析出的参数信息
            req.query = tempParams;
            req.staticHtmlPath = tempFile;

            //设置生产静态页面回调
            // req.resRendCallBack=resRendCallBack;

            /**
             * 提供生成动态页面后，回调：根据规则存储静态文件
             * @param err
             * @param html
             */
            req.resRendCallBack = (err , html) => {

                console.info("进入方法调用。。。。。。。。。")
                if (!staticConfig.enable ||!req || !req.staticHtmlPath) {
                    res.send(html);
                    return false;
                }
                // console.debug('动态页面生成完毕！');

                //同步创建文件
                if(!fs.existsSync(path.dirname(req.staticHtmlPath))){
                    console.debug('我要创建静态页面存放目录');
                    mkdirsSync(path.dirname(req.staticHtmlPath));
                }

                // //同步创建文件
                // mkdirsSync(path.dirname(req.staticHtmlPath));
                fs.writeFile(req.staticHtmlPath, html, 'utf8', function (err) {
                    if (err) {
                        console.error('写入静态文件错误了');
                        console.error(err);
                    }
                });

                res.send(html);

            }


            // //找到一个即结束tempParams{};
            // return {action:tempAction,file:tempFile,params:tempParams};
            break;

        }
    }

    // //标识需要放行
    return true;

};


//递归生成文件目录
function mkdirsSync(dirname, mode) {
    console.log(dirname);
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname), mode)) {
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

console.log(__dirname);

module.exports = htmlStaticParse;