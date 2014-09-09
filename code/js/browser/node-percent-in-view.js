/**
 * @method nodePercentInView
 * @description 一个节点在屏幕中显示的比例
 * @param {Node} node 一个原生的dom节点
 * @return {Number} 范围：0-1
 */
function nodePercentInView(node) {
    var nodeRect = node.getBoundingClientRect();
    var clientHeight = document.documentElement.clientHeight;//浏览器可见区域高度。
    var percent;
    if (nodeRect.top >= 0) {
        percent = (clientHeight - nodeRect.top) / nodeRect.height;
        if (percent > 1) {
            percent = 1;
        }
    } else {
        percent = (nodeRect.height + nodeRect.top) / nodeRect.height;
        if (percent < 0) {
            percent = 0;
        }
    }
    return percent;
}
