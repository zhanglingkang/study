(function(){
    
    var debug = true,
        host = 'test.kuaiyong.com',
        compress = 1;
        
    var url, tag;

    if (debug){
        url = 'http://' + host +':8086/' + $config.project +'/' + $config.page + '.js?c=' + compress;
    } else {
        url = 'http://' + host +'/' + $config.project +'/js/min/' + $config.page + '.js';
    }
    tag = '<script type="text/javascript" src="' + url + '" ></script>';
    document.write(tag);
})();