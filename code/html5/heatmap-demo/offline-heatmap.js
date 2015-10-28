require(['dataloader'], function (dataloader) {
    var SHOW_DAYS = 15
    var fieldNameMap = {
        u_adcode: "a",
        u_datetime: "b",
        u_leafarea: "c",
        u_leafmax_x: "d",
        u_leafmax_y: "e",
        u_leafmin_x: "f",
        u_leafmin_y: "g",
        u_pv: "h",
        u_centerx: "i",
        u_centery: "j",
        u_zoomlevel: "k"

    }
    var map = L.map('map', {
        minZoom: 3,
        maxZoom: 18,
        zoomControl: false
    }).setView([39.158, 116.4556], 3);
    //http://mapservice.amap.com/mapservice?t=0&c=3&x=842&y=387&z=10&size=0&v=dark
    //http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}
    L.tileLayer('http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: 'Map &copy 高德@服务平台日志分析部</a>'
    }).addTo(map);
    L.control.zoom({position: 'topright'}).addTo(map)
    var heatmap = new HeatmapOverlay({
        radius: 15,
        //max: 1,
        maxOpacity: .35,
        minOpacity: .03,
        zoomRadiusMap: getZoomRadiusMap(),
        viewreset: renderHeatMapAndClean,
        dragend: renderHeatmap,
        resize: renderHeatMapAndClean
    })

    function renderHeatMapAndClean() {
        heatmap._heatmap.clear()
        renderHeatmap()
    }

    requestAnimationFrame(function () {
        map.addLayer(heatmap);
        heatmap.setData({
            data: [{
                lng: 116.396574,
                lat: 39.992706,
                value: 0.1
            }]
        })
    })

    /**
     * 得到过去30天的日期
     * @returns 如：['2015-07-04','2015-07-05'...]共三十个元素
     */
    function getShowDateRange() {
        var currentTimestamp = Date.now()
        var oneDay = 24 * 60 * 60 * 1000
        var dateRange = []
        for (var i = SHOW_DAYS; i > 0; --i) {
            dateRange.push(new Date(currentTimestamp - (oneDay * i)))
        }
        return dateRange.map(function (date) {
            return date.toJSON().substring(0, 10)
        })
    }

    function onDateChange(callback) {
        var date = getDate()
        if (onDateChange.lastDate !== date) {
            onDateChange.lastDate = date
            callback()
        }
    }

    /**
     *
     * @param {string}date 如：2015-08-03
     * @returns {string} 8.3
     */
    function formatDate(date) {
        return date.substring(5).replace("-", ".").replace(/0(\d)/g, "$1")
    }

    function renderDateTick() {
        var html = getShowDateRange().map(function (date) {
            return '<span class="time-panel-progress-tick">' + formatDate(date) + '</span>'
        }).join("")
        $(".time-panel-progress-text").html(html)
        $("#time-panel").show()
    }

    renderDateTick()

    function isPlay() {
        return $(".time-panel-btn").hasClass("play")
    }

    function getDate() {
        var index = Math.floor(getLeft() / getMaxWidth() * SHOW_DAYS)
        if (index >= SHOW_DAYS) {
            index = SHOW_DAYS - 1
        }
        return getShowDateRange()[index]
    }

    /**
     * 启动拖拽效果
     */
    function startDrag() {
        var dragging = false
        var startX
        var left
        $(".time-panel-progress").on("mousedown", function (event) {
            dragging = true
            startX = event.screenX
            left = getLeft()
        })
        $(document).on("mouseup", function () {
            if (dragging) {
                renderHeatmap()
            }
            dragging = false
        })
        $(document).on("mousemove", function (event) {
            if (dragging) {
                window.getSelection().empty()
                var distance = event.screenX - startX
                setLeft(left + distance)
            }
        })
    }

    startDrag()
    function getMaxWidth() {
        return parseInt($(".time-panel-progress-bar").width()) - 8
    }

    function getLeft() {
        return parseInt($(".time-panel-progress").css("left"))
    }

    /**
     * 会进行边界值检测，如果left<0，left会设为0，left>maxWidth，left设为maxWidth
     * @param left
     */
    function setLeft(left) {
        if (left < 0) {
            left = 0
        }
        var maxWidth = getMaxWidth()
        if (left >= maxWidth) {
            left = maxWidth
        }
        $(".time-panel-progress").css({
            left: left
        })
    }

    /**
     * 开始自动播放
     */
    function autoPlay() {
        if (!document.hidden) {

        }
        if (isPlay()) {
            var left = getLeft() || 0
            var maxWidth = getMaxWidth()
            if (left >= maxWidth) {
                left = 0
            }
            setLeft(left + 1)
            onDateChange(renderHeatmap)
        }
        autoPlay.timeoutId = setTimeout(autoPlay, 100)
    }

    function cancelAutoPlay() {
        clearTimeout(autoPlay.timeoutId)
    }

    autoPlay()
    document.addEventListener("visibilitychange", function (event) {
        if (document.hidden) {
            cancelAutoPlay()
        } else {
            autoPlay()
        }
    })

    $(".time-panel-btn").click(function () {
        $(this).toggleClass("play")
    })
    $(".operation_arrow").click(function () {
        $("body").toggleClass("hide-time-panel")
    })
    function getZoomRadiusMap() {
        /**
         * 每个级别表示真实面积的半径
         * 3:2
         * 4:4
         * 5:8
         * 6:13,
         * 7:14,
         * 8:16
         * 9:24
         * 10:39
         * 11:56,
         * 12:56*2,
         * 13:56*4,
         * 14:56*8,
         * 15:56*16
         * 16:56*32,
         * 17:56*64,
         * 18:56*128
         */
        //var result = {
        //    3: 3,
        //    4: 4,
        //    5: 6,
        //    6: 7,
        //    7: 8,
        //    8: 10,
        //    9: 15,
        //    10: 15,
        //}
        //for (var i = 11; i <= 18; i++) {
        //    result[i] = 20
        //}
        var result = {
            3: 2,
            4: 4,
            5: 6,
            6: 9,
            7: 10,
            8: 12,
            9: 16,
            10: 20,
            11: 24,
            12: 36
        }
        for (var i = 13; i <= 18; i++) {
            result[i] = 45 * Math.pow(2, i - 13)
        }
        return result
    }

    function getZoomMaxMap() {
        //return {
        //    "3-5": 600000,
        //    "6": 400000,
        //    "7": 360000,
        //    "8": 300000,
        //    "9": 180000,
        //    "10": 100000,
        //    "11-18": 10000
        //}
        return {
            "3-5": 560000,
            "6": 500000,
            "7": 450000,
            "8": 360000,
            "9": 240000,
            "10": 160000,
            "11": 100000,
            "12": 65000,
            "13-18": 60000
            //"11-18": 120000
        }
    }

    /**
     * 根据地图的缩放级别得到数据库中存储的字段
     * @param zoom
     */
    function getZoom(zoom) {
        if (zoom >= 3 && zoom <= 5) {
            return "3-5"
        } else if (zoom >= 13) {
            return "13-18"
        } else {
            return zoom
        }
    }


    function renderHeatmap() {
        if (renderHeatmap.lastPromise) {
            renderHeatmap.lastPromise.abort()
        }

        var bounds = map.getBounds()
        var loadDataPromise
        var zoom = getZoom(map.getZoom())
        var date = getDate()
        var cacheKey = zoom + "-" + date
        if (renderHeatmap[cacheKey]) {
            heatmap.setData({
                data: renderHeatmap[cacheKey]
            })
            return
        }
        var params = {
            sort: "u_pv:desc",
            page: 1,
            pagesize: 10000,
            project: getProject(["u_centerx", "u_centery", "u_pv"]),
            //"u_leafmax_x",
            //"u_leafmax_y", "u_leafmin_x", "u_leafmin_y"]),
            match: getMatch({
                u_datetime: date,
                u_zoomlevel: zoom
            }),
            nomatch: [
                "u_centery<=" + bounds._northEast.lat,
                "u_centery>=" + bounds._southWest.lat,
                "u_centerx<=" + bounds._northEast.lng,
                "u_centerx>=" + bounds._southWest.lng,
            ].join(",")
        }
        if (location.hostname === "localhost") {
            loadDataPromise = $.post("//visual.rds.service.amap.com/service-rds/log/post/nocache/s_amap_dm_alg_city_heatmapfilter_all", params)
        } else {
            loadDataPromise = dataloader.query("log/post/nocache/s_amap_dm_alg_city_heatmapfilter_all", {
                source: 'visual',
                dateformat: 'yyyyMMddhhmmss',
                type: 'post',
                global: true,
                params: params
            })
        }
        renderHeatmap.lastPromise = loadDataPromise
        loadDataPromise.then(function (data) {
            if (data.result.length == 0) {
                return
            }
            data.result = data.result.sort(function (a, b) {
                return a[fieldNameMap.u_pv] < b[fieldNameMap.u_pv]
            })
            var max = getZoomMaxMap()[zoom] || data.result[0][fieldNameMap.u_pv]
            var min = data.result[data.result.length - 1][fieldNameMap.u_pv]
            var pointList = data.result.map(function (item) {
                return {
                    lat: item[fieldNameMap.u_centery],
                    lng: item[fieldNameMap.u_centerx],
                    value: item[fieldNameMap.u_pv]
                }
            })

            if (zoom === "3-5") {
                renderHeatmap[cacheKey] = pointList
            }
            heatmap.setData({
                data: pointList,
                max: max,
                min: min / 2
            })
            //if(window.polygons){
            //    window.polygons.forEach(function(i){
            //        map.removeLayer(i)
            //    })
            //}
            //window.polygons=[]
            //data.result.forEach(function (item) {
            //    var miny = item[fieldNameMap.u_leafmin_x]
            //    var minx = item[fieldNameMap.u_leafmin_y]
            //    var maxy = item[fieldNameMap.u_leafmax_x]
            //    var maxx = item[fieldNameMap.u_leafmax_y]
            //    window.polygons.push(L.polygon([L.latLng(minx, miny),L.latLng(maxx, miny), L.latLng(maxx, maxy),L.latLng(minx, maxy) ],{
            //        opacity:.4
            //    }).addTo(map))
            //})
        })
    }


    function getProject(projectList) {
        return projectList.map(function (project) {
            return project + " as " + fieldNameMap[project]
        }).join(",")
    }

    function getMatch(obj) {
        return Object.keys(obj).map(function (key) {
            return key + ":" + obj[key]
        }).join(",")
    }

    renderHeatmap()
    window.heatmap = heatmap
    window.map = map


})