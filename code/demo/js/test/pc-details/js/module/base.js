(function(){

    /**
     * 部分基础方法 
     */
    window.Base = {
        get : function(id){
            return document.getElementById(id);
        },
        
        getScript : function(url, callback, errorCallback){
             var script = document.createElement("script"),
             head = document.head || document.getElementsByTagName("head")[0],callback;
             script.src = url;
             script.type = "text/javascript";
             script.charset = "utf-8";
             script.async = "async";
             script.onload = script.onreadystatechange = function(e){
                if (!script.readyState || /loaded|complete/.test(script.readyState) ) {
                    script.onload = script.onreadystatechange = null;
                    if (head && script && script.parentNode) {
                        head.removeChild(script);
                    }
                    script = undefined;
                    callback && callback(e);
                }
             };
             //错误处理函数
             script.onerror = function(evt){
             	if (head && script &&script.parentNode) {
                    head.removeChild(script);
                }
                script = undefined;
                errorCallback && errorCallback(evt);
             };
             head.appendChild(script);
        },
        
        //移除head内所有script标签(head内标签为获取数据标签)
        clearScript: function(){
            var head = document.getElementsByTagName('head')[0],
                scripts = head.getElementsByTagName('script'),
                i, len = scripts.length;
            for (i=0; i<len; i++){
                head.removeChild(scripts[i]);
            } 
        },
        
        //截取字符串长度(汉字占2位),超过长度加省略号
        ellipsis: function(str, max){
            var len = str.length, list = str.split(''), i, t = 0;
            for (i=0; i<len; i++){
                t++;
                if (/[^\x00-\x80]/g.test(list[i])){
                    t++;
                }
                if (t>=max){
                    return str.slice(0, i)+'..';
                }
            }
            
            return str;
        },
        
        //达到1万的数字以万为单位
        formatNumber: function(number){
            var num = number/10000;
            if (num > 10){
                num = Math.floor(num) + '万';
            } else if (num > 1){
                num = Math.floor(num*10)/10 + '万';
            } else {
                num = number;
            }
            return num;
        },
        
        addEvent : function(ele, type, handler) {
            if(document.addEventListener) {
                ele.addEventListener(type, handler, false);
            }else if(document.attachEvent) {
                ele.attachEvent('on' + type, handler);
            }else {
                ele['on' + type] = handler;
            }
        },

        removeEvent : function(ele, type, handler) {
            if(document.removeEventListener) {
                ele.removeEventListener(type, handler, false);
            }else if(document.detachEvent) {
                ele.detachEvent('on' + type, handler);
            }else {
                ele['on' + type] = null;
            }
        },

        preventDefault: function(evt){
            if (evt.preventDefault){
                evt.preventDefault();
            } else {
                evt.returnValue = false; 
            }
        },
		
		stopEventBubble: function(evt){
	        if (evt.stopPropagation){
	            evt.stopPropagation();    
	        }else{
	            evt.cancelBubble=true;
	        }
		},
		
        getStyle : function(obj, attr) {
            return obj.currentStyle ? obj.currentStyle[attr] : document.defaultView.getComputedStyle(obj,null)[attr];
        },

        getCookie: function(name){
            var rep = new RegExp(name + '=([^;]*)?', 'i');
            if (rep.test(document.cookie)) return RegExp.$1;
            else            
                return null;
        },
        
        delCookie: function(name){
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            document.cookie = name + '=;expires=' + exp.toGMTString();
        },
        
        setCookie: function(name, value, hours){
            hours = hours || 24;
            try {
                var exp = new Date();
                exp.setTime(exp.getTime() + hours * 60 * 60 * 1000);
                document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + exp.toGMTString() + ';path=/';
                return true;
            } catch (e) {
                return false;
            }
        },
        setTodayCookie : function(name, value) {
            try {
                var exp = new Date();
                exp.setHours(23);
                exp.setMinutes(59);
                exp.setSeconds(59);
                document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + exp.toGMTString() + ';path=/';
                return true;
            } catch (e) {
                return false;
            }
        },
        /**
         * 动画
         * @param ele 需要进行动画的元素
         * @param property 需要进行的动画，对象，格式{name:驼峰式,value:带不带px皆可}
         * @param time 动画时间
         * @param callback 动画完成后的执行函数
         */
        animate : function(ele, property, time, callback) {
            var frameCost, currFrame, totalFrame, baseProperty, totalProperty, timer;
         
            var getStyle = Base.getStyle;
            var quintEaseOut = function(t,b,c,d) {
                return c*((t=t/d-1)*t*t*t*t + 1) + b;
            };

            frameCost = 20;
            currFrame = 1;
            totalFrame = time / frameCost;
            baseProperty = parseInt(getStyle(ele, property.name));
            totalProperty = parseFloat(property.value) - baseProperty;
            
            timer = setInterval(function() {
                ele.style[property.name] = quintEaseOut(currFrame, baseProperty, totalProperty, totalFrame) + 'px';
                currFrame += 1;
                if(currFrame == totalFrame || currFrame > totalFrame) {
                    clearInterval(timer);
                    callback && callback();
                }
            }, frameCost);
        },

        // 获取元素相对于文档的Y轴位置
        getOffsetTop : function(element) {
            var top = element.offsetTop;
            while(element.offsetParent) {
                element = element.offsetParent;
                top += element.offsetTop;
            }
            return top;
        },
        // 获取元素相对于文档的X轴位置
        getOffsetLeft : function(element) {
            var left = element.offsetLeft;
            while(element.offsetParent) {
                element = element.offsetParent;
                left += element.offsetLeft;
            }
            return left;
        },
        /** 
         * 配合事件绑定使用，bind可改变绑定事件的this为obj
         * @param obj 被改变成的作用域
         * @param type 事件类型
         * @param fn 用于绑定的方法（必须是obj的方法）
         */
        bind : function(obj, type, fn) {
            obj[type] = obj[type] || {};
            obj[type][fn] = obj[type][fn] || function() {
                obj[fn].apply(obj, arguments);
            };
            return obj[type][fn];
        },

        // 配合事件解绑使用，返回绑定的事件
        unbind : function(obj, type, fn) {
            obj[type] = obj[type] || {};
            if(obj[type][fn]) {
                return obj[type][fn];
            }
        }
        
    };

})();