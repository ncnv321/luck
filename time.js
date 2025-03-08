/*var datetime = new Date();
console.log(datetime);
document.getElementById("time").innerHTML = (datetime.getHours()+":"+datetime.getMinutes()+":"+datetime.getSeconds());


const myInterval = setInterval(refreshTime, 1000);

function refreshTime() {	
	const dateString = new Date();
	const timeDisplay = document.getElementById("time").innerHTML = datetime.toLocaleTimeString();
}*/
function checkTime(i) {
  if (i < 10) {
    i = "0" + i;	
  // add a zero in front of numbers<10
  }
  return i;
}

function startTime() {
  var today = new Date();
  var h = today.getHours();
  
  var m = today.getMinutes();
  var s = today.getSeconds();
  var ampm = h >= 12 ? ' PM' : ' AM';
  if (h >= 13) {
	  h -= 12;
  }
  else if (h == 0){
	  h = 12;
  }
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('time').innerHTML = h + ":" + m + ampm;
  t = setTimeout(function() {
    startTime()
  }, 500);
}
startTime();