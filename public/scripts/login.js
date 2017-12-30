
function redirectToSignupLG(event) {
    window.location.replace("https://fcc-leahcarr-voting-app.herokuapp.com/signup");
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