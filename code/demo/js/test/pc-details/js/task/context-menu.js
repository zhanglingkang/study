(function() {

	function createMenu() {
	    try {
	    	// Menu context
	        var menu = document.createElement('div');
	        menu.id = 'menu';

	        // Menu item - select all
	        var selall = document.createElement('div');
	        selall.innerHTML = '全选';
	        selall.onmouseover = function() {
	        	this.className = 'selitem';
	        };
	        selall.onmouseout = function() {
	        	this.className = '';
	        };
	        selall.onclick = function() {
	            document.execCommand('SelectAll');
	            hideMenu();
	        };

	        // Menu item - copy
	        var cpysel = document.createElement('div');
	        cpysel.id = 'copy-select';
	        cpysel.innerHTML = '复制';
	        cpysel.onmouseover = function() {
	        	this.className = 'selitem';
	        };
	        cpysel.onmouseout = function() {
	        	this.className = '';
	    	};
	        
	        menu.appendChild(selall);
	        menu.appendChild(cpysel);
	        document.body.appendChild(menu);

	    }catch(e) {

	    }
	}

	function hideMenu() {
	    var menu = Base.get('menu');
	    if (menu) {
	    	// menu.removeNode(true);
	    	menu.style.display = 'none';
	    }
	}

	function showMenu(event) {
		var menu = Base.get('menu');
	    if (menu) {
	    	event = event || window.event;
	    	var selt = document.selection.createRange().text || '';
	    	var cpysel = Base.get('copy-select');
	    	if (selt.length > 0) {
	    		cpysel.disabled = false;
	        	cpysel.onmousedown = function() {
	        		document.execCommand('Copy');
	        	};
	        }else {
	        	cpysel.disabled = true;
	        }
	    	
	    	var right = document.body.clientWidth - event.clientX;
	        var bottm = document.body.clientHeight - event.clientY;
	        if (right < menu.offsetWidth) {
	        	menu.style.left = document.body.scrollLeft + event.clientX - menu.offsetWidth;
	        }else {
	        	menu.style.left = document.body.scrollLeft + event.clientX;
	        }
	        if (bottm < menu.offsetHeight) {
	        	menu.style.top = document.body.scrollTop + event.clientY - menu.offsetHeight;
	        }else {
	        	menu.style.top = document.body.scrollTop + event.clientY;
	        }

	        menu.style.display = 'block';
	    }
	    return false;
	}

	Base.addEvent(window, 'load', createMenu);
	Base.addEvent(document, 'contextmenu', showMenu);
	Base.addEvent(document, 'click', hideMenu);

})();