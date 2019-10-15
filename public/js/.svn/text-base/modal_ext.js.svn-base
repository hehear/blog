/**
 * 公共消息框
 * 
 * 基于jquery，使用前，请引入jQuery 说明： 1.调用show函数，进行创建。 2.传递创建参数，如果为提供某参数，则使用默认值。
 * 
 * @author tangliang
 */
(function($) {
	$.extend({
		com_modal_info : {
			defaultOption : {
				title : "温馨提示", // 头部信息
				content : "",// 消息内容
				isHtml:true,//内容是否按html解析，默认解析
				static : true,// 是否模态，点击背景是否消失 true不消失
				pre : $.noop, // 前置函数
				done : $.noop,// 后置函数
				callback : $.noop,// 回调函数
				_index : 0
			},
			show : function(userOption) {
				//如果传来为字符串，则只做内容处理
				if(userOption && typeof userOption =='string'){
					userOption={content:userOption};
				}
				// copy参数
				var option = {};
				$.extend(option, this.defaultOption, userOption);

				// 执行开始前回调
				option.pre();
				this.defaultOption._index++;

				// 根据消息框模板生成消息框
				$newModal = $("#com_infoModal_temp").clone().attr("id",
						"com_info_" + this.defaultOption._index);

				// 设置标题
				$newModal.find(".modal-title").text(option.title);
				// 设置主体内容部分
				if(option.isHtml){
					$newModal.find(".modal-body").html(option.content);
				}else{
					$newModal.find(".modal-body").text(option.content);
				}
				// 显示
				$newModal.modal({
					backdrop : option.static ? "static" : true
				});

				if (option.callback && typeof option.callback == "function") {
					var fn_com_info_close = function() {
						$newModal.modal('hide');
					};
					$newModal.find(".com_info_modal_btn").unbind().click(
							fn_com_info_close).click(option.callback);
					$newModal.find('.close').unbind().click(fn_com_info_close)
							.click(option.callback);
				}

				// 执行完成回调
				option.done();

				return $newModal;// 返回对象本事，用来连缀操作
			}

		},
		com_modal_confirm : {
			defaultOption : {
				title : "操作确认",
				content : "",
				isHtml:true,//内容是否按html解析，默认解析
				static : true,
				callback : $.noop,
				cancel : $.noop,//取消按钮回调函数
				_index : 0
			},
			show : function(userOption) {
				// copy参数
				var option = {};
				$.extend(option, this.defaultOption, userOption);

				this.defaultOption._index++;

				// 根据消息框模板生成消息框
				$newModal = $("#com_confirmModal_temp").clone().attr("id",
						"com_confirm_" + this.defaultOption._index);

				// 设置标题
				$newModal.find(".modal-title").text(option.title);
				// 设置主体内容部分
				if(option.isHtml){
					$newModal.find(".modal-body").html(option.content);
				}else{
					$newModal.find(".modal-body").text(option.content);
				}

				// 关闭模态框
				var fn_com_confirm_close = function() {
					$newModal.modal('hide');
				};
				// 绑定确定按钮
				$newModal.find(".com_confirm_modal_sure_btn").unbind().click(
						fn_com_confirm_close).click(option.callback);
				// 绑定取消按钮
				$newModal.find('.com_confirm_modal_cancel_btn').unbind().click(
						fn_com_confirm_close).click(option.cancel);
				// 绑定关闭x号图标
				$newModal.find('.close').unbind().click(fn_com_confirm_close);
				// 展示模态框
				$newModal.modal({
					//V3.44.0.0 TL option.static写成了option.stitic导致确认框不是模态展示 STRT
					backdrop : option.static ? "static" : true
					//V3.44.0.0 TL option.static写成了option.stitic导致确认框不是模态展示 END
				});

				return $newModal;

			}
		},
		com_modal_wait : {
			defaultOption : {
				content : "请耐心等待......",
				isHtml:true,//内容是否按html解析，默认解析
				_index : 0
			},
			show : function(userOption) {
				//如果传来为字符串，则只做内容处理
				if(userOption && typeof userOption =='string'){
					userOption={content:userOption};
				}
				// copy参数
				var option = {};
				$.extend(option, this.defaultOption, userOption);

				this.defaultOption._index++;

				// 根据消息框模板生成消息框
				$newModal = $("#com_waitModal_temp").clone().attr("id",
						"com_wait_" + this.defaultOption._index);

				// 绑定信息
				if(option.isHtml){
					$newModal.find(".wait_modal_tip").html(option.content);
				}else{
					$newModal.find(".wait_modal_tip").text(option.content);
				}
				// 展示框
				$newModal.modal({backdrop : "static"});
				// 设置其距离顶部的距离
				$newModal.css("padding-top", "100px");
				// 设置关闭方法，以便用于###.close()的形式调用
				$newModal.close = function() {
					this.modal("hide");
				};

				return $newModal;
			},
			close : function($thisModal) {
				if (!$thisModal) {
					return false;
				}
				$thisModal.modal("hide");
			}
		},
        com_modal_md : {
            defaultOption : {
                title : "温馨提示", // 头部信息
                content : "",// 消息内容
                isHtml:true,//内容是否按html解析，默认解析
                static : true,// 是否模态，点击背景是否消失 true不消失
                pre : $.noop, // 前置函数
                done : $.noop,// 后置函数
                callback : $.noop,// 回调函数
                _index : 0
            },
            show : function(userOption) {
                $newModal=$("#com_mdModal_temp");
				$newModal.modal({
					backdrop : "static"
				});

				$newModal.find(".com_md_modal_sure_btn").unbind().click(userOption.callback);

            }

        }
	});

})(jQuery);

//TODO TL 通过md公共框编辑内容的通用方法,待整理,默认统一对应md信息为:pName_md
function common_edit_md_msg(obj,objName,pName,vm){

	$.com_modal_md.show({callback:function(){
		console.log("你点击了确认按按！！");
		//为目标对象赋值
			var htmlMsg=document.getElementById("common_md_iframe").contentWindow.getHTML();
			var mdMsg=document.getElementById("common_md_iframe").contentWindow.getMD();

			obj[pName]=htmlMsg;
			obj[pName+"_md"]=mdMsg;

			// vm.$forceUpdate();
			//TODO TL 需要改变vm.currQuestion的指向，才能使页面更新
			vm[objName]={};
			vm[objName]=obj;
			$("#com_mdModal_temp").modal("hide");
	}});
	document.getElementById("common_md_iframe").contentWindow.setMD(obj[pName+"_md"]);
}
function common_edit_md_msg_option(obj,objName,optionNo,vm){
    var currOption=null;
    for(var i=0,len=obj.options.length;i<len;i++){
        var temp=obj.options[i];
        if(temp.no==optionNo){
            currOption=temp;
            break;
        }
    }
	$.com_modal_md.show({callback:function(){
		console.log("你点击了确认按按11！！");
		//为目标对象赋值
        var htmlMsg=document.getElementById("common_md_iframe").contentWindow.getHTML();
        var mdMsg=document.getElementById("common_md_iframe").contentWindow.getMD();

        currOption.msg=htmlMsg;
        currOption.msg_md=mdMsg;
        //TODO TL 需要改变vm.currQuestion的指向，才能使页面更新
        vm[objName]={};
        vm[objName]=obj;
        $("#com_mdModal_temp").modal("hide");
        //清空
        document.getElementById("common_md_iframe").contentWindow.setMD("");
	}});
	document.getElementById("common_md_iframe").contentWindow.setMD(currOption["msg_md"]);
}