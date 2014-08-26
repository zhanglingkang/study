(function(){
    
    var version, appid,
        isGood = false, isBad = false,
        hasVisible = false,
        nodes = {
            good : Base.get('good-btn'),
            bad : Base.get('bad-btn'),
            ratio : Base.get('good-ratio')
        };
        
        
    //检测Cookie中是否存储了已评价信息
    function checkEvaluated(){
        var str = appid+'__'+version,
            goodList = Base.getCookie('_js_good_evaluate'),
            badList = Base.getCookie('_js_bad_evalute');
        if (goodList && goodList.indexOf(str) >= 0){
            isGood = true;
        }
        if (badList && badList.indexOf(str) >= 0){
            isBad = true;
        }
    }
    
    //添加已评价记录
    function addEvaluated(evaluate){
        var str = appid+'__'+version,
            key, list;
            
        if (evaluate){      //差评
            key = '_js_bad_evalute';
            isBad = true;
        } else {        //好评
            key = '_js_good_evaluate';
            isGood = true;
        }        
        list = Base.getCookie(key);
        list = list ? decodeURIComponent(list).split('|') : [];
        if (list.length >= 50){
            list.length = 49;
        }
        list.unshift(str);
        Base.setTodayCookie(key, list.join('|'));
    }

    //显示评价信息
    function showEvaluate(data){
    	var evaluate,good=0,bad=0;
    	if(data){
    		evaluate = eval('(' + data + ')');
    		good = evaluate.GOOD_NUM?parseInt(evaluate.GOOD_NUM):0;
        	bad = evaluate.BAD_NUM?parseInt(evaluate.BAD_NUM):0;
    	}
        if (!isGood && !isBad){
            setActive();
        } else {
            setForbidden();
        }
        nodes.good.evaluate = good;
        nodes.bad.evaluate = bad;
        // nodes.ratio.ratio = data.RATIO;
        showNumber(good, bad);
    }
    
    function showNumber(good, bad){
        var ratio = (good+bad)==0?0:Math.round(good/(good+bad)*10000)/100;
        nodes.good.innerHTML = good<=9999?good:'9999+';
        nodes.bad.innerHTML = bad<=9999?bad:'9999+';
        if ((good+bad)>99){
            nodes.ratio.className = '';
            nodes.ratio.innerHTML = ratio+'%';
            nodes.ratio.title = '';
        } else {
            nodes.ratio.className = 'lower';
            nodes.ratio.innerHTML = '暂无';
            nodes.ratio.title = '点评次数过低';
        }
    }
    
    //提交评价
    function putEvaluate(evaluate){
        if (isGood || isBad || !appid || !version || !hasVisible){
            return;
        }
        nodes.evaluate = evaluate;
        var good = nodes.good.evaluate;
        var bad = nodes.bad.evaluate;
        addEvaluated(nodes.evaluate);
        setForbidden();
        if (nodes.evaluate){
            bad++;
        } else {
            good++;
        }
        showNumber(good, bad);
        // 根据产品要求END
        IO.postPraise(appid, version, evaluate);
    }

    function _addEvaluate(tid, rescode, res) {
         //var data, match, good, bad;
         //if(res.indexOf('__interface_evaluate_result') !== -1 && res.indexOf('RESULT') !== -1) {
             //match = /RESULT"\s*:\s*(-?[02])/.exec(res);
             //data = !!match ? match[1] : null;
         //}
         //if(data == '0' || data == '-2') { 
         	 //data != null && (data == '0' || data == '-2')
             //good = nodes.good.evaluate;
             //bad = nodes.bad.evaluate;
             //addEvaluated(nodes.evaluate);
             //setForbidden();
             //if (nodes.evaluate){
                 //bad++;
             //} else {
                 //good++;
             //}
             //showNumber(good, bad);
             //getEvaluate();
         //}
    }
    
    
    //将按钮设置为可点击样式
    function setActive(){
        nodes.good.className = 'good';
        nodes.bad.className = 'bad';
    }
    
    //将按钮置灰
    function setForbidden(){
        if(isGood) {
            nodes.good.className = 'good clicked';
            nodes.bad.className = 'bad disabled';
        }
        if(isBad) {
            nodes.good.className = 'good disabled';
            nodes.bad.className = 'bad clicked';
        }
    }
    
    function addEvents(){
        Base.addEvent(nodes.good, 'click', function(evt){
            nodes.good.blur();
            evt = evt || window.event;
            Base.preventDefault(evt);
            putEvaluate(0);
        });
        Base.addEvent(nodes.bad, 'click', function(evt){
            nodes.bad.blur();
            evt = evt || window.event;
            Base.preventDefault(evt);
            putEvaluate(1);
        });
    }
    
    Observer.add(Observer.APP_PRAISE, function(key,data){
        showEvaluate(data);
        hasVisible = true;
    });
        
    Observer.add(Observer.APP_INFO, function(key, data){
        version = data['APPVERSION'];
        appid = data['APPID'];
        var devicesymbol = data['DEVICESYMBOL'];
        nodes = {
            good : Base.get('good-btn'),
            bad : Base.get('bad-btn'),
            ratio : Base.get('good-ratio')
        };
        
        //好评率参数
        var praiseData = '{"appid" :"'+ appid+'","devicesymbol":"'+ devicesymbol+'"}';
        addEvents();
        
        checkEvaluated();

        IO.getPraise(praiseData);
    });
    
    window._addEvaluate = _addEvaluate;
    
})();
