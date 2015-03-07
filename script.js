var EventUtil = {
	//事件绑定
	addHandler: function(element, type, handler) {
		if (element.addEventListener) {
			element.addEventListener(type, handler, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + type, handler);
		} else {
			element['on' + type] = handler;
		}
	},
	//返回对event对象的引用
	getEvent: function(event) {
		return event ? event : window.event;
	},
	//返回事件的目标
	getTarget: function(event) {
		return event.Target || event.srcElement;
	},
	//取消事件的默认行为
	preventDefault: function(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
	//删除事件
	removehandler: function(element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + type, handler);
		} else {
			element['on' + type] = handler;
		}
	},
	//阻止事件冒泡
	stopPropagation: function(event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}
	}
};

//读取、写入和删除cookie
var CookieUtil = {
	get: function(name) {
		var cookieName = encodeURIComponent(name) + '=',
			cookieStart = document.cookie.indexOf(cookieName),
			cookieValue = null;

		if (cookieStart > -1) {
			var cookieEnd = document.cookie.indexOf(';', cookieStart);
			if (cookieEnd == -1) {
				cookieEnd = document.cookie.length;
			}
			cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
		}
		return cookieValue;
	},

	set: function(name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);

		if(expires instanceof Date) {
			cookieText += "; expires=" + expires.toGMTString();
		}

		if(path) {
			cookieText += "; path=" + path;
		}

		if(domain) {
			cookieText += "; domain=" +domain;
		}

		if(secure) {
			cookieText += "; secure";
		}

		document.cookie = cookieText;
	},

	unset: function(name, path, domain, secure) {
		this.set(name, '', new Date(0), path, domain, secure);
	}
};

EventUtil.addHandler(window, 'load', function(event) {
	var num = parseInt(CookieUtil.get('num'));

	//页面加载完从cookie中取数据添加到页面上
	for(var i = 1; i <= num; i++) {
		var msgboard = document.getElementById('msg-board'),
			name = CookieUtil.get('name' + i),
			msg = CookieUtil.get('msg' + i),
			time = CookieUtil.get('time' + i);
		if(name && msg && time) {
			fnAddnode();
		}	
	}

	var submit = document.getElementById('submit'),
		msgboard = document.getElementById('msg-board');

	EventUtil.addHandler(submit, 'click', fnSubmit); //为submit按钮绑定提交事件
	EventUtil.addHandler(msgboard, 'click', fnDelete); //事件委托，在ol#msg-board上添加删除事件

	//提交信息并写进cookie
	function fnSubmit() {
		name = document.getElementById('name').value,
		msg = document.getElementById('msg').value,
		name_tips = document.getElementById('name-tips'),
		msg_tips = document.getElementById('msg-tips');

		if (!name) {
			name_tips.style.display = 'block';
		} else {
			name_tips.style.display = 'none';
		};
		if (!msg) {
			msg_tips.style.display = 'block';
		} else {
			name_tips.style.display = 'none';
		};

		if (name && msg) {
			name_tips.style.display = 'none';
			msg_tips.style.display = 'none';

			var date = new Date(),
				month = date.getMonth() + 1;
			time = date.getFullYear() + '-' + month + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

			fnAddnode();

			var num = CookieUtil.get('num');

			if(num) {
				CookieUtil.set('num',parseInt(num) + 1);
				num = CookieUtil.get('num');
			} else {
				CookieUtil.set('num','1');
				num = CookieUtil.get('num');
			};

			CookieUtil.set('name' + num,name);
			CookieUtil.set('msg' + num,msg);
			CookieUtil.set('time' + num,time);
			

			document.getElementById('name').value = '';
			document.getElementById('msg').value = '';
		};
	};

	//向列表添加节点
	function fnAddnode() {
		var item_list = document.createElement('li'),
			item_name = document.createElement('span'),
			item_msg = document.createElement('span'),
			item_time = document.createElement('span'),
			item_del = document.createElement('span'),
			node_name = document.createTextNode(name),
			node_msg = document.createTextNode(msg),
			node_time = document.createTextNode(time),
			node_del = document.createTextNode('×');

			item_name.appendChild(node_name);
			item_msg.appendChild(node_msg);
			item_time.appendChild(node_time);
			item_del.appendChild(node_del);

			item_list.setAttribute('class', 'item');
			item_name.setAttribute('class', 'item-name');
			item_msg.setAttribute('class', 'item-msg');
			item_time.setAttribute('class', 'item-time');
			item_del.setAttribute('class', 'item-del');

			var frag = document.createDocumentFragment();
			frag.appendChild(item_name);
			frag.appendChild(item_msg);
			frag.appendChild(item_time);
			frag.appendChild(item_del);
			item_list.appendChild(frag);
			msgboard.appendChild(item_list);
	};

	//删除信息和cookie中对应的数据
	function fnDelete(event) {
		event = EventUtil.getEvent(event);
		var target = EventUtil.getTarget(event);

		if (target.className == 'item-del') {
			var item_list = target.parentNode;
			msgboard.removeChild(item_list);
		}

		var num = parseInt(CookieUtil.get('num')),
			time = target.previousSibling.innerHTML;

		for(var i = 1;i <= num;i++) {
			if(CookieUtil.get('time' + i) == time) {
				CookieUtil.unset('name' + i);
				CookieUtil.unset('msg' + i);
				CookieUtil.unset('time' + i);
			}
		}
	}
});