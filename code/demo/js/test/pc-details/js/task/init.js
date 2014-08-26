var Global = {
    
    //判断显示更多按钮是否显示
    displayToggleBtn: function(){
        var container = Base.get('info-fold-cont'),
            btn = Base.get('btn-toggle'),
            height = container.offsetHeight,container_height=504;
        //兼容ie6
        if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE6.0"){
        	container_height = 250;
        }
    	if (height >= container_height){
            btn.style.visibility = 'visible';
        } else {
            btn.style.visibility = 'hidden';
        }
    },
    //检查图片加载完毕
    checkImgLoaded: function(activeNode){
    	var img,images,len,loadedLength=0;
        if(activeNode){
        	images = activeNode.getElementsByTagName('img');
        	len = images.length;
        	for(var i=0;i<len;i++){
        		images[i].onload = function(){
        			loadedLength++;
        			if (len == loadedLength){
			            Global.displayToggleBtn();
			        }
        		}
        		images[i].onerror = function(){
        			this.src = 'image/default.png';
                    this.width = '200';
                    self.loadedLength++;
        			if (len == loadedLength){
			            Global.displayToggleBtn();
			        }
        		}
        	}
        	if (len == loadedLength){//如果没有图片
	            Global.displayToggleBtn();
	        }
        }
    }
};

//展示应用信息
(function(){
    
    //获取appid
    function getAppId(){
        return /appid=(.+)/gi.exec(document.location.search)[1];
    }
    
    //展示基础信息
    function showBaseInfo(type, info){
        Base.get('app-icon').src = info['BIGICONURL'];//appicon用大图标
        Base.get('app-name').innerHTML = info['APPNAME'];
        if(info['APPNAME'].length>=40){
        	Base.get('app-name').title = info['APPNAME'];
        }
        var appIntroText = info['EDITER_INTRO_FOR_PLAY_GAME']?info['EDITER_INTRO_FOR_PLAY_GAME']:info['APPINTRO'];
        Base.get('app-intro').innerHTML = Base.ellipsis(appIntroText,165);
        //Base.get('app-intro').innerHTML = appIntroText;
        if(appIntroText.length>165){
        	Base.get('app-intro').title = appIntroText;
        }
        Base.get('app-version').innerHTML = info['DISPLAYVERSION'];
        Base.get('app-version').title = info['DISPLAYVERSION'];
        Base.get('app-size').innerHTML = formatSize(info['APPSIZE']);
        Base.get('app-size').title = formatSize(info['APPSIZE']); 
        Base.get('app-category').innerHTML = info['CATEGORY'];
        Base.get('app-category').title = info['CATEGORY'];
        Base.get('app-language').innerHTML = formatLang(info['LANGUAGE']);
        Base.get('app-language').title = info['LANGUAGE'];
        Base.get('app-minosver').innerHTML = info['APPMINOSVER'];
        Base.get('app-minosver').title = info['APPMINOSVER'];
        Base.get('app-developer').innerHTML = info['APPDEVELOPER'];
        Base.get('app-developer').title = info['APPDEVELOPER'];
        Base.get('app-top-icon').src = info['APPICONURL'];//apptopicon用小图标
        Base.get('app-top-name').innerHTML = Base.ellipsis(info['APPNAME'],80);
        if(info['APPNAME'].length>=80){
        	Base.get('app-top-name').title = info['APPNAME'];
        }
        if (info['DEVICESYMBOL'] == 3){
            Base.get('sprt-one').style.display = 'none';
            Base.get('sprt-all').style.display = 'block';
        } else {
            Base.get('sprt-one').style.display = 'block';
            Base.get('sprt-all').style.display = 'none';
            Base.get('app-device').innerHTML = info['DEVICE'];
            Base.get('app-device').className = info['DEVICE'].toLowerCase();
        }
        //修改
        document.title = info['APPNAME'];
    }
    
    function formatSize(size){
        return Math.ceil(parseInt(size) / 10485.76) / 100 + 'M';
    }
    
    function formatLang(lang){
        var list = lang.split(','),
            start = [], end = [], 
            i, len = list.length,
            t;
        for (i=0; i<len; i++){
            t = list[i];
            if (t.length == 2){ //将名称短的语言置于前
                start.push(t);
            } else {
                end.push(t);
            }
        }
        list = start.concat(end).join(',');
        return Base.ellipsis(list, 52);
    }
    
    //展示应用详细信息
    function showDetail(type, detail){
        Base.get('app-detail').innerHTML = detail;
        Global.checkImgLoaded(Base.get('app-detail'));
    }
    
    //展示评测内容
    function showEvaluate(type, info){
    	Base.get('app-review').innerHTML = info;
    	Global.checkImgLoaded(Base.get('app-review'));
    }

    function main(){
        IO.getAppInfo(getAppId());
        Observer.add(Observer.APP_INFO, showBaseInfo);
        Observer.add(Observer.APP_DETAIL, showDetail);
        Observer.add(Observer.APP_EVALUATE, showEvaluate);
    }
    
    main();
    
})();


//预览控制
(function(){
    
    var tabView, tabs = [], containers = [],scrolls = [],
        iphoneSlide, ipadSlide,iponeScroll,ipadScroll;
    //预览阴影部分
    var shadowLefts = [document.getElementById('iphone-shadow-left'),document.getElementById('ipad-shadow-left')],
		shadowRights = [document.getElementById('iphone-shadow-right'),document.getElementById('ipad-shadow-right')],
		len = shadowLefts.length;
	//iphone滚动条
    iphoneScroll = new Component.ScrollBar(Base.get('iphone-pic-con'),Base.get('iphone-pic'),Base.get('iphone-scroll-cont'),Base.get('iphone-scroll-outer'));
    
    iphoneSlide = new Component.Slide({
        container: Base.get('iphone-pic'), 
        width: 704,
        height: 330,
        gap: 3,
        controls: [Base.get('iphone-shadow-left'), Base.get('iphone-shadow-right')],
        scrollBar:iphoneScroll
    });
    //ipad滚动条
    ipadScroll = new Component.ScrollBar(Base.get('ipad-pic-con'),Base.get('ipad-pic'),Base.get('ipad-scroll-cont'),Base.get('ipad-scroll-outer'));
    
    ipadSlide = new Component.Slide({
        container: Base.get('ipad-pic'), 
        width: 704,
        height: 332,
        gap: 3,
        controls: [Base.get('ipad-shadow-left'), Base.get('ipad-shadow-right')],
        scrollBar:ipadScroll
    });
    
    function showVideo(vid){
        var autoPlay = /autoplay=(.+)/gi.exec(document.location.search),
            player, events = {},timer,canPlay=false;
        autoPlay = !!parseInt(autoPlay&&autoPlay[1]);
        player = new YKU.Player('app-video',{
            styleid: '0',
            client_id: IO.YK_CLIENT_ID,
            vid: vid,
            autoplay: false,
            show_related: false,
            events:{
				onPlayerReady: function(){
					if(autoPlay){
						canPlay = true;
					}
				},
				onPlayStart:function(){
					clearInterval(timer);
				}
			}
        });
        timer = setInterval(function(){
				if(canPlay){
					player.playVideo();
				}
		},500);
    }
    //
    function main(){
    	var shadowLeft,shadowRight;
        //APP_INFO必然先于APP_PREVIEW触发
        Observer.add(Observer.APP_INFO, function(type, info){
            if (info['VIDEO_ID']){
                Base.get('tab-video').className = 'is-show';
                tabs.push(Base.get('tab-video'));
                containers.push(Base.get('app-video-con'));
                scrolls.push(null);
                showVideo(info['VIDEO_ID']);
                Base.get('tab-video').innerHTML = '视频(' + Base.formatNumber(info['VIDEO_VISIT_COUNT']) + ')';
                if(Base.formatNumber(info['VIDEO_VISIT_COUNT']).length>=5){
                	Base.get('tab-video').style.fontSize = '13px';
                }
            }
        });
        Observer.add(Observer.APP_PREVIEW, function(type, priview){
            if (priview['iphone']){
                Base.get('tab-iphone-pic').className = 'is-show';
                tabs.push(Base.get('tab-iphone-pic'));
                containers.push(Base.get('iphone-pic-con'));
                scrolls.push(iphoneScroll);
                iphoneSlide.render(priview['iphone']);
                iphoneSlide.addEvents();
                //iphoneScroll.init();
            }
            if (priview['ipad']){
                Base.get('tab-ipad-pic').className = 'is-show';
                tabs.push(Base.get('tab-ipad-pic'));
                containers.push(Base.get('ipad-pic-con'));
                scrolls.push(ipadScroll);
                ipadSlide.render(priview['ipad']);
                ipadSlide.addEvents();
                //ipadScroll.init();
            }
            tabs[0].className += ' active'; //如果有视频，因视频第一个添加，首个必为视频
            containers[0].className += ' active';
            setTimeout(function(){
            	if (scrolls[0]&&parseInt(Base.getStyle(containers[0],'width'))<containers[0].children[0].style.pixelWidth){
	            	shadowRights[0].style.display = '';
	            	scrolls[0].init();
	            	scrolls[0].show();
	            	scrolls[0].reinit();
	            } else if(scrolls[0]){
	                shadowRights[0].style.display = 'none';
	            }
            },0);
            tabView = new Component.Tab(tabs, containers, 'active',function(index){
            	//隐藏非active的tab的遮挡，触发当前tab的scroll事件，确定是否显示遮挡
                for(var i=0;i<len;i++){
            		shadowLefts[i].style.display = 'none';
            		shadowRights[i].style.display = 'none';
            		if( document.createEvent ){
						var evObj = document.createEvent('HTMLEvents');
		        		evObj.initEvent('scroll', true, true);
						containers[index].dispatchEvent(evObj);
					}else if( document.createEventObject ){
						containers[index].fireEvent('onscroll');
					}
                }
                for(var i=0;i<scrolls.length;i++){
            		 if(scrolls[i]&&i!=index&&parseInt(Base.getStyle(containers[i],'width'))<containers[i].children[0].style.pixelWidth){
                		 scrolls[i].hide();
                	 }
                	 if(scrolls[index]&&i==index&&parseInt(Base.getStyle(containers[index],'width'))<containers[index].children[0].style.pixelWidth){
	                	 scrolls[index].show();
	                 }
                }
            });
        });
        //为了数据统一不实时取数据了
        Observer.add(Observer.APP_VIDEO_INFO, function(type, info){
            //Base.get('tab-video').innerHTML = '视频(' + Base.formatNumber(info['view_count']) + ')';
        });
    }
    
    main();
    
})();

//应用评分处理
(function(){
    Observer.add(Observer.APP_INFO, function(type, info){
        var score = parseInt(info['APP_SCORE']) || 0;
        Base.get('app-score').innerHTML = score + '.0';
        Base.get('score-star').style.width = score*10 + 'px';
        Base.get('score-desc').innerHTML = info['APP_SCORE_DISCRIPTION']||'';
    });
})();

//猜你喜欢模块处理
(function(){
    
    function addGuessListener(){
        var nodes = Base.get('guess-list').getElementsByTagName('a'),
            len = nodes.length, i;
        for (i=0; i<len; i++){
        	Base.addEvent(nodes[i].getElementsByTagName('div')[0], 'click', function(evt){
        		evt = evt || window.event;
                var node = evt.target || evt.srcElement;
                Base.stopEventBubble(evt);
                if(node.nodeName.toLowerCase() == 'div'){//点击图标跳转到对应详情页
                	node = node.parentNode;
                }
                IO.goAppInfo(node.getAttribute('data-id'));
        	});
        	
            Base.addEvent(nodes[i], 'click', function(evt){
                evt = evt || window.event;
                Base.preventDefault(evt);
                var node = evt.target || evt.srcElement;
                if (node.nodeName.toLowerCase() != 'a'&& node.nodeName.toLowerCase() != 'div'){
                    node = node.parentNode;
                    IO.download(node.getAttribute('data-id'));
                }
            });
            //增加下载按钮移入移除事件
            Base.addEvent(nodes[i].getElementsByTagName('span')[0], 'mouseover', function(evt){
        		evt = evt || window.event;
                var node = evt.target || evt.srcElement;
                Base.preventDefault(evt);
                if(node.nodeName.toLowerCase() == 'span'){//点击图标跳转到对应详情页
                	node.style.backgroundPosition = '-65px 0px';
                	node.style.color = '#fff';
                }
        	});
        	
            Base.addEvent(nodes[i].getElementsByTagName('span')[0], 'mouseout', function(evt){
        		evt = evt || window.event;
                var node = evt.target || evt.srcElement;
                Base.preventDefault(evt);
                if(node.nodeName.toLowerCase() == 'span'){//点击图标跳转到对应详情页
                	node.style.backgroundPosition = '0px 0px';
                	node.style.color = '';
                }
        	});
        }
    }
    
    Observer.add(Observer.GUESS_INFO, function(type, list){
        if (!list){
            return;
        }
        var i, len=list.length,
            html = [];
        for (i=0; i<len; i++){
            html.push([
                '<li>',
                    '<a href="#" class="app" data-id="' + list[i]['APPID'] + '">',
                        '<img src="' + list[i]['APPICONURL'] + '" alt="" />',
                        '<div class="appmask"></div>',
                        '<h4 class="appname">' + list[i]['APPNAME'] + '</h4>',
                        '<span class="download">下载</span>',
                    '</a>',
               ' </li>'
            ].join(''));       
        }
        Base.get('guess-list').innerHTML = html.join('');
        addGuessListener();
    });
})();


//详情、评测、攻略tab控制
(function(){
    
    var tabView, tabs = [], containers = [],
        relatedNode = Base.get('strategy-related');
    
    Observer.add(Observer.APP_INFO, function(type, info){
        if (info['EVALUATEPAGE']){//评测
            Base.get('tab-review').className = 'is-show';
            tabs.push(Base.get('tab-review'));
            containers.push(Base.get('app-review'));
        }
        if (info['GAME_GUIDE'] && info['GAME_GUIDE'].length > 0){//攻略
            Base.get('tab-strategy').className = 'is-show';
            tabs.push(Base.get('tab-strategy'));
            containers.push(Base.get('app-strategy'));
        }
        if (info['DETAILINFORURL']){//详情
            Base.get('tab-detail').className = 'is-show';
            tabs.push(Base.get('tab-detail'));
            containers.push(Base.get('app-detail'));
        }
        tabs[0].className += ' active';
        containers[0].className += ' active';
        tabView = new Component.Tab(tabs, containers, 'active', function(index){
            Global.displayToggleBtn();
            if (tabs[index].id == 'tab-strategy'){
                relatedNode.style.display = 'block';
            } else {
                relatedNode.style.display = 'none';
            }
        });
    });
    
})();

//攻略处理
(function(){
    
    Observer.add(Observer.APP_INFO, function(type, info){
        if (info['GAME_GUIDE'] && info['GAME_GUIDE'].length > 0){
            showStrategyList(info['GAME_GUIDE']);
            IO.getGameGuide(info['GAME_GUIDE'][0]['URL']);
        }
    });
    
    Observer.add(Observer.GAME_GUIDE, function(type, info){
        Base.get('app-strategy-content').innerHTML = info;
        Global.checkImgLoaded(Base.get('app-strategy-content'));
    });
    
    //展示攻略列表
    function showStrategyList(list){
        var html = [], i, len = list.length;
        for (i=0; i<len; i++){
            html.push('<li><a href="#" title="' + list[i]['TITLE'] + '" data-url="' + list[i]['URL'] + '">' + list[i]['TITLE'] + '</a></li>');
        }
        Base.get('app-strategy-list').innerHTML = html.join('');
        Base.get('app-strategy-list').getElementsByTagName('a')[0].className = 'current';
        addEventListener();
    }
    
    //移除所有current样式
    function removeCurrentClass(){
        var nodes = Base.get('app-strategy-list').getElementsByTagName('a'),
            i, len = nodes.length;
        for (i=0; i<len; i++){
            nodes[i].className = '';
        }
    }
    
    //增加对列表的事件侦听
    function addEventListener(){
        var nodes = Base.get('app-strategy-list').getElementsByTagName('a'),
            i, len = nodes.length,targetNode;
        for (i=0; i<len; i++){
            nodes[i];
            Base.addEvent(nodes[i], 'click', function(evt){
                evt = evt || window.event;
                Base.preventDefault(evt);
                targetNode = evt.srcElement || this;
                IO.getGameGuide(targetNode.getAttribute('data-url'));
                removeCurrentClass();
                this.className = 'current';
            });
        }
    }
})();

//展开隐藏应用信息
(function(){
    var infoCont = Base.get('info-fold-cont'),
        btn = Base.get('btn-toggle');
    Base.addEvent(btn, 'click', function(evt){
        if (infoCont.className == 'info-fold'){
            infoCont.className = 'info-unfolded';
            btn.innerHTML = '↑ 收起';
        } else {
            infoCont.className = 'info-fold';
            btn.innerHTML = '↓ 查看完整内容';
        }
    });
    //处理评测、攻略、详情中的超链接--事件委托
    Base.addEvent(infoCont, 'click', function(evt){
    	evt = evt || window.event;
	    Base.preventDefault(evt);
	    var node = evt.target || evt.srcElement,href;
	    if (node.nodeName.toLowerCase() == 'a'){
	    	href = node.getAttribute('href');
	        if(href && href.toLowerCase().search('https?:\/\/')==0){//如果是http或者https协议开头才能跳转
	        	IO.goLink(href);
	        }
	    }
    });
})();

//应用标签处理
(function(){
    
    function addTagListener(){
        var nodes = Base.get('app-tags').getElementsByTagName('a'),
            i, len = nodes.length;
        for (i=0; i<len; i++){
            nodes[i];
            Base.addEvent(nodes[i], 'click', responseAction);
        }
    }
    
    function responseAction(evt){
        evt = evt || window.event;
        Base.preventDefault(evt);
        var node = evt.target || evt.srcElement, type, value,name;
        if (node.nodeName.toLowerCase() != 'a'){
            node = node.parentNode;
        }
        type = parseInt(node.getAttribute('data-type')),
        value = node.getAttribute('data-value');
        name = node.getAttribute('data-name');
        switch (type){
            case 1:
                //外链
                IO.goLink(value);
                break;
            case 2:
                //专题
                IO.openTopic(value);
                break;
            case 3:
                //搜索
                IO.search(name);
                break;
        }
    }
    
    Observer.add(Observer.APP_INFO, function(type, info){
        if (!info['TAGS'] || info['TAGS'].length == 0){
            return;
        }
        var html = [], i, len, tags = info['TAGS'];
        len = tags.length;
        for (i=0; i<len; i++){
            html.push('<a href="#" data-value="' + tags[i]['TAG_VALUE'] + '" data-type="' + tags[i]['TAG_TYPE'] +'" data-name="'+tags[i]['TAG_NAME'] + '"><span>' + tags[i]['TAG_NAME'] + '</span></a>');
        }
        Base.get('app-tags').innerHTML = html.join('');
        addTagListener();
    });
    
})();

//下载按钮状态变更
(function(){
    
    var STATE_DOWNLOAD = 0,
        STATE_DOWNLOADING = 1,
        STATE_EXIST = 2,
        STATE_UPDATE = 3,
        STATE_NONE = 4;
    
    var btnState = Base.get('btn-state'),
        btnTopState = Base.get('btn-top-state'),
        state;
        
    Observer.add(Observer.APP_STATE_CHANGE, function(type, data){
        state = formatState(data);
        switch(state){
            case STATE_DOWNLOAD:
                btnState.className = 'download';
                btnTopState.className = 'download';
                break;
            case STATE_UPDATE:
                btnState.className = 'can-update';
                btnTopState.className = 'can-update';
                break;
            case STATE_DOWNLOADING:
                btnState.className = 'downloading';
                btnTopState.className = 'downloading';
                break;
            case STATE_EXIST:
                btnState.className = 'installed';
                btnTopState.className = 'installed';
                break;
        }
        btnState.onclick = clickAction;
        btnTopState.onclick = clickAction;
    });
    
    function clickAction(evt){
        evt = evt || window.event;
        Base.preventDefault(evt);
        switch(state){
            case STATE_DOWNLOAD:
                IO.download();
                break;
            case STATE_UPDATE:
                IO.update();
                break;
            case STATE_DOWNLOADING:
            case STATE_EXIST:
            default:
                break;
        }
    }
    
    function formatState(str){
        var state = STATE_NONE;
        switch(str) {
            case 'E_IPASTATE_NODOWNLOAD':
            case 'E_IPASTATE_DOWNLOADSTOP':
            case 'E_IPASTATE_DOWNLOADERROR': 
                state = STATE_DOWNLOAD;
                break;
            case 'E_IPASTATE_DOWNLOADING':
            case 'E_IPASTATE_DOWNLOADWAIT':
                state = STATE_DOWNLOADING;
                break;
            case 'E_IPASTATE_NOINSTALL':
            case 'E_IPASTATE_INSTALLED':
            case 'E_IPASTATE_INSTALLING':
            case 'E_IPASTATE_WAITINSTALL':
            case 'E_IPASTATE_INSTALLERROR':
            case 'E_IPASTATE_DEVIPANEEDUPDATE':
            case 'E_IPASTATE_DEVCANNOTINSTALL':
                state = STATE_EXIST;
                break;
            case 'E_IPASTATE_LOCALNEEDUPDATE':
            case 'E_IPASTATE_UPDATE': 
                state = STATE_UPDATE;
                break;
        }
        return state;
    }
    
})();


//活动信息处理
(function(){
    var countDown = Base.get('gift-count-down'),
        countDownInterval,gift,server_time;
    Observer.add(Observer.APP_INFO, function(type, info){
    	if (!info['GIFT'] || info['GIFT'].length == 0){
            return;
        }
        var endTime;
        gift = info['GIFT'][0],server_time = info['SERVER_TIME']*1000;
        if (!gift){
            return;
        }
        var gift_end_time = gift['GIFT_END_TIME']*1000;
        Base.get('gift').style.display = '';
        endTime = gift_end_time;
        Base.get('gift-title').innerHTML = gift['GIFT_TITLE'];
        Base.get('gift-intro').innerHTML = gift['GIFT_INTRO'];
        Base.get('gift-end-time').innerHTML = new Date(gift_end_time).toLocaleDateString();
        Base.get('gift-use-intro').innerHTML = gift['GIFT_USE_INTRO'];
        Base.get('gift-link').className = 'active';
        window.clearInterval(countDownInterval);
        showCountDown(endTime);
        countDownInterval = window.setInterval(function(){
            showCountDown(endTime);
        }, 60000);
        //Base.get('gift-count-down').innerHTML = endTime;
        Base.addEvent(Base.get('gift-link'), 'click', handler);
    });
    
    function showCountDown(endTime){
        var nowTime = server_time,
        //var nowTime = new Date().getTime(),
            diff, diffDay, diffHour, diffMinute;
        diff = (endTime - nowTime);
        if(diff<=0){
        	Base.get('gift-count-down').innerHTML = '改活动已结束';
        	//Base.removeEvent(Base.get('gift-link'), 'click',handler);
        	Base.get('gift-link').className = 'negative';
        	window.clearInterval(countDownInterval);
        }else{
        	diffDay = parseInt(diff/3600000/24);
	        diffHour = parseInt(diff%(3600000*24)/3600000);
	        diffMinute = parseInt(diff%3600000/60000);
	        countDown.innerHTML = '距离结束<em>' + diffDay + '</em>天<em>' + diffHour + '</em>小时<em>' + diffMinute + '</em>分';
        }
        
    };
    //点击礼包进入论坛
    var handler = function(evt){
    	evt = evt || window.event;
        Base.preventDefault(evt);
        if(Base.get('gift-link').className=='active'&&gift['GIFT_LOCATION']){
        	IO.goLink(gift['GIFT_LOCATION']);
        }
    };
    
})();

//通知更新处理
(function(){
    var btnNotice = Base.get('btn-notice-update');
    Observer.add(Observer.APP_UPDATE_NOTICE, function(type, status,appid){
        switch (parseInt(status)){
            //不可通知更新
            case 0:
                btnNotice.className = 'updated';
                break;
                
            //可通知更新
            case 1:
                btnNotice.className = 'update';
                Base.addEvent(btnNotice, 'click', function(evt){
                    evt = evt || window.event;
                    Base.preventDefault(evt);
                    IO.noticeUpdate(appid);
                    btnNotice.className = 'updated';
                });
                break;
        }
    }); 
    
})();

//顶部操作条控制
(function(){
    var topBanner = Base.get('top-banner'),
        outter = Base.get('dashboard-outter');
    outter.onscroll = function(){
        if (topBanner.style.display == 'none' && outter.scrollTop >= 540){
            topBanner.style.display = 'block';
            topBanner.style.zIndex="2";
        } else if (outter.scrollTop < 540){
            topBanner.style.display = 'none';
            topBanner.style.zIndex="0";
        }
    };
})();


//畅言评论处理
(function(){
    
    var hasVisible = false,
        appId,
        nodes = {
            outter: Base.get('dashboard-outter'),
            commend: Base.get('comment-con')
        };
    
    Observer.add(Observer.APP_INFO, function(type, info){
        //显示评论控制
        if (!parseInt(info['COMMENT_ENABLE'])){
        	//隐藏好评差评按钮
        	Base.get('good-btn').style.display = 'none';
        	Base.get('bad-btn').style.display = 'none';
            return;
        }
        Base.get('comment-count').style.display = '';
        appId = 'shcy_' + info['APPID'].substr(0, 58);
        //Base.addEvent(nodes.outter, 'scroll', checkCommentVisible);
        checkCommentVisible();
    });
    
    Observer.add(Observer.APP_COMMENT_INFO, function(type, info){
        if (!parseInt(info['cmt_sum'])){
            Base.get('comment-link').innerHTML = '暂无评论';
        } else {
            Base.get('comment-link').innerHTML = Base.formatNumber(info['cmt_sum']);
        }
    });
    
    function checkCommentVisible(){
        /**
        if (hasVisible){
            Base.removeEvent(nodes.outter, 'scroll', checkCommentVisible);
            return;
        }
        if (nodes.outter.scrollTop + 620 > Base.getOffsetTop(nodes.commend) ){
            return;
        }
        */
        hasVisible = true;
        window._config = {'sUrl' : ' '};
        Base.get('SOHUCS').setAttribute('sid', appId);
        initChangyan();
    }
    
    function initChangyan(){
        var appid = IO.CY_APPID,
            conf = IO.CY_CONF,
            doc = document,
        s = doc.createElement('script'),
        h = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement;
        s.type = 'text/javascript';
        s.charset = 'utf-8';
        s.src =  'http://assets.changyan.sohu.com/upload/changyan.js?conf='+ conf +'&appid=' + appid;
        h.insertBefore(s,h.firstChild);
        window.SCS_NO_IFRAME = true;
    }
})();
/**
 * 通知客户端js加载完毕 
 */
(function(){
    IO.pageReady();
})();

//修改畅言链接
(function(){
	var timer;

	function changeCYLink(){
		if(document.getElementById('powerby_sohu')&&document.getElementById('powerby_sohu').getElementsByTagName('div')[0]
			&&document.getElementById('powerby_sohu').getElementsByTagName('div')[0].getElementsByTagName('div')[0]){
			clearInterval(timer);
			var changyan_link = document.getElementById('powerby_sohu').getElementsByTagName('div')[0].getElementsByTagName('div')[0];
			changyan_link.innerHTML = '<span>本评论服务由《畅言》提供技术支持 changyan.sohu.com</span>';
		}
	}
	
	window.onload = function(){
		timer = setInterval(function(){
				changeCYLink();
		},500);
	}
})();
