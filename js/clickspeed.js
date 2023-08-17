const accuracy = 50; //check every __ms
const canvasHeight = 300;
const canvasWidth = window.innerWidth - 15;
const graphUpdateMs = 20;
const pointSpacing = 2; //graph
const maxVisiblePoints = Math.ceil(canvasWidth / pointSpacing);
var clicks = 0;
var lcps = 0; //left
var rcps = 0; //right
var tcps = 0; //total
var leftclicklist = [];
var rightclicklist = [];
var rpoints = []; //right
var lpoints = []; //left
var topCps = 0;
var first = true;

document.getElementById("total").innerHTML =
  "<st>8 </st>Total clicks: " + clicks;

function clicked() {
  if (first) {
    first = false;
    window.setInterval(updateGraph, graphUpdateMs);
  }

  leftclicklist.push(1000);

  clicks++;
  document.getElementById("total").innerHTML =
    "<st>8 </st>Total clicks: " + clicks;
}
function rightclicked() {
  if (first) {
    first = false;
    window.setInterval(updateGraph, graphUpdateMs);
  }
  rightclicklist.push(1000);

  clicks++;
  document.getElementById("total").innerHTML =
    "<st>8 </st>Total clicks: " + clicks;
}

function updateClicks() {
  for (let i = 0; i < leftclicklist.length; i++) {
    leftclicklist[i] -= accuracy;
    if (leftclicklist[i] < 1) {
      leftclicklist.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < rightclicklist.length; i++) {
    rightclicklist[i] -= accuracy;
    if (rightclicklist[i] < 1) {
      rightclicklist.splice(i, 1);
      i--;
    }
  }

  lcps = leftclicklist.length;
  rcps = rightclicklist.length;
  tcps = lcps + rcps;
  if (tcps > topCps) {
    topCps = tcps;
  }

  document.getElementById("lresult").innerHTML = "<st>5 </st>Left CPS: " + lcps;
  document.getElementById("rresult").innerHTML =
    "<st>6 </st>Right CPS: " + rcps;
  document.getElementById("tresult").innerHTML =
    "<st>7 </st>Combined CPS: " + tcps;
}

document
  .getElementById("thingtoclick")
  .addEventListener("contextmenu", (event) => {
    event.preventDefault();
    rightclicked();
  });

var c = document.getElementById("graph");
c.width = canvasWidth;
c.height = canvasHeight;
var g = c.getContext("2d");

function updateGraph() {
  rpoints.push(rcps);
  lpoints.push(lcps);
  if (rpoints.length > maxVisiblePoints) {
    rpoints.splice(0, 1);
  }
  if (lpoints.length > maxVisiblePoints) {
    lpoints.splice(0, 1);
  }
  

  g.clearRect(0, 0, c.width, c.height);

  g.lineWidth = 3;

  g.strokeStyle = "red";
  g.beginPath();
  g.moveTo(window.innerWidth - 15, canvasHeight - 50);
  for (let i = 0; i < rpoints.length; i++) {
    g.lineTo(
      window.innerWidth - 15 - i * pointSpacing,
      (-rpoints[i] / topCps) * (canvasHeight - 100) + (canvasHeight - 50)
    );
  }

  g.stroke();

  g.strokeStyle = "blue";
  g.beginPath();
  g.moveTo(window.innerWidth - 15, canvasHeight - 50);
  for (let i = 0; i < lpoints.length; i++) {
    g.lineTo(
      window.innerWidth - 15 - i * pointSpacing,
      (-lpoints[i] / topCps) * (canvasHeight - 100) + (canvasHeight - 50)
    );
  }

  g.stroke();
}

window.setInterval(updateClicks, accuracy);
updateGraph();
