function validateForm(event) {

    var form = document.getElementById("signup_form");
    var pass1 = document.getElementById("password");
    var pass2 = document.getElementById("confirm_password");
    
    
    
    if(form.checkValidity()) {
        if( pass1.value != pass2.value ) {
            pass2.setCustomValidity("Passwords don't match");
        } else {
            form.submit();
        }
    }
}
function stopSubmit(event) {
    event.preventDefault();
}
function loaded(event) {
    var signupForm = document.getElementById("signup_form");
    signupForm.addEventListener("submit",stopSubmit);
    var submitBtn = document.getElementById("submitBtn");
    submitBtn.addEventListener("click",validateForm);
}
$("document").ready(loaded);