//对外接口
(function(){

    var tid = 0,t=0,isVisiable=true;

    window.IO = {
        
        //优酷client id
        YK_CLIENT_ID: '33ac8d9576c7d7a4',
        
        //畅言appid
        CY_APPID: 'cyqThIWHt',
        
        CY_CONF: 'prod_cefb500a9f3d05511296a719cffb21cf',
        
        //调用客户端
        tell: function(key, arg, callback){
            tid++;
            try {
                window.external.KYPC_CTRL(tid+'', key, arg, callback);
                return true;
            } catch(e) {
                return false;
            }
        },
        
        /**
         * 通知客户端JS加载完毕 
         */
        pageReady: function(){
            IO.tell('IsLoadSuccessed', '');
        },
        
        /**
         * 下载应用 
         */
        download: function(appid){
            if (appid){
                return IO.tell('downguessapp', appid);
            } else {
                return IO.tell('download', '');
            }
        },
        
        /**
         * 升级应用应用 
         */
        update: function(){
            return IO.tell('update', '');
        },
        
        /**
         * 跳转至下载界面 
         */
        goDownload: function(){
            return IO.tell('gotodownload', '');
        },
        
        /**
         * 进入详情页面 
         */
        goAppInfo: function(appid){
            return IO.tell('openwebguessapp', appid);
        },
        
        /**
         * 获取应用通知更新状态
         */
        getAppNoticeStatus: function(){
        	var updatestatus = document.location.search.indexOf('updatestatus=0');
        	if(updatestatus!=-1){
        		return 0;
        	}
            return 1;
        },
        
        /**
         * 通知更新应用
         */
        noticeUpdate: function(appid){
            return IO.tell('noticeupdate', appid);
        },
        
        /**
         * 跳转到外链
         */
        goLink: function(url){
        	return IO.tell('openwebbrowser', url);
        },
        
        /**
         * 打开专题
         */
        openTopic: function(id){
        	return IO.tell('opentopic', id);
        },
        
        /**
         * 搜索
         */
        search: function(txt){
         	return IO.tell('search', txt);
        },
        
        /**
         * 获取好评数据 
         */
        getPraise: function(praiseData){
            IO.tell('getdetailRatio', praiseData, 'IO.initPraise');
        },
        
        /**
         * 发送好评操作
         */
        postPraise: function(appid, version, type){
            var url = 'http://fcn_21.kuaiyong.com/Interface/i_comment_app.php' + '?appid=' + appid + '&appver=' + version + '&type=' + type + '&varname=__interface_evaluate_result&no_cache=' + new Date().getTime();
            IO.tell('postedetailmsg', url, 'IO.postPraiseComplete');
        },
        
        
        //通过应用id获取应用信息
        getAppInfo: function(appId){
            var callbackName = 'IO.initAppInfo',
                url = 'http://fcn_21.kuaiyong.com/Interface/i_get_game_ipa_detail_infor.php?client=&version=0&dataid=' + appId + '&callback=' + callbackName;
            Base.getScript(url,'',IO.showError);
            t = setTimeout(IO.showError,3000);
        },
        
        //通过首次通信得到的接口获取应用详情
        getAppDetail: function(url){
            Base.getScript(url, function(){
                IO.initAppDetailInfo(__kypc_appinfo);
                delete __kypc_appinfo;
            });
        },
        
        //获取应用评测信息,增加如果脚本加载失败的情况下的回调函数
        getAppEvaluate: function(url){
            Base.getScript(url,'',IO.hideAppEvaluate);
        },
        
        //获取视频播放
        getVideoInfo: function(vid){
            var callbackName = 'IO.initVideoInfo',
            	url = 'https://openapi.youku.com/v2/videos/show.json?client_id=' + IO.YK_CLIENT_ID + '&video_id=' + vid+ '&callback=' + callbackName;
            Base.getScript(url);
        },
        //获取应用评论信息
        getAppComment: function(appid){
        	appid = 'shcy_' + appid.substr(0, 58);//应用id过长会导致错误，所以截取63位
            var callbackName = 'IO.initCommentInfo',
                url = 'http://changyan.sohu.com/api/2/topic/load?client_id=' + IO.CY_APPID + '&topic_url=&topic_source_id=' + appid+ '&callback=' + callbackName;
            Base.getScript(url);
        },
        
        //获取游戏攻略
        getGameGuide: function(url){
            Base.getScript(url,'',IO.hideGameGuide);
        },
        
        
        //获取基础信息的回调方法
        initAppInfo: function(result){
        	if(t>0){//停止延迟时间
        		clearTimeout(t);
        	}
        	if(!isVisiable){//当请重试页面显示出来时，停止显示详情页面
        		return;
        	}
            if (!result[0] || result[0]['RESULT'] != 0){
                IO.showError();
                return;
            }
            var data = result[1]['APPINFOR'];
            if(!data){
            	IO.showOffTheShelf();
            	return;
            }
            var device = data['DEVICE'].toLowerCase(),
                server_time = result[0]['SERVER_TIME'];
            data['DEVICESYMBOL'] = device == 'iphone' ? 1 : (device == 'ipad' ? 2 : 3);
            data['SERVER_TIME'] = server_time;
            Observer.send(Observer.APP_INFO, data);
            Observer.send(Observer.GUESS_INFO, data['GUESSULIKE']);
            if (data['DETAILINFORURL']){
                IO.getAppDetail(data['DETAILINFORURL']);
            }
            if (data['EVALUATEPAGE']){
                IO.getAppEvaluate(data['EVALUATEPAGE']);
            }
            if (data['VIDEO_ID']){
                IO.getVideoInfo(data['VIDEO_ID']);
            }
            if (parseInt(data['COMMENT_ENABLE'])){
                IO.getAppComment(data['APPID']);
            }
            
            Observer.send(Observer.APP_UPDATE_NOTICE, IO.getAppNoticeStatus(),data['APPID']);
            
        },
        
        //获取应用详细信息的回调方法
        initAppDetailInfo: function(data){
            Observer.send(Observer.APP_DETAIL, data['APPINFOR']['APPDETAILINTRO']);
            Observer.send(Observer.APP_PREVIEW, {iphone:data['APPINFOR']['APPPREVIEWURLS'], ipad:data['APPINFOR']['APPIPADPREVIEWURLS']});
        },
        
        //获取评测信息的回调方法
        initEvaluate: function(data){
        	if(data){
        		Observer.send(Observer.APP_EVALUATE, data);
        	}else{
        		IO.hideAppEvaluate();
        	}
        },
        
        //获取视频详细信息回调方法,原先是实时的从优酷取播放次数，为了显示数据统一，去除该方法
        initVideoInfo: function(data){
            //Observer.send(Observer.APP_VIDEO_INFO, data);
        },
        
        //获取评论的回调方法
        initCommentInfo: function(data){
            Observer.send(Observer.APP_COMMENT_INFO, data);
        },
        
        //获取攻略的回调方法
        initStrategy: function(data){
            Observer.send(Observer.APP_STRATEGY_INFO, data);
        },
        
        //应用状态变化
        appStateChange: function(appId, state){
            Observer.send(Observer.APP_STATE_CHANGE, state);
        },
        
        //取得好评数据的回调方法
        initPraise:function(data){
        	Observer.send(Observer.APP_PRAISE, data);
        },
        /*initPraise: function(tid, rescode, res){
            var result, data;
            try {
                result = eval(res);
            }catch(e) {
                throw e;
            }
            if ((result instanceof Array) && (!!result[1])) {
                Observer.send(Observer.APP_PRAISE, data);
            } else {
            }
        },*/
        
        //完成添加好评操作
        postPraiseComplete: function(){
            
        },
        
        //加载完游戏攻略
        initGameGuide: function(data){
            if(data){
        		Observer.send(Observer.GAME_GUIDE, data);
        	}else{
        		IO.hideGameGuide();
        	}
        },
        //隐藏评测内容
        hideAppEvaluate: function(){
        	Base.get('tab-review').className = "";
            Base.get('app-review').className = "";
            //优先显示详情
            Base.get('tab-detail').className += ' active';
        	Base.get('app-detail').className += ' active';
        },
        //隐藏攻略--
        hideGameGuide: function(){
        	Base.get('tab-strategy').className = "";
        	Base.get('app-strategy').className = "";
        	Base.get('strategy-related').style.display = "none";
        	//优先显示详情
            Base.get('tab-detail').className += ' active';
        	Base.get('app-detail').className += ' active';
        },
        //展示404页面
        showError: function(){
        	var href=document.location.href,errorCode = '<div style=\"width:1009px;height:645px;\">'
        				+'<div style=\"position: relative;top:50%;left:50%;margin-left:-80px;margin-top:-130px;_width:220px;_padding-left:20px;*margin-left:-100px;\">'
        				+'<img src=\"./image/wifi.png\" style=\"display:block;\"/>'
        				+'<span style=\"display:block;margin-top:20px;margin-left:-15px;font-family:微软雅黑;font-size:32px;color:#A9A9A9;\">数据获取失败</span>'
        				+'<span style=\"display:block;margin-top:10px;margin-left:-20px;font-family:微软雅黑;font-size:17px;letter-spacing:1px;color:#959595;line-height:24px;height:24px;letter-spacing:1px;\">请点击刷新'
        				+'<a style=\"background-color:#16A085;width:38px;height:24px;font-size:17px;color:#fff;cursor:pointer;margin-right:1px;padding:0 2px 0 4px;\"'
        				+' onmouseover=\"this.style.backgroundColor=\'#20BB9D\'\"'
        				+' onmouseout=\"this.style.backgroundColor=\'#16A085\'\"'
        				+' onclick="this.style.backgroundColor=\'#098C72\';this.href = \''+href+'\';">重试</a>重新获取</span>'
        				+'</div>'
        				+'</div>';
        	document.body.innerHTML = errorCode;
        	isVisiable = false;
        },
        //展示下架页面
        showOffTheShelf:function(){
        	document.body.innerHTML = '<div style=\"width:1009px;height:645px;\"><img src=\"./image/o-stock.jpg\" style=\"display:block;position: relative;top:50%;left:50%;margin-left:-110px;margin-top:-80px;\"/></div>';
        }
    };
    
})();

function initEvaluate(data){
	IO.initEvaluate(data);
}