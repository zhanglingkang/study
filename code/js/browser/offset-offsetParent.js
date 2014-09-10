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

