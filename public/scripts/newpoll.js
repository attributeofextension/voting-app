function addAnotherOption(event) {
    var newpollPanel = document.getElementById("newpollOptionPanel");
    var newOptionInput = document.createElement("input");
    newOptionInput.setAttribute("type","text");
    newOptionInput.setAttribute("class","form-control newpollOption");
    newOptionInput.setAttribute("name","options");
    newpollPanel.appendChild(newOptionInput);
}

function loaded(event) {
    addOptionBtn = document.getElementById("addOptionBtn");
    addOptionBtn.addEventListener("click",addAnotherOption);
}
$(document).ready(loaded);
