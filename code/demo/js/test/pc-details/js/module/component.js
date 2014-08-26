(function(){
/**
	 * 滚动条 - 方法：init初始化，show显示滚动条，hide隐藏滚动条，moveTo(Number)移动指定位置
	 * @param wrap 内容包裹框
	 * @param cont 内容框
	 * @param scrl 滚动条包裹框
	 * @param scrlBar 滚动条
	 */
	var ScrollBar = function(wrap, cont, scrl, scrlBar) {
	    // 滚动条自适应高度
	    // scrlBar.style.height = Math.round(scrl.clientHeight * wrap.clientHeight / cont.clientHeight) + 'px';
	    this.wrap = wrap;
	    this.cont = cont;
	    this.scrl = scrl;
	    this.scrlBar = scrlBar;
	    // 获取内容区移动范围和滚动条移动范围
	    this.contMoveDist = 0;
	    this.scrlMoveDist = 0;
	    // this.canDrag = false; // 当前是否可以拖拽
        this.currX = 0; // 当前鼠标相对于滚动条的位置
        // this.moveRatio = contMoveDist / scrlMoveDist; // 移动比例
        this.leftDist = 0; // 滚动条距离左边的距离
	};
	ScrollBar.prototype = {
		initProperties : function() {
			this.wrap.scrollLeft = 0;
	    	this.scrlBar.style.left = 0;
	    	this.contMoveDist = this.cont.offsetWidth - this.wrap.offsetWidth;
	    	this.scrlMoveDist = this.scrl.offsetWidth - this.scrlBar.offsetWidth;
	    	this.leftDist = Base.getOffsetLeft(this.scrl);
	    	if(this.scrl.style.visibility == 'hidden' || Base.getStyle(this.scrl, 'visibility') == 'hidden') {
		    	this.scrl.style.display = 'none';
		    	this.scrl.style.visibility = 'visible';
		    }
		},
		initEvents : function() {
			Base.addEvent(this.scrlBar, 'mousedown', Base.bind(this, 'mousedown', 'start'));
			Base.addEvent(this.scrl, 'click', Base.bind(this, 'click', 'clicked'));
		},
		init : function() {
			this.initProperties();
		    this.initEvents();
		},
		reinit : function() {
			if(this.scrl.style.display == 'none') {
		        this.scrl.style.visibility = 'hidden';
		    	this.scrl.style.display = 'block';
			}
			this.scrlBar.style.width = Math.round(704*this.scrl.offsetWidth/this.cont.offsetWidth)+'px';
            this.initProperties();
	    },
		start : function(e) {
			e = e || window.event;
			this.currX = e.clientX- Base.getOffsetLeft(this.scrlBar);
			Base.addEvent(document, 'mouseup', Base.bind(this, 'mouseup', 'stop'));
			Base.addEvent(document, 'mousemove', Base.bind(this, 'mousemove', 'drag'));
			document.onselectstart = function() {
	            return false;
	        };
	        return false;
		},
		stop : function() {
			Base.removeEvent(document, 'mousemove', Base.unbind(this, 'mousemove', 'drag'));
			Base.removeEvent(document, 'mouseup', Base.unbind(this, 'mouseup', 'stop'));
			document.onselectstart = null;
		},
		drag : function(e) {
			e = e || window.event;
            var barLeft = Math.max(Math.min((e.clientX - this.currX - this.leftDist), this.scrlMoveDist), 0);
            var wrapLeft = Math.min(Math.max(Math.round(barLeft * this.contMoveDist / this.scrlMoveDist), 0), this.contMoveDist);
            this.scrlBar.style.left = barLeft + 'px';
            this.wrap.scrollLeft = wrapLeft;
		},
		clicked : function(e) {
			e = e || window.event;
	        var target = e.target || e.srcElement;
	        if(target != this.scrlBar && target.parentNode != this.scrlBar) {
	            var clickX = e.clientX - Base.getOffsetLeft(this.scrl),
	            	scrlBarLeft = parseInt(this.scrlBar.style.left),
	            	barLeft;
	            if(clickX <= scrlBarLeft) {
	                barLeft = clickX;
	            }else if(clickX > (scrlBarLeft + this.scrlBar.offsetWidth)) {
	                barLeft = clickX - this.scrlBar.offsetWidth; // parseInt(this.scrlBar.style.top) + clickY - parseInt(this.scrlBar.style.top) - this.scrlBar.offsetHeight;
	            }else{
	            	barLeft = clickX - this.scrlBar.offsetWidth;
	            }
            	this.scrlBar.style.left = barLeft + 'px';
            	this.wrap.scrollLeft = Math.floor(barLeft * this.contMoveDist / this.scrlMoveDist);
	        }
		},
	 	contWheel : function(e) {
	        e = e || window.event;
	        Base.preventDefault(e);
	        this.scrlBar.style.left = Math.min(Math.max(parseInt(this.scrlBar.style.left) + (0 - (e.wheelDelta / 120) * 10), 0), this.scrlMoveDist) + 'px';
	        this.wrap.scrollLeft =  Math.min(Math.max(this.wrap.scrollLeft + (0 - (e.wheelDelta / 120) * this.contMoveDist / this.scrlMoveDist * 10), 0), this.contMoveDist);
	    },
		show : function() {
	        Base.addEvent(this.cont, 'mousewheel', Base.bind(this, 'mousewheel', 'contWheel'));
	        this.scrl.style.display = 'block';
	    },
	    hide : function() {
	        Base.removeEvent(this.cont, 'mousewheel', Base.unbind(this, 'mousewheel', 'contWheel'));
	        this.scrl.style.display = 'none';
	    },
	    moveTo : function(wrapLeft) {
	        var scrollLeft = this.contMoveDist < wrapLeft ? this.contMoveDist : wrapLeft;
	        this.wrap.scrollLeft = scrollLeft;
	        this.scrlBar.style.left = (scrollLeft / this.contMoveDist * this.scrlMoveDist) + 'px';
	    }
	};

    /**
     * 幻灯 - 方法：init初始化，resetTarget(element)重置幻灯移动的元素
     * @param container 实际被移动的对象
     * @param height 幻灯高度
     * @param controls 控制按钮组（两个按钮）
     */
    var Slide = function(cfg) {
        this.container = cfg['container'];
        this.scrollBar = cfg['scrollBar'];
        this.width = cfg['width'];
        this.height = cfg['height'];
        
        this.shadowLeft = cfg['controls'][0];//左遮挡
        this.shadowRight = cfg['controls'][1];//右遮挡
        
        this.gap = cfg['gap'] || 0;
        
        this.loaded = false;
        
        //幻灯数量
        this.length = 0;
        
        //已加载的幻灯数量
        this.loadedLength = 0;
        
        //各图片的占位宽度
        this.offsetWidths = [];
        
        //各滑动动画的left值
        this.slideLefts = [0];
        
        //当前显示的是第几屏幻灯，对应 slideLeft 数组的索引
        this.slideIndex = 0;

        this.totalCount = 0;
        this.tempCount = 1;
    };
    Slide.prototype = {
        init : function() {
            var images = this.images = this.container.getElementsByTagName('img'),
                i, len = this.length, containerWidth = 0, slideLeft = this.slideLefts[0], tempWidth = 0,
                offsetWidth;
            for (i=0; i<len; i++){
                offsetWidth = images[i].offsetWidth+this.gap;
                if (offsetWidth > this.width){
                    images[i].width = this.width;
                    offsetWidth = images[i].offsetWidth+this.gap;
                }
                offsetWidth = parseInt(offsetWidth);
                this.offsetWidths.push(offsetWidth);
                containerWidth += (offsetWidth);
                if (tempWidth + offsetWidth > this.width){
                    slideLeft += tempWidth;
                    this.slideLefts.push(-slideLeft);
                    tempWidth = 0;
                }
                tempWidth += offsetWidth;
            }
            this.container.style.width = containerWidth + 'px';
            if(this.container.parentNode.className.indexOf('active')!=-1){//当前活动tab
            	if (containerWidth > this.width){
                	this.shadowRight.style.display = '';
                	this.scrollBar.init();
                	this.scrollBar.show();
                	this.scrollBar.reinit();
	            } else {
	                this.shadowRight.style.display = 'none';
	            }
            }else{
            	this.shadowLeft.style.display = 'none';
            	this.shadowRight.style.display = 'none';
            	if (containerWidth > this.width){//给其他tab重算滚动条
            		this.scrollBar.init();
            		this.scrollBar.show();//如果没出发show事件，ie7下面直接调用hide事件报错
            		this.scrollBar.reinit();
            		this.scrollBar.hide();
            	}
            }
        },
        
        render: function(list){
            var html = [], list = list || [], i, len=list.length, images,
                self = this,img;
            this.length = len;
            for(i=0; i<len; i++){
                html.push('<img src=" ' + list[i] + '" />');
            }
            this.container.innerHTML = html.join('');
            images = this.container.getElementsByTagName('img');
            for(i=0; i<len; i++){
            	img = new Image();
            	img.src = images[i].src;
                if (img.width){
                    this.loadedLength++;
                } else {
                    images[i].onload = function(){
	                    self.loadedLength++;
	                    self.checkLoaded();
	                };
	                images[i].onerror = function(){
	                    this.src = 'image/default.png';
	                    this.width = '200';
	                    self.loadedLength++;
	                    self.checkLoaded();
	                };
                }
            }
            self.checkLoaded();
        },
        
        checkLoaded: function(){
            if (this.loaded){
                return;
            }
            if (this.length == this.loadedLength){
                this.loaded = true;
                this.init();
            }
        },
        
        addEvents: function(){
            var self = this,parent = this.container.parentNode,width=this.width;
            var imgs = parent.getElementsByTagName('div')[0],
            		shadowLeft = parent.previousElementSibling || parent.previousSibling,
            		shadowRight = parent.nextElementSibling || parent.nextSibling;
            //外层容器加滚动事件
            parent.onscroll = function(evt){
            	if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g,"")=="MSIE7.0"){
            		if(parent.scrollLeft>=15){//左遮挡显示
	            		shadowLeft.style.display = '';
	            	}else{
	            		shadowLeft.style.display = 'none';
	            	}
	            	if(imgs.style.pixelWidth-parent.scrollLeft-width>5){//右遮挡
	            		shadowRight.style.display = '';
	            	}else{
	            		shadowRight.style.display = 'none';
	            	}
            	}else{
            		if(parent.scrollLeft>0){//左遮挡显示
	            		shadowLeft.style.display = '';
	            	}else{
	            		shadowLeft.style.display = 'none';
	            	}
	            	if(imgs.style.pixelWidth-parent.scrollLeft-width>35){//右遮挡
	            		shadowRight.style.display = '';
	            	}else{
	            		shadowRight.style.display = 'none';
	            	}
            	}
            }
          }
    };

    /**
     * 选项卡
     * @param ctrls 选项卡的控制按钮（包含任意个元素的数组）
     * @param containers 控制按钮对应的显示框体
     * @param scrolls 对应滚动条
     * @param clName 控制按钮使用的CSS类名
     * @param callback 每次切换后的回调函数
     */
    var Tab = function(ctrls, containers, clName, callback) {
        // 缓存当前项
        var currentCtrl = ctrls[0], currentContainer = containers[0];
        for(var i = 0, ilen = ctrls.length; i < ilen; i++) {
            if(ctrls[i].className && ctrls[i].className.indexOf(clName) >= 0) {
                currentCtrl = ctrls[i];
                currentContainer = containers[i];
            }
        }
        // 切换操作
        for(var j = 0, jlen = ctrls.length; j < jlen; j++) {
            (function(index){
                Base.addEvent(ctrls[index], 'click', function(evt) {
                    evt = evt || window.event;
                    Base.preventDefault(evt);
                    var reg = new RegExp("\\s*" + clName);
                    currentCtrl.className = currentCtrl.className.replace(reg, '');
                    ctrls[index].className += ' ' + clName;
                    currentCtrl = ctrls[index];
                    currentContainer.className = currentContainer.className.replace(reg, '');
                    containers[index].className += ' ' + clName;
                    currentContainer = containers[index];
                    callback && callback(index);
                });
            })(j);
        }
    };

    window.Component = {
    	ScrollBar :ScrollBar,
        Slide : Slide,
        Tab : Tab
    };

})();