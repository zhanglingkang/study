;
(function () {
    /**
     * @method getNodeDocumentDistance
     * @description 得到节点与文档顶部之间的距离
     * @param {Node} node
     * @return {Object} result result.left、result.top
     */
    function getNodeDocumentDistance(node) {
        return window.pageYOffset + node.getBoundingClientRect().top;
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

    document.addEventListenr("click", function (event) {
        if (event.target.getAttribute("data-tooltip")) {
            var willAddNode = document.createElement("div");
            willAddNode.style.position = "absolute";
            event.target.parentNode.appendChild(willAddNode)
        }
    });
}())