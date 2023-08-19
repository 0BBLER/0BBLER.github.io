const gamesize = 600;
const pixelSize = 4; //explosive, do not touch
const pixelSideCount = gamesize / pixelSize;
const coords = getCircleCoords(5);
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
var PAUSE = false;
var tickCounter = 1;
var pixels = [];
var pixelData = [];
/**
 * PIXELDATA ENCODING
 *
 * 0123
 * abcd
 *
 * ab: float*10 storing possible colour shift [divide by 10 for amount off (0.0-9.9)]
 * c: int storing set water flow direction [0:left,1:right,2:hibernation]
 * d: updated flag [0:false,1:true]
 */
var game = document.getElementById("game");
var mouseX = 0;
var mouseY = 0;
var mcx = 0; //mouse canvas x
var mcy = 0; //mouse canvas y
var mousedown = false;
var placeType = 2;
game.width = gamesize;
game.height = gamesize;

//const updateDelay = 40; //ms, no longer used

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
  let array2 = [];
  pixels.push(array);
  pixelData.push(array2);
  for (let i2 = 0; i2 < pixelSideCount; i2++) {
    pixels[i1].push(0);
    pixelData[i1].push("000");
  }
}

const g = game.getContext("2d");

function tick() {
  tickCounter++;
  for (let y = pixelSideCount - 1; y > -1; y--) {
    for (let x = pixelSideCount - 1; x > -1; x--) {
      pixelData[x][y] = replaceChar(pixelData[x][y], 3, "0");
    }
  }
  if (mousedown && mcx < gamesize && mcx > -1 && mcy < gamesize && mcy > -1) {
    // placement
    let hoverX = Math.round(mcx / pixelSize);
    let hoverY = Math.round(mcy / pixelSize);
    for (let i = 0; i < coords.length; i++) {
      if (
        hoverX + coords[i].x < pixelSideCount &&
        hoverX + coords[i].x > -1 &&
        hoverY + coords[i].y < pixelSideCount &&
        hoverY + coords[i].y > -1 &&
        (pixels[hoverX + coords[i].x][hoverY + coords[i].y] == 0 ||
          placeType == 0)
      ) {
        if (placeType == 2 || placeType == 3) {
          // make sand and water placement grainy
          if (rand(10) < 4) {
            setPixel(
              hoverX + coords[i].x,
              hoverY + coords[i].y,
              placeType,
              true
            );
          }
        } else {
          setPixel(hoverX + coords[i].x, hoverY + coords[i].y, placeType, true);
        }
      }
    }
  }
  if (!PAUSE) {
    for (let y = pixelSideCount - 1; y > -1; y--) {
      for (
        let x = (pixelSideCount - 1) * (tickCounter % 2);
        x * (tickCounter % 2) + (pixelSideCount - 1) * ((tickCounter + 1) % 2) >
        -1 * (tickCounter % 2) + x * ((tickCounter + 1) % 2);
        x += ((tickCounter + 1) % 2) * 2 - 1
      ) {
        if (pixelData[x][y].charAt(3) == "0") {
          //if it has not been updated yet
          let current = pixels[x][y];
          if (current > 1 && current < 6) {
            //if it is a gravity-affected tile, induce gravity
            if (pixels[x][y + 1] == 0) {
              if (current == 3) {
                pixelData[x][y] = replaceChar(
                  pixelData[x][y],
                  2,
                  rand(2).toString
                );
              }
              switchPixels(x, y + 1, x, y);
            } else if (current == 2 && pixels[x][y + 1] == 3) {
              //sand falls through water
              switchPixels(x, y, x, y + 1);
            } else if (
              current == 3 &&
              y != pixelSideCount &&
              x != 0 &&
              x != pixelSideCount - 1 &&
              y != 0
            ) {
              var surrounded = false;
              //water
              
              var gapleft = 0;
              var gapright = 0;
              var offset = 0;

              do {
                offset++;
                if (x - offset < 0) {
                  // left edge
                  gapleft = 9999;
                } else if (pixels[x - offset][y] != 0) {
                  // non air pixel on the left
                  gapleft = 9999;
                } else if (pixels[x - offset][y + 1] == 0) {
                  // gapleft set to the distance to the air pixel on the left one row down
                  gapleft = offset;
                }
              } while (gapleft == 0);

              offset = 0;

              do {
                offset++;
                if (x + offset > pixelSideCount - 1) {
                  // right edge
                  gapright = 9999;
                } else if (pixels[x + offset][y] != 0) {
                  // non air pixel on the right
                  gapright = 9999;
                  //} else if (pixels[x+offset][y+1] != 0 && pixels[x+offset][y+1] != 3) { // non air or water pixel on the right one row down
                  //  gapright = 9999;
                } else if (pixels[x + offset][y + 1] == 0) {
                  // gapright set to the distance to the air pixel on the right one row down
                  gapright = offset;
                }
              } while (gapright == 0);

              if (gapleft == 9999 && gapright == 9999) {
                pixelData[x][y] = replaceChar(pixelData[x][y], 2, "2"); // hibernate - redundant?
              } else if (gapleft < gapright) {
                pixelData[x][y] = replaceChar(pixelData[x][y], 2, "0"); // left
              } else if (gapright <= gapleft) {
                pixelData[x][y] = replaceChar(pixelData[x][y], 2, "1"); // right
              } else
                pixelData[x][y] = replaceChar(
                  pixelData[x][y],
                  2,
                  rand(2).toString
                ); //gapleft = gapright, so go in random direction

              if (pixelData[x][y].charAt(2) == "0") {
                //left
                if (x != 0) {
                  if (pixels[x - 1][y] == 0) {
                    switchPixels(x - 1, y, x, y);
                  } else {
                  }
                }
              } else if (pixelData[x][y].charAt(2) == "1") {
                //right
                if (x != pixelSideCount - 1) {
                  if (pixels[x + 1][y] == 0) {
                    switchPixels(x + 1, y, x, y);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  window.requestAnimationFrame(tick);
}

function setSelected(type) {
  placeType = type;
}

document.body.onkeyup = function (e) {
  if (e.keyCode == 32) {
    togglePause();
  }
};

function togglePause() {
  PAUSE = !PAUSE;
  if (PAUSE) {
    document.getElementById("pauseBtn").innerHTML = "<st>5 </st>Paused";
  } else {
    document.getElementById("pauseBtn").innerHTML =
      "<st>5 </st>Press space or press this to pause";
  }
}

function setPixel(x, y, set, createNewData) {
  pixels[x][y] = set;
  pixelData[x][y] = replaceChar(pixelData[x][y], 3, "1");
  if (createNewData) {
    if (set == 3) {
      pixelData[x][y] = createMetadata(true);
    } else {
      pixelData[x][y] = createMetadata(false);
    }
  }
  g.fillStyle = colours[set];
  g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function switchPixels(x1, y1, x2, y2) {
  //replaceChar(pixelData[x1][y1], 3, "1");
  //replaceChar(pixelData[x2][y2], 3, "1");
  let origData = pixelData[x1][y1];
  let origPixel = pixels[x1][y1];
  setPixel(x1, y1, pixels[x2][y2], false);
  pixelData[x1][y1] = pixelData[x2][y2];
  setPixel(x2, y2, origPixel, false);
  pixelData[x2][y2] = origData.toString();
}

function replaceChar(string, i, char) {
  return string.substring(0, i) + char + string.substring(i + 1);
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

function createMetadata(isWater) {
  let data = "";
  if (isWater) {
    data = "00" + rand(2) + "0";
  } else {
    data = "0000";
  }
  return data.toString();
}

function reset() {
  for (let x = 0; x < pixels.length; x++) {
    for (let y = 0; y < pixels[0].length; y++) {
      setPixel(x, y, 0, true);
    }
  }
}

tick();
window.requestAnimationFrame(tick);

window.addEventListener("mousemove", (event) => {
  mouseX = event.clientX;
  mcx = mouseX - 10;
  mouseY = event.clientY;
  mcy = mouseY - 190;
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
