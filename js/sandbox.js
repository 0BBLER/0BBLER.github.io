const gamesize = 600;
const pixelSize = 4; //explosive, do not touch
const pixelSideCount = gamesize / pixelSize;
const coords = getCircleCoords(6);
const colours = [
  "#9fffff",
  "#a6a6a6",
  "#dec400",
  "#1117c2",
  "#b4ba00",
  "#a18852",
  "#5c3f00",
  "#239906",
];
var pixels = [];
var game = document.getElementById("game");
var mouseX = 0;
var mouseY = 0;
var mcx = 0; //mouse canvas x
var mcy = 0; //mouse canvas y
var mousedown = false;
var placeType = 2;
game.width = gamesize;
game.height = gamesize;

const updateDelay = 40; //ms

/**
 * PIXEL VALUES
 *
 * 0: air - nothing
 * 1: rock - no gravity
 * 2: sand - falling object
 * 3: water - falling object with flooding
 * 4: flower seed - falling object, turns into plant when watered
 * 5: tree seed - falling object, turns into tree when watered
 * 6: wood† - tree bark
 * 7: green† - tree leaves & plant
 *
 *
 * †unplaceable
 */

for (let i1 = 0; i1 < pixelSideCount; i1++) {
  let array = [];
  pixels.push(array);
  for (let i2 = 0; i2 < pixelSideCount; i2++) {
    pixels[i1].push(0);
  }
}

const g = game.getContext("2d");

function tick() {
  if (mousedown && mcx < gamesize && mcx > -1 && mcy < gamesize && mcy > -1) {
    let hoverX = Math.round(mcx / 4);
    let hoverY = Math.round(mcy / 4);
    for (let i = 0; i < coords.length; i++) {
      if (
        hoverX + coords[i].x < pixelSideCount &&
        hoverX + coords[i].x > -1 &&
        hoverY + coords[i].y < pixelSideCount &&
        hoverY + coords[i].y > -1 &&
        (pixels[hoverX + coords[i].x][hoverY + coords[i].y] == 0 ||
          placeType == 0)
      ) {
        setPixel(hoverX + coords[i].x, hoverY + coords[i].y, placeType);
      }
    }
  }
  for (let y = pixelSideCount - 1; y > -1; y--) {
    for (let x = 0; x < pixelSideCount; x++) {
      let current = pixels[x][y];
      if (current > 1 && current < 6) {
        if (pixels[x][y + 1] == 0) {
          setPixel(x, y, 0);
          setPixel(x, y + 1, current);
        } else {
          if (current == 3 && y != pixelSideCount) {
            if (rand(2) == 0) {
              if (x != 0) {
                if (
                  pixels[x - 1][y] == 0 &&
                  (pixels[x - 1][y + 1] == 0 || pixels[x - 1][y + 1] == 3)
                ) {
                  setPixel(x - 1, y, 3);
                  setPixel(x, y, 0);
                }
              } else {
                if (x != pixelSideCount - 1) {
                  if (
                    pixels[x + 1][y] == 0 &&
                    (pixels[x + 1][y + 1] == 0 || pixels[x + 1][y + 1] == 3)
                  ) {
                    setPixel(x + 1, y, 3);
                    setPixel(x, y, 0);
                  }
                }
              }
            } else {
              if (x != pixelSideCount - 1) {
                if (
                  pixels[x + 1][y] == 0 &&
                  (pixels[x + 1][y + 1] == 0 || pixels[x + 1][y + 1] == 3)
                ) {
                  setPixel(x + 1, y, 3);
                  setPixel(x, y, 0);
                }
              } else {
                if (x != 0) {
                  if (
                    pixels[x - 1][y] == 0 &&
                    (pixels[x - 1][y + 1] == 0 || pixels[x - 1][y + 1] == 3)
                  ) {
                    setPixel(x - 1, y, 3);
                    setPixel(x, y, 0);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  /*
  g.fillStyle = "black";
  g.fillText("x: " + mcx, 5, 10);
  g.fillText("y:" + mcy, 5, 20);
  g.fillText("mouse:" + mousedown, 5, 30);
  */

  window.requestAnimationFrame(tick);
}

function setSelected(type) {
  placeType = type;
}

function setPixel(x, y, set) {
  pixels[x][y] = set;
  g.fillStyle = colours[set];
  g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function getCircleCoords(r) {
  const coords = [];

  for (let x = -r; x <= r; x++) {
    for (let y = -r; y <= r; y++) {
      if (x * x + y * y <= r * r) {
        coords.push({ x, y });
      }
    }
  }

  return coords;
}

function reset() {
  for (let x = 0; x < pixels.length; x++) {
    for (let y = 0; y < pixels[0].length; y++) {
      setPixel(x, y, 0);
    }
  }
}

tick();
window.requestAnimationFrame(tick);

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mcx = mouseX - 10;
  mouseY = event.clientY;
  mcy = mouseY - 178;
});

window.addEventListener("mousedown", () => {
  mousedown = true;
});
window.addEventListener("mouseup", () => {
  mousedown = false;
});

function rand(max) {
  return Math.floor(Math.random() * max);
}
