//constants
const GRAVITY = 0.13;
const ticksToFinish = 200;
const xvrange = 50;
//get files
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
//some variables
var mouth = document.getElementById("mouthImage");
var fish;
var launcherX = window.innerWidth;
mouth.classList.add("mouth");
mouth.style.position = "absolute";
var t, x, y, rot, xv, yv, rotv, mouthRot, mouthX, mouthY, mouthDist;
t = 0;

function generateFish() {
  //get random fish image and add it to screen
  fish = document.createElement("img");
  fish.src = "./images/fish/fish" + rand(6) + ".png";
  document.body.appendChild(fish);

  fish.style.position = "absolute";
  fish.style.opacity = 1;

  y = window.innerHeight;
  rot = rand(720) - 360;
  rotv = rand(40) - 20;

  fish.style.left = x + "px";
  fish.style.top = y + "px";
  fish.style.rotate = rot + "deg";
  //launch sound
  launches[rand(6)].play();
}

function tick() {
  t++;

  //velocities and whatnot
  x += xv;
  y += yv;
  yv += GRAVITY;
  rotv *= 0.98;
  rot += rotv;

  //position fish
  fish.style.left = x + "px";
  fish.style.top = y + "px";
  fish.style.rotate = rot + "deg";

  //fade out if going to disppear in 20 ticks
  if (t > ticksToFinish - 20) {
    fish.style.opacity -= 0.05;
  }

  //deletion of fish
  if (t > ticksToFinish) {
    //sounds
    nomnoms[rand(6)].play();
    whooshs[rand(4)].play();

    //reset things
    mouthDist = 1400;
    positionMouth();
    fish.remove();
    t = 0;

    //prepare next launch
    window.setTimeout(setMouth, rand(700) + 300);
  } else {
    window.requestAnimationFrame(tick);
  }
}

function setMouth() {
  //reset mouth stuff without CSS transitions
  mouth.classList.remove("mouth");
  mouth.style.visibility = "hidden";
  mouthRot = rand(360);
  mouthDist = 1400;
  positionMouth();

  //generate fish
  calcVelocities();
  generateFish();
  //start loop
  window.requestAnimationFrame(tick);
  //slide mouth in some time after the fish was launched, as to create the effect of the mouth going for the fish, and not the other way around
  setTimeout(slideMouth, 1400);
}

function slideMouth() {
  //sound
  whooshs[rand(4)].play();
  //readd CSS transitions
  mouth.style.visibility = "";
  mouth.classList.add("mouth");
  //slide in mouth
  mouthDist = 0;
  positionMouth();
}

function calcVelocities() {
  //get the x and y of where the mouth will be
  var targetX =
    Math.cos(toRadians(mouthRot)) *
      ((window.innerWidth + 0 - mouth.naturalWidth / 2) / 2.1) +
    window.innerWidth / 2;
  var targetY =
    Math.sin(toRadians(mouthRot)) *
      ((window.innerHeight + 0 - mouth.naturalHeight / 2) / 2.25) +
    window.innerHeight / 2;

  //second equation of motion is used to calculate y vel
  yv =
    (targetY -
      window.innerHeight -
      (1 / 2) * GRAVITY * (ticksToFinish * ticksToFinish)) /
    ticksToFinish;
  //since xv isn't reduced, this part is simple
  xv = (targetX - launcherX) / ticksToFinish;
  //put x at launcher x
  x = launcherX;
  //set new launcher x
  launcherX = rand(window.innerWidth);
}

function positionMouth() {
  //get the x and y of mouth
  mouthX =
    Math.cos(toRadians(mouthRot)) * ((window.innerWidth + mouthDist) / 2.1);
  mouthY =
    Math.sin(toRadians(mouthRot)) * ((window.innerHeight + mouthDist) / 2.25);

  //position mouth on screen
  mouth.style.left =
    mouthX + window.innerWidth / 2 - mouth.naturalWidth / 2 + "px";
  mouth.style.top =
    mouthY + window.innerHeight / 2 - mouth.naturalHeight / 2 + "px";
  mouth.style.rotate = mouthRot - 90 + "deg";
}

function start() {
  //user interaction for audio to work
  document.getElementById("userInteraction").outerHTML =
    "Have some fresh fish!";

  //bring in mouth
  mouth.style.visibility = "";
  setMouth();
}

//utils

function rand(max) {
  return Math.floor(Math.random() * max);
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
