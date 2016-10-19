
//     公用方法
var treeName;
var phoneCusNo;//正在打电话的客户编号
window.common={
    //滚动条
    scroll:function () {
        var ayy = $(".nicescroll-rails");
        for (var i = 0; i < ayy.length; i++) {
            if ($(ayy[i]).attr("show") != "true") {
                $(ayy[i]).remove();
            }
        }
    },
    scrollBig:function (idx) {
        var ayy = $(".nicescroll-rails");
        for (var i = 0; i < ayy.length; i++) {
            if ($(ayy[i]).attr("show") != "true") {
                $(ayy[i]).remove();
            }
        }
        $(idx).niceScroll(); // First scrollable DIV
        $(idx).getNiceScroll().onResize();
        $(".nicescroll-rails").attr("show",true);
    },
    // 原生公用ajax
    ajaxJs:function (obj) {
        var isR = obj.remove==undefined?false:obj.remove;
        var cookies = getCookie("USER_ID");
        if(cookies==null && obj.url!="login/adminLogin.htm" && obj.url!="login/getServerTime.htm"){
            location.href = BASEPATH+"CRM/login/login.html";
        }else {
            var ajaxData = {
                type: obj.type || "post",
                url: BASEPATH + obj.url || "",
                async: obj.async || "true",
                data: obj.data || null,
                dataType: obj.dataType || "json",
                timeout:obj.timeout||6000,
                contentType: obj.contentType || "application/x-www-form-urlencoded",
                ontimeout:function(){
                    location.href = BASEPATH+"CRM/login/login.html";
                },
                beforeSend:function () {
                    if(obj.ajaxLoadShow!=false){
                        ajaxLoadShow();
                    }
                },
                success:function(resStr){
                    //规避xss攻击
                    var resObj={};
                    if( typeof resStr == "object"){
                        if(obj.xss==undefined || obj.xss !=false){
                            resStr = JSON.stringify(resStr);
                            var Msg=xss(resStr);
                            resObj = JSON.parse(Msg);
                        }else{
                            resObj = resStr;
                        }
                    }else{
                        //规避xss攻击
                        if(obj.xss==undefined || obj.xss !=false){
                            var Msg=xss(resStr);
                            resObj = JSON.parse(Msg);
                        }else{
                            resObj = JSON.parse(resStr);
                        }
                    }
                    var code = (obj.code==undefined || obj.dispose)?"S00":obj.code;
                    if(resObj.code==code){
                        if(obj.success!=undefined){
                            if(obj.callData == undefined || obj.callData == "all"){
                                obj.success(resObj);
                            }else if(obj.callData == "no"){
                                obj.success();
                            }else if(obj.callData == "data"){
                                obj.success(resObj.data==null?[]:resObj.data);
                            }
                        }else{
                            if(obj.successDialog==undefined || obj.successDialog){
                                if(isR==true){
                                    closeAllPop();
                                }
                                $.fn.dialog({
                                    type: "success",
                                    title: "提示",
                                    content:resObj.msg,
                                    userFooter:true,
                                    allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                                });
                            }
                        }
                    }else if(resObj.code=="NOT_USER"){
                        location.href = BASEPATH+"CRM/login/login.html";
                    }else{
                        if(obj.exception!=undefined){
                            if(obj.callData == undefined || obj.callData == "all"){
                                obj.exception(resObj);
                            }else if(obj.callData == "no"){
                                obj.exception();
                            }else if(obj.callData == "data"){
                                obj.exception(resObj.data==null?[]:resObj.data);
                            }
                        }else{
                            if(obj.exceptionDialog==undefined || obj.exceptionDialog){
                                var error = $("[crmTypeError]");
                                if(isR==true){
                                    closeAllPop();
                                }
                                if(error.length<=0){
                                    $.fn.dialog({
                                        type: "error",
                                        title: "提示",
                                        content:resObj.msg,
                                        userFooter:true,
                                        allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                                    });
                                }
                            }
                        }
                    }
                    ajaxLoadHide();
                },
                error:function(re){
                    ajaxLoadHide();
                    var error = $("[crmTypeError]");
                    if(error.length<=0){
                        if(isR==true){
                            closeAllPop();
                        }
                        $.fn.dialog({
                            type: "error",
                            title: "提示",
                            content:"请求异常！请刷新重试",
                            userFooter:true,
                            allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                        });
                    }
                },
            }
        };
        ajaxData.beforeSend();
        var xhr =new XMLHttpRequest();
        xhr.responseType = ajaxData.dataType;
        xhr.open(ajaxData.type, ajaxData.url, ajaxData.async);
        xhr.timeout=ajaxData.timeout;
        xhr.ontimeout=function(){
            ajaxData.ontimeout()
        };
        xhr.setRequestHeader("Content-Type", ajaxData.contentType);
        xhr.send(convertData(ajaxData.data));
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    ajaxData.success(xhr.response)
                } else {
                    ajaxData.error()
                }
            }
        }
        function convertData(data){
            if( typeof data === 'object' ){
                var convertResult = "" ;
                for(var c in data){
                    convertResult+= c + "=" + encodeURIComponent(data[c])+"&";
                }
                convertResult=convertResult.substring(0,convertResult.length-1)
                return convertResult;
            }else{
                return data;
            }
        }
    },
    //时间搓转化
    format:function (shijianchuo) {
        //shijianchuo是整数，否则要parseInt转换
        var time = new Date(shijianchuo);
        var y = time.getFullYear();
        var m = time.getMonth()+1;
        var d = time.getDate();
        var h = time.getHours();
        var mm = time.getMinutes();
        var s = time.getSeconds();
        function add0(m){return m<10?'0'+m:m }
        return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
    },
    /**获得客户端信息*/
    getMacAndIp:function (a) {
        $("#time").val(a);
        baseAjax2({
                url:"login/adminLogin.htm",
                data:{
                    userName:$("#userName").val(),
                    pwd:$("#pwd").val(),
                    time:$("#time").val()
                },
                async:false,
                success:function(data){
                    baseAjax2({
                            url:"login/getLoginPhone.htm",
                            async:false,
                            success:function(res){
                                var data = res.data;
                                WindowsClientWeb.LoginSeatIn(data.SEAT_NO,data.SEAT_PASS);
                                location.href ="../home/home.html";
                            }
                        }
                    );
                    go=true;
                },excepetion:function () {
                    go=true;
                }
            }
        );
    },
    //分页控制
    runFlag:true,
    pageChange:function (data) {
        var curP=data==undefined?"#CurNum":data;
        if(this.runFlag==false){
            $("#next").css({
                cursor:"no-drop"
            });
        }else{
            $("#next").css({
                cursor:"pointer"
            });
        };
        if($(curP).html()==1){
            $("#pre").on("mouseenter",function(){
                $(this).css({
                    cursor:"no-drop"
                })
            });
            $("#firstBtn").on("mouseenter",function(){
                $(this).css({
                    cursor:"no-drop"
                })
            })

        }else{
            $("#pre").on("mouseenter",function(){
                $(this).css({
                    cursor:"pointer"
                })
            });
            $("#firstBtn").on("mouseenter",function(){
                $(this).css({
                    cursor:"pointer"
                })
            })
        }
    },
    //全局刷新
    RefreshWeb:function () {
        window.location.reload();
    },
    //外壳退出
    securityExit:function () {
        baseAjax2({
            type:"get",
            url:"/login/exit.htm",
            callData:"no",
            async:false,
            success:function(){
                console.log("退出完成..")
            }
        });
    },
    //外呼电话
    CallPhone:function (phone,fun) {
        if (typeof WindowsClientWeb != 'undefined') {
            try {
                WindowsClientWeb.JavascriptCallPhone(phone,fun);
            } catch (e) {

            }
        }else{
            $.fn.tishTips({
                type: "error",
                content:"请使用客户端打电话！",
            });
        }
    },
    // 数据请求遮罩层
    AjaxLoad:{
        // 出现
        ajaxLoadShow:function () {
            $(".ajaxLoad").show();
            $(".ajaxLoadBg").show();
        },
        // 消失
        ajaxLoadHide:function () {
            $(".ajaxLoad").hide();
            $(".ajaxLoadBg").hide();
        }
    },
    // 获取cookie
    getCookie:function (name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg)){
            return decodeURIComponent(arr[2]);
        } else{
            return null;
        }
    },
    // 过滤避免xss攻击
    xss:function (html) {
        var stt=[];
        var strLen=html.split("").length;
        for(var i=0;i<strLen;i++){
            var ch=html.charAt(i);
            switch(ch){
                case ">":
                    stt.push("&gt;");
                    break;
                case "<":
                    stt.push("&lt;");
                    break;
                case "&":
                    stt.push("&amp;");
                    break;
                case "\'":
                    stt.push("&#039");
                    break;
                //case '"':
                //    stt.push("&quot;");
                //    break;
                default:
                    stt.push(ch);
                    break;
            }
        }
        return stt.join("")
    },
    //唯一ID
    OnlyId:function () {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    // 基于jquery的公用ajax方法
    // hash容器
    limitPendingRequests:{},
    baseAjax2:function (crm_data) {
        var _this=this;
        /**
         * 封装的ajax方法，属性不够可以再添加，baseAjax可以作为大多数的默认调用
         * @param crm_data
         *      type:请求方式  可以为空，为空时默认为POST
         *      cache:缓存 可以为空，为空时默认为false
         *      crossDomain: 可以为空，为空时默认为true
         *      url: 请求地址不能为空   不用加BASEPATH 这里会自动追加
         *      dataType:可以为空 为空时默认为json
         *      timeout: 可以为空 为空时默认为60秒超时
         *      beforeSend: 默认值，默认调用遮罩
         *      success:数据库处理成功回调方法
         *      exception:数据库处理失败回调方法
         *      callData:返回到回调方法的数据格式 可以为空，
         *              为空时或者为all时，默认全部数据resObj
         *              no ---》不传递数据
         *              data --》传递数据resObj.data==null?[]:resObj.data
         *
         *      successDialog:数据库处理成功后未找到success()回调方法时是否弹出提示 可以为空 为空时默认为true
         *      exceptionDialog:数据库处理失败后未找到exception()回调方法时是否弹出提示 可以为空 为空时默认为true
         *      uploadAjax：是否用于图片上传
         */
            //var myID = "static" + guid();
        var url = crm_data.url;
        if(_this.limitPendingRequests[ url ] && url!="crm/htmlInit.htm"){
            return false;
        }else{
            try{
                this.limitPendingRequests[ url ] = true;
                var isR = crm_data.remove==undefined?false:crm_data.remove;
                var cookies = _this.getCookie("USER_ID");
                if(cookies==null && crm_data.url!="login/adminLogin.htm" && crm_data.url!="login/getServerTime.htm"){
                    location.href = BASEPATH+"CRM/login/login.html";
                }else{

                    $.ajax({
                        type:crm_data.type==undefined?"POST":crm_data.type, //请求方式  可以为空，为空时默认为POST
                        cache: crm_data.cache==undefined?false:crm_data.cache,//cache   可以为空，为空时默认为false
                        async:crm_data.async==undefined?true:crm_data.async,
                        contentType:crm_data.uploadAjax==undefined?true:false, //必须
                        processData:crm_data.uploadAjax==undefined?true:false, //必须
                        crossDomain:crm_data.crossDomain==undefined?true:crm_data.crossDomain,//crossDomain 跨域代理， 但是post中的数据必须手动转成json格式的  可以为空，true
                        url:BASEPATH+crm_data.url,//请求地址，不能为空
                        data:crm_data.data==undefined?{}:crm_data.data,//请求数据，可以为空，为空时为{}
                        //dataType:crm_data.dataType==undefined?"json":crm_data.dataType,
                        timeout:crm_data.timeout==undefined?60000:crm_data.timeout,//超时设置 默认为60秒超时
                        beforeSend :function(){
                            if(crm_data.ajaxLoadShow!=false){
                                _this.AjaxLoad.ajaxLoadShow();
                            }
                        },
                        success:function(resStr){
                            delete _this.limitPendingRequests[ url ];
                            //规避xss攻击
                            var resObj={};
                            if( typeof resStr == "object"){
                                if(crm_data.xss==undefined || crm_data.xss !=false){
                                    resStr = JSON.stringify(resStr);
                                    var Msg=_this.xss(resStr);
                                    resObj = JSON.parse(Msg);
                                }else{
                                    resObj = resStr;
                                }
                            }else{
                                //规避xss攻击
                                if(crm_data.xss==undefined || crm_data.xss !=false){
                                    var Msg=_this.xss(resStr);
                                    resObj = JSON.parse(Msg);
                                }else{
                                    resObj = JSON.parse(resStr);
                                }
                            }
                            var code = (crm_data.code==undefined || crm_data.dispose)?"S00":crm_data.code;
                            if(resObj.code==code){
                                if(crm_data.success!=undefined){
                                    if(crm_data.callData == undefined || crm_data.callData == "all"){
                                        crm_data.success(resObj);
                                    }else if(crm_data.callData == "no"){
                                        crm_data.success();
                                    }else if(crm_data.callData == "data"){
                                        crm_data.success(resObj.data==null?[]:resObj.data);
                                    }
                                }else{
                                    if(crm_data.successDialog==undefined || crm_data.successDialog){
                                        if(isR==true){
                                            closeAllPop();
                                        }
                                        $.fn.dialog({
                                            type: "success",
                                            title: "提示",
                                            content:resObj.msg,
                                            userFooter:true,
                                            allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                                        });
                                    }
                                }
                            }else if(resObj.code=="NOT_USER"){
                                location.href = BASEPATH+"CRM/login/login.html";
                            }else if(resObj.code=="SHUT_SERVER"){
                                location.href = BASEPATH+"CRM/home/shutserver.html";
                            }else{
                                if(crm_data.exception!=undefined){
                                    if(crm_data.callData == undefined || crm_data.callData == "all"){
                                        crm_data.exception(resObj);
                                    }else if(crm_data.callData == "no"){
                                        crm_data.exception();
                                    }else if(crm_data.callData == "data"){
                                        crm_data.exception(resObj.data==null?[]:resObj.data);
                                    }
                                }else{
                                    if(crm_data.exceptionDialog==undefined || crm_data.exceptionDialog){
                                        var error = $("[crmTypeError]");
                                        if(isR==true){
                                            closeAllPop();
                                        }
                                        if(error.length<=0){
                                            $.fn.dialog({
                                                type: "error",
                                                title: "提示",
                                                content:resObj.msg,
                                                userFooter:true,
                                                allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                                            });
                                        }
                                    }
                                }
                            }
                            _this.AjaxLoad.ajaxLoadHide();
                        },
                        error:function(re){
                            delete _this.limitPendingRequests[ url ];
                            _this.AjaxLoad.ajaxLoadHide();
                            var error = $("[crmTypeError]");
                            if(error.length<=0){
                                if(isR==true){
                                    closeAllPop();
                                }
                                $.fn.dialog({
                                    type: "error",
                                    title: "提示",
                                    content:"请求异常！请刷新重试",
                                    userFooter:true,
                                    allBtn:[["关闭","bac_9e9ea6",function(){},true]]
                                });
                            }
                        }
                    });

                }
            }catch(e){
                _this.limitPendingRequests[ url ] = true;
                console.log(e);
            }

        }
    },
    // 权限
    btn_key:function (b_data) {
        var btn_key = b_data.btn_key==undefined?"btn_key":b_data.btn_key;
        var btns = $("["+btn_key+"]");
        var data = b_data.data;
        if(btns!=null && btns.length>0){
            if(data !=null ){
                for(var i=0;i<btns.length;i++){
                    var flag = true;
                    var btnNuml =$(btns[i]).attr(btn_key);
                    $.each(data, function(index,item){
                        if(index==btnNuml){
                            $(btns[i]).attr("btnNum",item);
                            $(btns[i]).removeAttr("btn_key");
                            flag = false;
                        }
                    });
                    if(flag){
                        var btn_type = $(btns[i]).attr("btn_type");
                        if(btn_type==undefined || btn_type=="remove" || btn_type =="1"){
                            $(btns[i]).remove();
                        }else if(btn_type=="span" || btn_type =="2"){
                            var hm =  $(btns[i]).html();
                            $(btns[i]).parent().append("<span>"+hm+"</span>");
                            $(btns[i]).remove();
                        }
                    }else{
                        $(btns[i]).show();
                    }
                }
            }
        }
        if(b_data.tableHeight==true){
            tableHeights();
        }
    },
    // 高度计算
    tableHeights:function (hei) {
        window.onresize=function(){
            this.tableHeights();
        };
        $(".channelhide").css({
            display:"inline"
        });
        $(".pagersMax").css({
            display:""
        });    hei=hei?hei:0;
        //屏幕高度

        var winHeight=$(window).height();
        //最顶部高度
        //$(".homeHeader").height()
        var menuHeight=50;
        //模块名高度
        var modelHeight=$('.title').height();
        //搜索条件高度
        var searchHeight=$(".retrieve").height();
        //按钮高度
        //var BtnsHeight=$('.BtnHeight').height();
        //表头高度
        var tableHeight=$(".table-head").height();
        //表尾高度
        var tabHeight=$(".pagersMax").height();
        //边框线条
        var bLine=6;
        //滚动公告高度
        var rollNotice=0;
        if($(".clientRollNotice").length>0){
            rollNotice=$(".clientRollNotice").height()-22;
        }
        //实际表高度
        var trueHe=winHeight-menuHeight-modelHeight-searchHeight-tableHeight-tabHeight-bLine-rollNotice-hei;
        $(".BigTableheight").css("height",trueHe);
    },
    // 小页面权限
    btn_p:function (data) {
        var tagcontentid;
        if(data){
            if(data.className){
                var uk = $("."+data.className);
                tagcontentid = $(uk[uk.length-1]).attr(data.num);
            }else{
                var uk = $(".on");
                tagcontentid = $(uk[uk.length-1]).attr("tagcontentid");
            }
        }else{
            var uk = $(".on");
            tagcontentid = $(uk[uk.length-1]).attr("tagcontentid");
        }
        var async=true;
        if(data){
            if(data.async){
                async=true;
            }else{
                async=false;
            }
        }
        this.baseAjax2({
            url: "crm/htmlInit.htm",
            data: {P_TYPE: "BTN", PRIV_F_NO: tagcontentid},
            async:async,
            success: function (resObj) {
                btn_key({
                    data:resObj.BTN
                });
            }
        });
    },
    // 获取电话
    getPhone:function (ph) {
        var phone = $(ph).attr("phone");
        $.fn.dialog({
            type: "success",
            title: "电话号码",
            content:phone,
            userFooter:true,
            allBtn:[["关闭","bac_9e9ea6",function(){},true]]
        });
    },
    //电话号码相关权限
    canLookUserPhone:function () {
        if(!sessionStorage.getItem("userLookPhoneS")){
            this.baseAjax2({
                url:"crm/htmlInit.htm",
                data:{P_TYPE:"BTN",PRIV_F_NO:"other"},
                success:function(res){
                    //是否可以查看电话号码
                    if(res.BTN.lookPhone){
                        sessionStorage.setItem("userLookPhoneS",true);
                    }else{
                        sessionStorage.setItem("userLookPhoneS",false);
                    }
                    //呼叫电话文本框
                    if(res.BTN.tel_phone){
                        sessionStorage.setItem("tel_phone",true);
                    }else{
                        sessionStorage.setItem("tel_phone",false);
                    }
                    //呼叫电话按钮是否显示
                    if(res.BTN.phoneButton){
                        sessionStorage.setItem("phoneButton",true);
                    }else{
                        sessionStorage.setItem("phoneButton",false);
                    }
                }
            });
        }
    },
    //呼叫电话文本框
    isCallPhone:function (fun) {
        if(sessionStorage.getItem("tel_phone")=="true"){
            fun();
        }
    },
    //呼叫电话按钮是否显示
    CallPhoneButton:function (fun) {
        if(sessionStorage.getItem("phoneButton")=="true"){
            fun();
        }
    },
    // 展示电话
    lookPhoneNums:function (data) {
        data.name=data.name?data.name:'.clientPhoneNum';
        if($(data.node).html()!="查看号码"){
            $(data.node).html("查看号码");
        }else{
            $(data.name).html("查看号码");
            if(sessionStorage.getItem("userLookPhoneS")=="true"){
                $(data.node).html($(data.node).attr("val"));
            }else{
                var newH=$(data.node).attr("val");
                var trH='';
                for(var i=0;i<newH.length;i++){
                    if(i<3){
                        trH+=newH[i];
                    }else if(i+3>=newH.length){
                        trH+=newH[i];
                    }else{
                        trH+='*';
                    }
                }
                $(data.node).html(trH);
            }
            //TODO 查询电话日志
            this.baseAjax2({
                url:"/crm/call/getCallLog.htm",
                data:{
                    I_PHONE_NO:$(data.node).attr("val"),
                },
                ajaxLoadShow:false,
                success:function(re){
                    //console.log(re)
                }
            })
        }
    },
    filesPhonesNum:function (node) {
        if(sessionStorage.getItem("userLookPhoneS")=="true"){
            $(node).val($(node).attr("val"));
        }else{
            var newH=$(node).attr("val");
            var trH='';
            for(var i=0;i<newH.length;i++){
                if(i<3){
                    trH+=newH[i];
                }else if(i+3>=newH.length){
                    trH+=newH[i];
                }else{
                    trH+='*';
                }
            }
            $(node).val(trH);
        }
    },
    // 打电话，除了导入客户列表歪得所有打电话调用此方法
    callPhones:function (data) {
        var phoneNum =  $(data.node).attr('phoneNum');
        phoneCusNo='';
        phoneCusNo = $(data.node).attr('custNo')?$(data.node).attr('custNo'):'';
        if (typeof WindowsClientWeb != 'undefined') {
            try {
                if(phoneNum){
                    WindowsClientWeb.JavascriptCallPhone(phoneNum,'callPhoneLog');
                }
            } catch (e) {
                console.log("电话通讯异常:"+e);
            }
        }else{
            $.fn.tishTips({
                type: "error",
                content:"请使用客户端打电话！",
            });
        }
    },
    // 首页上方打电话
    callPhones2:function (data) {
        phoneCusNo='';
        if (typeof WindowsClientWeb != 'undefined') {
            try {
                WindowsClientWeb.JavascriptCallPhone('','callPhoneLog');
            } catch (e) {
                console.log("电话通讯异常:"+e);
            }
        }else{
            $.fn.tishTips({
                type: "error",
                content:"请使用客户端打电话！",
            });
        }
    },
    //打电话日志存入
    callPhoneLog:function (data) {
        var dk = JSON.parse(data);
        var datal = {
            I_IN_TIME:dk.StartTime,
            I_BEGIN_TIME:dk.BeginTime,
            I_END_TIME:dk.EndTime,
            I_WAIT_TIME:dk.WaitLen,
            I_CR_LONG:dk.TalkLen,
            I_SEAT_NO:dk.UserID,
            I_CUS_NO:phoneCusNo,
            I_CUS_TEL:dk.Phone,
            I_CALL_TYPE:dk.CallType,
            I_RECADR_SERVER:dk.Recode,
            I_CALLID:dk.CallID,
            I_ENTSN:dk.EntSn,
            I_AGTSN:dk.AgtSn,
            I_CHAN:dk.Chan,
            I_MATE:dk.Mate,
            I_AREA:dk.Area,
            I_SIGN:dk.Sign,
        };
        this.baseAjax2({
            url:"crm/customerCallRecord/GetCaVe.htm",
            data:datal,
            success:function(resObj){
                //成功不管，回调留着
                //phoneCusNo = "";
            },
            exception:function(resObj){
                //TODO 这里代表电话记录存入失败，向java服务器发送一个请求，处理；
                //留着以后处理
            },
        });
    },
    changeHeadImgSrc:function (img) {
        document.getElementById('xxxxxxxxuserHead').src=img;
        myheadiMG = img;
    },
    //播放录音域名
    mainUserPhoneUrl:"http://rec.fncall.com:17081",
    // 滚动提示
    clientRollLookFlag:true,
    // 滚动
    clientRollL:function () {
        setInterval(function(){
            var leng=$(".clientRollNotice p").length;
            if(!leng){
                return false;
            }
            if(!this.clientRollLookFlag){
                return false;
            }
            var he=$(".clientRollNotice p").height();
            //var mt=parseInt($($(".clientRollNotice p")[0]).css("margin-top"));
            if(this.clientRollLookFlag){
                var newCDClient=$($(".clientRollNotice p")[0]);
                $($(".clientRollNotice p")[0]).remove();
                $(".clientRollNotice").append(newCDClient);
            }
        },15000);
    },
    //转换滚动条
    changeScrollVisType:function (overflowScrollTable) {
        overflowScrollTable=overflowScrollTable?overflowScrollTable:".overflowScrollTable";
        $(overflowScrollTable).attr("overflow","visible");
        $(overflowScrollTable).attr("overflow","hidden");
    },
    downExcel:function (name) {
        var arrb = [];
        var num = 0;

        var tables  = $(".exportExcel");
        for (var t=0;t<tables.length;t++) {
            var table = $(tables[t]);
            //获取，组装数据
            var trs = $(table).find('tr');
            for (var i=0;i<trs.length;i++){
                var a = [];
                var  tr = $(trs[i]);
                var ths = $(trs[i].children);
                for (var j=0;j<ths.length;j++){
                    a.push({
                        value:$(ths[j]).html(),
                        bagColor:$(tr).attr("bagColor"),
                        color:$(tr).attr("fColor"),
                        rowspan:$(ths[j]).attr("rowspan")==undefined?1:$(ths[j]).attr("rowspan"),
                        colspan:$(ths[j]).attr("colspan")==undefined?1:$(ths[j]).attr("colspan"),
                    });
                }
                if(a.length>num){
                    num =a.length;
                }
                arrb.push(a);
            }
        }
        $("#excel-dat").html(JSON.stringify(arrb));
        $("#excel-x").attr("value",arrb.length);
        $("#excel-y").attr("value",num);
        $("#excel-name").attr("value",name);
        $("#excelDiv").html('<iframe src="./excelIframe.html"></iframe>');
    },
    getNowFormatDate:function () {
        var date = new Date();
        var seperator1 = "-";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
        return currentdate;
    }

};













function filesPhonesNum(node){
    if(sessionStorage.getItem("userLookPhoneS")=="true"){
        $(node).val($(node).attr("val"));
    }else{
        var newH=$(node).attr("val");
        var trH='';
        for(var i=0;i<newH.length;i++){
            if(i<3){
                trH+=newH[i];
            }else if(i+3>=newH.length){
                trH+=newH[i];
            }else{
                trH+='*';
            }
        }
        $(node).val(trH);
    }
}

