require(['socketio', 'sourceUtils', 'toastr', 'underscore', 'd3'], function (socketio, sourceUtils, toastr, _) {
    var methodMap = {
        getPointLength: updatePointLength,
        getShowPointList: renderHeatMap
    }
    var worker = new Worker(DSHOW_CONTEXT + "/statics/js/dshow/r/dashboard/realtime-heatmap-worker.js?" + DSHOW_VERSION)
    worker.addEventListener('message', function (event) {
        var method = methodMap[event.data.type]
        if (typeof method == "function") {
            method(event.data.data)
        }
    })
    var decayConfig = {
        interval: 100,
        decayValue: 0.999,
        minValue: 0.1
    }
    var map = L.map('map', {
        minZoom: 4,
        maxZoom: 18,
        inertia: false,
        zoomControl: false
    }).setView([39.158, 116.4556], 4);

    var zoomMaxMap = {
        3: 5,
        4: 5,
        5: 5,
        6: 5,
        7: 4.5,
        8: 4,
        9: 3.5,
        10: 3,
        11: 2.5,
        12: 2,
        13: 1.5,
        14: 1,
        15: 1,
        16: 1,
        17: 1,
        18: 1
    }
    //light
    //blue
    //dark
    //getTileUrl:'http://webrd0{1,2,3,4}.is.autonavi.com/appmaptile?size=1&scale=1&style=8&x=[x]&y=[y]&z=[z]&lang=zh_cn'
    L.tileLayer('http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: 'Map &copy 高德@服务平台日志分析部</a>'
    }).addTo(map)
    L.control.zoom({position: 'topright'}).addTo(map)
    L.control.attribution({prefix: false}).addTo(map);
    var heatmap

    function initHeatmap() {
        heatmap = new HeatmapOverlay({
            //radius: 15,
            maxOpacity: .4,
            viewreset: function () {
                heatmap._resetOrigin()
                updateHeatmap()
            },
            dragend: updateHeatmap,
            resize: updateHeatmap,
            minValue: decayConfig.minValue
        })
        map.addLayer(heatmap)
    }

    initHeatmap()
    $(window).resize(_.debounce(function () {
        map.removeLayer(heatmap)
        initHeatmap()
    }, 300))

    function updateHeatmap() {
        var bounds = map.getBounds()
        worker.postMessage({
            type: "getShowPointList",
            data: {
                bound: transformBound(bounds)
            }
        })
    }

    function transformBound(bound) {
        return {
            maxLat: bound._northEast.lat,
            minLat: bound._southWest.lat,
            maxLng: bound._northEast.lng,
            minLng: bound._southWest.lng
        }
    }

    function isEqual(bound1, bound2) {
        return bound1.maxLat == bound2.maxLat
            && bound1.minLat == bound2.minLat
            && bound1.maxLng == bound2.maxLng
            && bound1.minLng == bound2.minLng
    }

    function renderHeatMap(data) {
        if (isEqual(transformBound(map.getBounds()), data.bound)) {
            heatmap.setData({
                data: data.pointList,
                max: zoomMaxMap[map.getZoom()]
            })
        }
        clearTimeout(updateHeatmap.timeoutId)
        updateHeatmap.timeoutId = setTimeout(updateHeatmap, decayConfig.interval)

    }


    var socket = window.socket = socketio.connect(sourceUtils.getSource('realtime_server'), {
        path: '/locate.io',
        forceNew: true,
        reconnectionAttempts: 2
    })
    socket.on("reconnect_failed", function () {
        toastr.error("实时服务连接不上了，请联系“服务平台部-数据分析组”成员")
    })


    /**
     * 启动衰退
     * @param config
     * @param config.interval
     * @param config.decayValue
     * @param config.minValue
     */
    function autoUpdate(config) {
        updateHeatmap()
    }

    function stopAutoUpdate() {
        //clearInterval(autoUpdate.timerId)
    }


    autoUpdate(decayConfig)
    worker.postMessage({
        type: "startDecay",
        data: decayConfig
    })
    document.addEventListener("visibilitychange", function (event) {
        if (document.hidden) {
            stopAutoUpdate()
            worker.postMessage({
                type: "stopDecay"
            })
        } else {
            autoUpdate(decayConfig)
            worker.postMessage({
                type: "startDecay",
                data: decayConfig
            })
        }
    })

    $(document).bind('keydown.a', function () {
        $(".point-count").toggle()
    })
    //$(document).bind('keydown.b', function () {
    //    $(".map-bound").remove()
    //    var bound = transformBound(map.getBounds())
    //    var content = bound.minLat + "--" + bound.maxLat + "--" + bound.minLng + "--" + bound.maxLng
    //    $("body").append('<div class="map-bound" style="position:fixed;left:100px;top:100px;">' + content + '</div>')
    //})
    //$(document).bind('keydown.d', function () {
    //    $(".map-bound").remove()
    //})
    setInterval(function () {
        if (document.hidden) {
            return
        }
        worker.postMessage({
            type: "getPointLength"
        })
    }, 1000)
    function updatePointLength(data) {
        $(".point-count").html(data.length + "--zoom:" + map.getZoom())
    }

    socket.on('testEvent1', function (data) {
        if (document.hidden) {
            return
        }
        if (data) {
            var msgArray = data.split(",")
            if (msgArray[1] && msgArray[2] && msgArray[1] != 0 && msgArray[2] != 0) {
                var lng = msgArray[1]
                var lat = msgArray[2]
                var bounds = transformBound(map.getBounds())
                if (lng >= bounds.minLng && lng <= bounds.maxLng && lat >= bounds.minLat && lat <= bounds.maxLat) {
                    var point = {
                        lat: lat,
                        lng: lng,
                        value: 1
                    }
                    worker.postMessage({
                        type: "addPoint",
                        data: {
                            point: point
                        }
                    })
                }
            }
        }
    })
    window.map = map
})