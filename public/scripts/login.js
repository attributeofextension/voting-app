
function redirectToSignupLG(event) {
    window.location.replace("https://5dde5d7e53924142b8f03bbe3e9873f8.vfs.cloud9.us-east-2.amazonaws.com/signup");
}
function stopSubmit(event) {
    event.preventDefault();
}
function validateForm(event) {

    var form = document.getElementById("signup_form");
    var pass1 = document.getElementById("password");
    var pass2 = document.getElementById("confirm_password");
    
    
    
    if(form.checkValidity()) {
        form.submit();
    }
}
function loaded(event) {
    var lgSignup = document.getElementById("lg-signup");
    lgSignup.addEventListener("click",redirectToSignupLG);
    
    var loginForm = document.getElementById("login_form");
    signupForm.addEventListener("submit",stopSubmit); 
}

$("document").ready(loaded);