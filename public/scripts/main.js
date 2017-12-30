var baseURL = "https://5dde5d7e53924142b8f03bbe3e9873f8.vfs.cloud9.us-east-2.amazonaws.com/";

function redirectToSignup(event) {
    window.location = baseURL + "signup";
}
function redirectToNewpoll(event) {
    window.location = baseURL + "newpoll";
}
function redirectToMypolls(event) {
    window.location = baseURL + "mypolls";
}
function loaded(event) {
   var signupBtn = document.getElementById("signupBtn");
   if(signupBtn) {
       signupBtn.addEventListener("click",redirectToSignup);
   }
   var newpollBtn = document.getElementById("newpollBtn");
   if(newpollBtn) {
       newpollBtn.addEventListener("click",redirectToNewpoll);
   }
   var mypollsBtn = document.getElementById("mypollsBtn");
   if(mypollsBtn) {
       mypollsBtn.addEventListener("click",redirectToMypolls);
   }
}
$(document).ready(loaded);
