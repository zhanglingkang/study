/**
 * @method getNodeDocumentDistance
 * @description 得到节点与文档顶部之间的距离
 * @param {Node} node
 * @return {Object} result result.left、result.top
 */
function getNodeDocumentDistance(node) {
    return window.pageYOffset + node.getBoundingClientRect().top;
}

