const GRAVITY = 0.13;
const ticksToFinish = 200;
const xvrange = 50;
const nomnoms = [
  new Audio("./sounds/fish/nomnom0.mp3"),
  new Audio("./sounds/fish/nomnom1.mp3"),
  new Audio("./sounds/fish/nomnom2.mp3"),
  new Audio("./sounds/fish/nomnom3.mp3"),
  new Audio("./sounds/fish/nomnom4.mp3"),
  new Audio("./sounds/fish/nomnom5.mp3"),
];
const whooshs = [
  new Audio("./sounds/fish/whoosh0.mp3"),
  new Audio("./sounds/fish/whoosh1.mp3"),
  new Audio("./sounds/fish/whoosh2.mp3"),
  new Audio("./sounds/fish/whoosh3.mp3"),
];
const launches = [
  new Audio("./sounds/fish/launch0.mp3"),
  new Audio("./sounds/fish/launch1.mp3"),
  new Audio("./sounds/fish/launch2.mp3"),
  new Audio("./sounds/fish/launch3.mp3"),
  new Audio("./sounds/fish/launch4.mp3"),
  new Audio("./sounds/fish/launch5.mp3"),
];

var mouth = document.getElementById("mouthImage");
var fish;
var launcherX = window.innerWidth;
mouth.classList.add("mouth");
mouth.style.position = "absolute";
var t, x, y, rot, xv, yv, rotv, mouthRot, mouthX, mouthY, mouthDist;
t = 0;

function generateFish() {
  fish = document.createElement("img");
  fish.src = "./images/fish/fish" + rand(6) + ".png";
  document.body.appendChild(fish);

  fish.style.position = "absolute";
  fish.style.opacity = 1;

  /*
  xv = rand(xvrange) - xvrange / 2;
  yv = -33;
  */
  //x = window.innerWidth / 2;
  y = window.innerHeight;
  rot = rand(720) - 360;
  rotv = rand(40) - 20;

  fish.style.left = x + "px";
  fish.style.top = y + "px";
  fish.style.rotate = rot + "deg";

  launches[rand(6)].play();
}

function tick() {
  t += 1;
  x += xv;
  //xv *= 0.98;

  y += yv;
  yv += GRAVITY;

  rotv *= 0.98;
  rot += rotv;

  fish.style.left = x + "px";
  fish.style.top = y + "px";
  fish.style.rotate = rot + "deg";

  //positionMouth();

  if (t > ticksToFinish - 20) {
    fish.style.opacity -= 0.05;
  }

  if (t > ticksToFinish) {
    nomnoms[rand(6)].play();
    whooshs[rand(4)].play();

    mouthDist = 1400;
    positionMouth();
    fish.remove();
    t = 0;
    window.setTimeout(setMouth, rand(700) + 300);
  } else {
    window.requestAnimationFrame(tick);
  }
}

function setMouth() {
  mouth.classList.remove("mouth");
  mouth.style.visibility = "hidden";
  mouthRot = rand(360);
  mouthDist = 1400;
  positionMouth();

  calcVelocities();
  generateFish();
  window.requestAnimationFrame(tick);
  setTimeout(slideMouth, 1400);
}

function slideMouth() {
  whooshs[rand(4)].play();
  mouth.style.visibility = "";
  mouth.classList.add("mouth");
  mouthDist = 0;
  positionMouth();
}

function calcVelocities() {
  var targetX =
    Math.cos(toRadians(mouthRot)) *
      ((window.innerWidth + 0 - mouth.naturalWidth / 2) / 2.1) +
    window.innerWidth / 2;
  var targetY =
    Math.sin(toRadians(mouthRot)) *
      ((window.innerHeight + 0 - mouth.naturalHeight / 2) / 2.25) +
    window.innerHeight / 2;

  yv =
    (targetY -
      window.innerHeight -
      (1 / 2) * GRAVITY * (ticksToFinish * ticksToFinish)) /
    ticksToFinish;
  xv = (targetX - launcherX) / ticksToFinish;
  x = launcherX;
  launcherX = rand(window.innerWidth);
}

function positionMouth() {
  mouthX =
    Math.cos(toRadians(mouthRot)) * ((window.innerWidth + mouthDist) / 2.1);
  mouthY =
    Math.sin(toRadians(mouthRot)) * ((window.innerHeight + mouthDist) / 2.25);
  mouth.style.left =
    mouthX + window.innerWidth / 2 - mouth.naturalWidth / 2 + "px";
  mouth.style.top =
    mouthY + window.innerHeight / 2 - mouth.naturalHeight / 2 + "px";
  mouth.style.rotate = mouthRot - 90 + "deg";
}

function start() {
  document.getElementById("userInteraction").outerHTML =
    "Have some fresh fish!";
  mouth.style.visibility = "";
  setMouth();
}

function rand(max) {
  return Math.floor(Math.random() * max);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
