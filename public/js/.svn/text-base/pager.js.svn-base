/**
 * 分页插件
 * 目前只支持生成 分页符
 * 基于jquery，使用前，请引入jQuery
 * @author tangliang
 */
(function($){

    $.extend({
        pager: {
            containId: "",
            firstText: "首页",
            lastText: "尾页",
            preText: "上一页",
            nextText: "下一页",
            showCount: 10,
            pageCount: 100,
            firstAndLastClass: "",
            preAndNextClass: "",
            currentPageIndex: 1,
            baseClass: "paginate_button ",
            currentClass: "current",
            creat: function(option){
                //设置用户自定义配置信息
                if (option) {
                    $.extend(this, this, option);
                    //对参与运算的参数处理，防止非数字参数传入，导致运算不准确
                    this.showCount=10;
                    this.pageCount=parseInt(this.pageCount);
                    this.currentPageIndex=parseInt(this.pageIndex);
                }
                //清空容器
                $container=$("#" + (this.containId||'list_pager'));
                $container.empty();
                //如果没有显示数，则不创建
                if(!this.pageCount||this.pageCount==0){
                    return this;
                }
                //如果有存放容器
                //                if(this.containId){
                //                    $("#"+this.containId).append("<ul id='pagObj_ul'></ul>");
                //                }
                //				else{
                //				    //如果有存放容器
                //                    $("body").append("<ul id='pagObj_ul'></ul>");
                //                }

                var prePageIndex = this.currentPageIndex > 1 ? (this.currentPageIndex - 1) : 1;
                var nextPageIndex = this.currentPageIndex < this.pageCount ? (this.currentPageIndex + 1 ): this.pageCount;

                //添加首页
                $container.append('<a  class="paginate_button previous disabled" id="table1_previous" aria-controls="table1" data-dt-idx="1">' + this.firstText + '</a>');
                //添加上一页
                $container.append('<a  class="paginate_button previous disabled" id="table1_previous" aria-controls="table1" data-dt-idx="' + (this.currentPageIndex - 1 > 0 ? this.currentPageIndex - 1 : 1) + '">' + this.preText + '</a>');
                //获取展示起始页
                var begin = 1;
                var end = 1;
                if (this.pageCount < this.showCount) {
                    this.showCount = this.pageCount;
                    end = this.pageCount;
                }else{
                    begin = this.currentPageIndex - Math.floor(this.showCount / 2);
                    begin = begin < 1 ? 1 : begin;
                    end = (begin + this.showCount - 1) > this.pageCount ? this.pageCount : (begin + this.showCount - 1);
                    begin = end == this.pageCount ? this.pageCount - this.showCount + 1 : begin;//防止当前页后面不够，而前面又只有一半的显示数，导致显示页面不够显示数的情形
                }


                for(var i = begin; i <= end; i++) {
                    $container.append('<a  class="' + this.baseClass + '" aria-controls="table1" data-dt-idx="' + i + '">' + i + '</a>');
                    if ((i) == this.currentPageIndex) {
                        $container.children("a").last().addClass("current");

                    }
                }
                //添加下一页
                $container.append('<a tabindex="0" class="paginate_button next" id="table1_next" aria-controls="table1" data-dt-idx="' + (this.currentPageIndex + 1 > this.pageCount ? this.pageCount : this.currentPageIndex + 1) + '">' + this.nextText + '</a>');
                //添加尾页
                $container.append('<a tabindex="0" class="paginate_button next" id="table1_next" aria-controls="table1" data-dt-idx="' + this.pageCount + '">' + this.lastText + '</a>');

                //保存当前类型文本，否则在循环中this不识别
                var currentClass = this.currentClass;
                var currentPageIndex = this.currentPageIndex;
                //绑定事件
                $container.children("a").mouseover(function(){
                    $(this).addClass(currentClass);
                }).mouseout(function(){
                    if ($(this).html() != currentPageIndex) {
                        $(this).removeClass(currentClass);
                    }
                }).click(function(){
                    if (typeof option.click == "function") {
                        option.click($(this).attr("data-dt-idx"));
                    }
                }).css("cursor", "pointer");

                return this;//返回对象本事，用来连缀操作
            },
            //创建前
            pre:$.noop(),
            //创建完成执行
            done: $.noop()

        }
    });
})(jQuery);
