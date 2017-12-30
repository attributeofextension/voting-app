function makePollDataURL(userid,name) {
  return "https://fcc-leahcarr-voting-app.herokuapp.com//api/polldata?userid=" + userid + "&name=" + name;
}

function generateChart(jsondata) {
  var pollArr = [['Option', 'Votes']];
  var isData = false;
  for(var i = 0;i < jsondata.options.length;i++) {
      if(jsondata.options[i].votes > 0) {
        isData = true;
      }
      pollArr.push([jsondata.options[i].option,jsondata.options[i].votes]);
  }
  if(!isData) {
    pollArr.push(["No Votes Yet",1]);
  }
  
  
  google.charts.load("current", {packages:["corechart"]});
  google.charts.setOnLoadCallback(drawChart);
      function drawChart() {
        var data = google.visualization.arrayToDataTable(pollArr);

        var options = {
        };

        var chart = new google.visualization.PieChart(document.getElementById('voteChart'));
        chart.draw(data, options);
      }

}

function loaded(event) {
  var pollauthor = document.getElementById("pollauthor").value;
  var pollname = document.getElementById("pollname").value;

  $.getJSON(makePollDataURL(pollauthor,pollname),generateChart);
  
}
$("document").ready(loaded);