var dropdown;

function bodyLoaded() {
  document.getElementById("titleText").style.left = "15px";
  document.getElementById("titleText").style.opacity = "1";
  document.getElementById("bigCircle").style.height = "59.8em";
  document.getElementById("bigCircle").style.width = "59.8em";
  window.setTimeout(function () {
    document.getElementById("l1").style.width = "38em";
    document.getElementById("l1").style.opacity = "1";
    document.getElementById("desc").style.left = "15px";
    document.getElementById("desc").style.opacity = "1";
  }, 400);
  for (
    let i = 0;
    i < document.getElementById("btnContainer").children.length;
    i++
  ) {
    window.setTimeout(function () {
      document.getElementById("btnContainer").children[i].style.transform =
        "rotate3d(0,0,0,0deg)";
      document.getElementById("btnContainer").children[i].style.opacity = 1;
    }, 700 + i * 200);
  }
}

function scrollStuff() {
    document.getElementById("bigCircle").style.top = "-9000px";
    document.getElementById("titleText").style.top = "-9000px";
    document.getElementById("l1").style.top = "-9000px";
    document.getElementById("desc").style.top = "-9000px";
    document.getElementById("btnContainer").style.top = "-9000px";
}

//window.addEventListener("scroll", scrollStuff);
