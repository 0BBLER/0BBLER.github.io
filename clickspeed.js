var clicks = 0;
var lcps = 0;
var rcps = 0;
var tcps = 0;
var leftclicklist = [];
var rightclicklist = [];
var accuracy = 50;

document.getElementById("total").innerHTML = "<st>8 </st>Total clicks: " + clicks;

function clicked() {

    leftclicklist.push(1000);

    clicks++;
    document.getElementById("total").innerHTML = "<st>8 </st>Total clicks: " + clicks;
}
function rightclicked() {

    rightclicklist.push(1000);

    clicks++;
    document.getElementById("total").innerHTML = "<st>8 </st>Total clicks: " + clicks;
}

function update() {
    for (let i = 0; i < leftclicklist.length; i++) {
        leftclicklist[i] -=accuracy;
        if(leftclicklist[i]<1) {
            leftclicklist.splice(i,1);
            i--;
        }
    }

    for (let i = 0; i < rightclicklist.length; i++) {
        rightclicklist[i] -=accuracy;
        if(rightclicklist[i]<1) {
            rightclicklist.splice(i,1);
            i--;
        }
    }

    lcps = leftclicklist.length;
    rcps = rightclicklist.length;
    tcps = lcps+rcps;
    
    document.getElementById("lresult").innerHTML = "<st>5 </st>Left CPS: " + lcps;
    document.getElementById("rresult").innerHTML = "<st>6 </st>Right CPS: " + rcps;
    document.getElementById("tresult").innerHTML = "<st>7 </st>Combined CPS: " + tcps;
}

document.getElementById("thingtoclick").addEventListener("contextmenu", (event) => {
    event.preventDefault();
    rightclicked();
})

window.setInterval(update, accuracy);

console.log("loaded js");