(function () {
    function isListPage() {
        return location.href.indexOf("http://www.wlcbnews.com/channel/wlcbxxw/col20330f.html") !== -1;
    }

    //得到name对应的投票支持按钮
    function getBtnNode(name) {
        var allTdNode = document.querySelectorAll("#votefrm td");
        for (var i = 0; i < allTdNode.length; ++i) {
            var text = allTdNode.item(i).querySelectorAll(".teachername")[1].textContent;
            if (text.indexOf(name) !== -1) {
                return allTdNode.item(i).querySelector(".teachername img");
            }
        }
    }

    function main() {
        if (isListPage()) {
            getBtnNode("吕海文").click();
        }
    }

    main();
})();