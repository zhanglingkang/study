var pointList = []
var MAX_POINT = 20000
var SHOW_MAX_POINT = 10000

var methodMap = {
    startDecay: startDecay,
    stopDecay: stopDecay,
    addPoint: addPoint,
    getShowPointList: getShowPointList,
    getPointLength: getPointLength
}
var newBound = null
/**
 * point是否在bound内
 * @param bound
 * @param bound.maxLat,
 * @param bound.minLat,
 * @param bound.maxLng,
 * @param bound.minLng
 * @param point
 * @param point.lat
 * @param point.lng
 */
function contain(bound, point) {
    return bound.maxLat >= point.lat && bound.minLat <= point.lat && bound.maxLng >= point.lng && bound.minLng <= point.lng
}

/**
 * 启动衰退
 * @param config
 * @param config.interval
 * @param config.decayValue
 * @param config.minValue
 */
function startDecay(config) {
    startDecay.timerId = setInterval(function decay() {
        var newPointList = []
        for (var i = 0; i < pointList.length; ++i) {
            var point = pointList[i]
            point.value = point.value * config.decayValue
            if (point.value > config.minValue) {
                if (!newBound || contain(newBound, point)) {
                    newPointList.push(point)
                }
            }
        }
        pointList = newPointList
    }, config.interval)
}
function stopDecay() {
    clearInterval(startDecay.timerId)
}
function addPoint(data) {
    pointList.unshift(data.point)
    pointList.splice(MAX_POINT)
}
function isEqual(bound1, bound2) {
    return bound1.maxLat == bound2.maxLat
        && bound1.minLat == bound2.minLat
        && bound1.maxLng == bound2.maxLng
        && bound1.minLng == bound2.minLng
}
function getShowPointList(data) {
    newBound = data.bound
    var filteredPointList = []
    var len = pointList.length
    for (var i = 0; i < len; ++i) {
        var point = pointList[i]
        if (contain(newBound, point)) {
            filteredPointList.push(point)
        }
        if (filteredPointList.length >= MAX_POINT) {
            break
        }
    }
    setTimeout(function () {
        if (isEqual(newBound, data.bound)) {
            postMessage({
                type: "getShowPointList",
                data: {
                    pointList: filteredPointList,
                    bound: data.bound
                }
            })
        }
    })

}
function getPointLength() {
    postMessage({
        type: "getPointLength",
        data: {
            length: pointList.length
        }
    })
}
onmessage = function (event) {
    var method = methodMap[event.data.type]
    if (typeof method == "function") {
        method(event.data.data)
    }
}
