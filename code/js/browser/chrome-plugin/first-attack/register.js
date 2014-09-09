(function(){
var firstIdCard = "140109111111111019";//140109111111111020
var firstPhone = 18810562345;//18810562238
function getIdCard() {
    var idCard = localStorage.getItem("idCard") || firstIdCard;
    localStorage.setItem("idCard", getNextIdCard(idCard));
    return idCard;
}
function getNextIdCard(idCard) {
    idCard = idCard + "";
    return idCard.substring(0, 10) + (parseInt(idCard.substring(10)) + 1);
}
function getPhone() {
    var phone = localStorage.getItem("phone") || firstPhone;
    phone = parseInt(phone);
    localStorage.setItem("phone", phone - 1);
    return phone + "";
}
function fillForm() {
    var idCard = getIdCard();
    var phone = getPhone();
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtIDCard']").value = idCard;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtPwd']").value = idCard;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtSurePwd']").value = idCard;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtRealName']").value = getName();
    var selector = "[name='ctl00$ContentPlaceHolder1$rdolSex'][value='" + parseInt(Math.random() * 2) + "']";
    document.querySelector(selector).click();
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtMobile']").value = phone;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtEmail']").value = phone + "@qq.com";
    var code = document.querySelector("[id='ContentPlaceHolder1_btnValidCode']").innerHTML;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtValidCode']").value = code;
}
function submit() {
    document.querySelector("[name='ctl00$ContentPlaceHolder1$btnReg']").click();
}
function getName() {
    var firstNames = "赵 钱 孙 李 周 吴 郑 王 冯 陈 褚 卫 蒋 沈 韩 杨 朱 秦 尤 许 何 吕 施 张 孔 曹 严 华 金 魏 陶 姜 戚 谢 邹 喻 柏 水 窦 章 云 苏 潘 葛 奚 范 彭 郎".split(" ");
    var lastNames = "中华姓氏是传统文化中生命力最旺凝聚力最强感召力最大的人文情结是认同中华传统文化的伟大基石中华民族历来以炎黄子孙自居把炎黄二帝作为共同的人文初祖和精神偶像无论是偏处一隅的少数民族还是飘零异域的华裔侨胞时时处处都流传着炎黄二帝的传说人人都以炎黄子孙为荣这种以血缘姓氏为传承纽带对共同祖先形象的塑造对民族渊源的追述构成了中华文化多元一体化和连续传承性的认同基".split("");
    return firstNames[parseInt(Math.random() * firstNames.length)] + lastNames[parseInt(Math.random() * lastNames.length)] + lastNames[parseInt(Math.random() * lastNames.length)];
}
function isRegisterPage() {
    return location.href.indexOf("UserRegister.aspx") !== -1;
}
function start() {
    if (isRegisterPage()) {
        fillForm();
        submit();

    }
}
//start();
})();