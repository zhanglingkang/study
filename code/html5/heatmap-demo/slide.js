require(['socketio', 'utils', 'dataloader', 'underscore', 'odometer', 'firework', 'd3', 'nvd3'],
    function (socketio, utils, dataloader, _, odometer, firework) {


        var URL_LIST_KEY = "urlList"
        var INTERVAL_KEY = "interval"
        var DEFAULT_INTERVAL = 6000
        var URL_LIST_SPLIT = "\n"
        var DEFAULT_URL_LIST = [
            "http://datashow.amap.com/dshow-web/web/r/dashboard/livelocate",
            "http://datashow.amap.com/dshow-web/web/r/dashboard/realtime-heatmap"
        ]
        if (!getUrlList()) {
            setUrlList(DEFAULT_URL_LIST)
        }
        if (!getSlideInterval()) {
            setSlideInterval(DEFAULT_INTERVAL)
        }
        $(".slide-item-list").html(function () {
            return getUrlList().map(function (url, index) {
                var className = index == 0 ? 'current' : ''
                return [
                    '<div class="item ' + className + '">',
                    '<iframe src="' + url + '"></iframe>',
                    '</div>'
                ].join("")
            }).join("")
        })
        $("#url-list-input").val(getUrlList().join("\n"))
        $("#interval-input").val(getSlideInterval())

        function removeAllClass() {
            $(".slide-item-list").find(".active,.prev,.to-right-active,.to-right-prev")
                .removeClass("active").removeClass("prev").removeClass("to-right-active").removeClass("to-right-prev")
        }

        function slideToRight() {
            removeAllClass()
            var $last = $(".slide-item-list .current").removeClass("current").addClass("to-right-prev")
            var $current = $last.prev()
            if ($current.length === 0) {
                $current = $(".slide-item-list .item").eq($(".slide-item-list .item").length - 1)
            }
            $current.addClass("to-right-active").addClass("current")
            clearTimeout(play.timer)
            if (play.timer) {
                play.timer = setTimeout(slideToLeft, getSlideInterval())
            }

        }

        function slideToLeft() {
            removeAllClass()
            var $last = $(".slide-item-list .current").removeClass("current").addClass("prev")
            var $current = $last.next()
            if ($current.length === 0) {
                $current = $(".slide-item-list .item").eq(0)
            }
            $current.addClass("active").addClass("current")
            clearTimeout(play.timer)
            if (play.timer) {
                play.timer = setTimeout(slideToLeft, getSlideInterval())
            }
        }

        var start = _.once(play)

        function play() {
            play.timer = setTimeout(slideToLeft, getSlideInterval())
        }


        function stop() {
            start = _.once(play)
            //clearInterval(play.timer)
            clearTimeout(play.timer)
            play.timer = null
        }

        start()

        $(document).bind('keydown.c', function () {
            $('#myModal').modal('show')
        })
        $(document).bind('keydown.p', function () {
            start()
        })
        $(document).bind('keydown.s', function () {
            stop()
        })
        $(".left.carousel-control").click(slideToRight)
        $(".right.carousel-control").click(slideToLeft)
        $(".save").click(function () {
            _.compose(setUrlList, strToArray)($("#url-list-input").val().trim())
            setSlideInterval($("#interval-input").val().trim())
            location.reload()
        })

        function setSlideInterval(interval) {
            localStorage.setItem(INTERVAL_KEY, interval)
        }

        function getSlideInterval() {
            return +localStorage.getItem(INTERVAL_KEY)
        }

        /**
         *
         * @param {[string]}urlList
         */
        function setUrlList(urlList) {
            localStorage.setItem(URL_LIST_KEY, urlList.join(URL_LIST_SPLIT))
        }

        function getUrlList() {
            return strToArray(localStorage.getItem(URL_LIST_KEY))
        }

        /**
         *
         * @param {string} urlList
         */
        function strToArray(urlList) {
            if (!urlList) {
                return urlList
            }
            return urlList.split(URL_LIST_SPLIT).map(function (url) {
                return url.trim()
            }).filter(function (url) {
                return url
            })
        }


    })
