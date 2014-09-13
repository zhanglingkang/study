;
(function () {
    /**
     * @method getNodeDocumentDistance
     * @description 得到节点与文档顶部之间的距离
     * @param {Node} node
     * @return {Object} result result.left、result.top
     */
    function getNodeDocumentDistance(node) {
        var nodeRec = node.getBoundingClientRect();
        return {
            top: window.pageYOffset + nodeRec.top,
            left: window.pageXOffset + nodeRec.left
        }
    }

    /**
     * @method getNodeOffsetParentDistance
     * @description 得到节点与包含块之间的距离
     * @param {Node} node
     * @return {Object} result result.left、result.top
     */
    function getNodeOffsetParentDistance(node) {
        var position = getNodeDocumentDistance(node);
        var offsetPosition = getNodeDocumentDistance(node.offsetParent);
        return {
            top: position.top - offsetPosition.top,
            left: position.left - offsetPosition.left
        }
    }

    document.addEventListener("click", function (event) {
        if (event.target.getAttribute("data-tooltip") !== null) {
            var pos = getNodeOffsetParentDistance(event.target);
            var nodeRec = event.target.getBoundingClientRect();
            pos.left += nodeRec.width;
            pos.top += nodeRec.height / 2;
            var willAddNode = document.createElement("div");
            willAddNode.style.position = "absolute";
            willAddNode.className = "tooltip";
            willAddNode.style.left = pos.left + "px";
            willAddNode.style.top = pos.top + "px";
            willAddNode.innerHTML = "xxxxxxxxxxx";
            event.target.parentNode.appendChild(willAddNode);
        }
    });
}
());