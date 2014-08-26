//消息侦听对象
(function(){

    var _hash = {};
    
    // 回调函数的id，从1递增
    var _cid = 1;
    
    // 注册进来的每个callback都会被增加一个名为"_nx_msg_ckey"的属性，此属性值是回调函数的id（正整数）。类似：callback[_ckey]=2
    var _ckey = '_nx_msg_ckey';
    
    /**
     * 增加listener
     * @param type: 事件（消息）名称
     * @param callback: 当名为type的消息发出后，会被启动的回调函数
     * 此方法解释：给callback附属一个id。把callback缓存到_hash[type]数组里（id当做index、callback当做value）。
     */
    function add(type, callback){
        if (!type || !callback) return;
        
        var cid = callback[_ckey];
        if (!cid) callback[_ckey] = cid = _cid++;
        (_hash[type] = _hash[type] || {})[cid] = callback;
    }
    
    /**
     * 移除listener
     * @param type: 事件（消息）名称
     * @param callback: 当名为type的消息发出后，callback不再被调用
     * 此方法解释：把callback从_hash[type]数组里移除（通过id来移除）。
     */
    function remove(type, callback){
        if (!type || !callback) return;
        
        var cid = callback[_ckey];
        if (!_hash[type] || !cid || !_hash[type][cid]) return;
        
        delete _hash[type][cid];
        for (var i in _hash[type]) return;
        delete _hash[type];
    }
    
    /**
     * 发送消息
     * @param type: 事件（消息）名称
     * @param args: 形参，是用来给消息携带数据的，可以有，可以无，可以是很多个参数。为了方便各种消息的不同需求。
     * 此方法解释：type对应的所有callback会被调用，执行顺序：先add先调用。callback接收到的参数：type，args，例如：send('type1',1,2,3);callback接受的参数是'type1',1,2,3。
     */
    function send(type, args){
        if (!_hash[type]) return;
        var list = [];
        for (var cid in _hash[type]) list.push(cid);
        (function(){
            while (list.length) {
                try {
                    _hash[type][list.shift()].apply(null, arguments);
                } catch (e) {
                    throw e;
                } finally {
                    arguments.callee.apply(null, arguments);
                }
            }
        }).apply(null, arguments);
    }
    
    window.Observer = {
        APP_INFO: 1,
        GUESS_INFO: 2,
        APP_DETAIL: 3,
        APP_EVALUATE: 4,
        APP_STRATEGY: 5, 
        APP_PREVIEW: 6,
        APP_VIDEO_INFO: 7,
        APP_COMMENT_INFO: 8,
        APP_STRATEGY_INFO: 9,
        APP_STATE_CHANGE: 11,
        APP_UPDATE_NOTICE: 12,
        APP_PRAISE: 13,
        GAME_GUIDE: 9,
        add: add,
        remove: remove,
        send: send
    };
    
})();