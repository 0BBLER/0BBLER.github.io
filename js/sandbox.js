const gamesize = 900;
const pixelSize = 9; //explosive, do not touch
const pixelSideCount = Math.round(gamesize / pixelSize);
const canvasYCoord = 210;
const colours = [
  "#9fffff",
  "#a6a6a6",
  "#dec400",
  "#1117c2",
  "#c8b378",
  "#a18852",
  "#5c3f00",
  "#239906",
  "#ff7f00",
];
const hex = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];
var PAUSE = false;
var tickCounter = 1;
var pixels = [];
var pixelData = [];
/**
 * PIXELDATA ENCODING
 *
 * 01234
 * abcde
 *
 * ab: hex number storing possible colour shift
 * c: int storing set water flow direction [0:left,1:right,2:hibernation]
 * d: updated flag [0:false,1:true]
 * e: type data [fire source:0,fire spread:1,future plant stuff]
 */
var game = document.getElementById("game");
var mouseX = 0;
var mouseY = 0;
var mcx = 0; //mouse canvas x
var mcy = 0; //mouse canvas y
var mousedown = false;
var placeType = 2;
var brushSize = 4;
var circlePoints = getCircleCoords(brushSize);
game.width = gamesize;
game.height = gamesize;
game.style.top = canvasYCoord + "px";

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
 * 8: fire - spread
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
    for (let i = 0; i < circlePoints.length; i++) {
      if (
        hoverX + circlePoints[i].x < pixelSideCount &&
        hoverX + circlePoints[i].x > -1 &&
        hoverY + circlePoints[i].y < pixelSideCount &&
        hoverY + circlePoints[i].y > -1 &&
        (pixels[hoverX + circlePoints[i].x][hoverY + circlePoints[i].y] == 0 ||
          placeType == 0)
      ) {
        if (placeType == 2 || placeType == 3) {
          // make sand and water placement grainy
          if (rand(10) < 4) {
            setPixel(
              hoverX + circlePoints[i].x,
              hoverY + circlePoints[i].y,
              placeType,
              true
            );
          }
        } else if (placeType == 8) {
          // all fire placement is spread fire
          setPixel(
            hoverX + circlePoints[i].x,
            hoverY + circlePoints[i].y,
            placeType,
            true,
            1
          );
        } else {
          setPixel(
            hoverX + circlePoints[i].x,
            hoverY + circlePoints[i].y,
            placeType,
            true
          );
        }
      }
    }
  }
  if (!PAUSE) {
    for (let y = pixelSideCount - 1; y > -1; y--) {
      for (
        // alternating side simulations
        let x = (pixelSideCount - 1) * (tickCounter % 2);
        x * (tickCounter % 2) + pixelSideCount * ((tickCounter + 1) % 2) >
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
            } else if (current == 3) {
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
          } else if (current == 8) {
            // fire stuff
            let stillFire = true;
            let left = x == 0;
            let right = x == pixelSideCount - 1;
            let bottom = y == pixelSideCount - 1;
            let top = y == 0;
            if (pixelData[x][y].charAt(4) == "1") {
              // test for it is a spread fire, if so, try spreading
              // also test for getting watered
              let nearWood = false;
              if (!left) {
                if (pixels[x - 1][y] == 6) {
                  console.log("created fire");
                  nearWood = true;
                  setPixel(x - 1, y, 8, false, 0);
                }
                if (pixels[x - 1][y] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!right && stillFire) {
                if (pixels[x + 1][y] == 6) {
                  nearWood = true;
                  setPixel(x + 1, y, 8, false, 0);
                }
                if (pixels[x + 1][y] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!top && stillFire) {
                if (pixels[x][y - 1] == 6) {
                  nearWood = true;
                  setPixel(x, y - 1, 8, false, 0);
                }
                if (pixels[x][y - 1] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!bottom && stillFire) {
                if (pixels[x][y + 1] == 6) {
                  nearWood = true;
                  setPixel(x, y + 1, 8, false, 0);
                }
                if (pixels[x][y + 1] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!nearWood) {
                // if it is not near wood, go out
                setPixel(x, y, 0, true);
              }
            } else {
              // source fire
              // test for water
              let action = rand(1000);
              let stillfire = true;
              if (!left) {
                if (pixels[x - 1][y] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!right && stillFire) {
                if (pixels[x + 1][y] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!top && stillFire) {
                if (pixels[x][y - 1] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              if (!bottom && stillFire) {
                if (pixels[x][y + 1] == 3) {
                  setPixel(x, y, 0, true);
                  stillFire = false;
                }
              }
              fireAction(action, x, y, left, right, bottom, top);
            }
          }
        }
      }
    }
  }

  window.requestAnimationFrame(tick);
}

function fireAction(action, x, y, left, right, bottom, top) {
  if (action < 2) {
    //spread
    if (!left) {
      if (pixels[x - 1][y] == 6) {
        setPixel(x - 1, y, 8, true, 0);
      }
    }
    if (!right) {
      if (pixels[x + 1][y] == 6) {
        setPixel(x + 1, y, 8, true, 0);
      }
    }
    if (!top) {
      if (pixels[x][y - 1] == 6) {
        setPixel(x, y - 1, 8, true, 0);
      }
    }
    if (!bottom) {
      if (pixels[x][y + 1] == 6) {
        setPixel(x, y + 1, 8, true, 0);
      }
    }
  } else {
    if (action < 2) {
      //burn out
      setPixel(x, y, 0, true);
    }
  }
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

function setPixel(x, y, set, createNewData, typeData) {
  pixels[x][y] = set;
  //pixelData[x][y] = replaceChar(pixelData[x][y], 3, "1");
  if (createNewData) {
    if (set == 3) {
      pixelData[x][y] = createMetadata(3);
    } else if (set == 2 || set == 8) {
      pixelData[x][y] = createMetadata(5);
    } else if (set == 1 || set == 6) {
      pixelData[x][y] = createMetadata(2);
    } else {
      pixelData[x][y] = createMetadata(0);
    }
  }
  if (typeData != null && typeData != undefined) {
    pixelData[x][y] = replaceChar(pixelData[x][y], 4, typeData.toString());
  }
  let col = colours[set];

  col = replaceChar(
    col,
    1,
    changeHex(colours[set].charAt(1), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    2,
    changeHex(colours[set].charAt(2), -pixelData[x][y].charAt(1))
  );
  col = replaceChar(
    col,
    3,
    changeHex(colours[set].charAt(3), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    4,
    changeHex(colours[set].charAt(4), -pixelData[x][y].charAt(1))
  );
  col = replaceChar(
    col,
    5,
    changeHex(colours[set].charAt(5), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    6,
    changeHex(colours[set].charAt(6), -pixelData[x][y].charAt(1))
  );

  g.fillStyle = col;
  g.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function switchPixels(x1, y1, x2, y2) {
  let origData = pixelData[x1][y1];
  let origPixel = pixels[x1][y1];
  pixelData[x1][y1] = pixelData[x2][y2];
  setPixel(x1, y1, pixels[x2][y2], false);
  pixelData[x2][y2] = origData.toString();
  setPixel(x2, y2, origPixel, false);
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

function createMetadata(randAmount) {
  let data = "";
  if (randAmount > 0) {
    data =
      rand(randAmount).toString() +
      rand(10).toString() +
      rand(2).toString() +
      "00";
  } else {
    data = "00000";
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
  mcy = mouseY - canvasYCoord + document.documentElement.scrollTop;
});

window.addEventListener("mousedown", () => {
  mousedown = true;
});
window.addEventListener("mouseup", () => {
  mousedown = false;
});

function changeBrushSize(amnt) {
  if (brushSize + changeBrushSize < 1) {
    brushSize = 0;
  } else {
    brushSize += amnt;
  }
  document.getElementById("brushSizer").innerHTML =
    '<st>5 </st>Brush size: <sbt onclick="changeBrushSize(-1)">&lt;</sbt> ' +
    brushSize +
    ' <sbt onclick="changeBrushSize(1)">&gt;</sbt>';
  circlePoints = getCircleCoords(brushSize);
}

function changeHex(val, amnt) {
  let start = hex.indexOf(val);
  if (start + amnt < 0) {
    return hex[0];
  }
  if (start + amnt > hex.length - 1) {
    return hex[hex.length - 1];
  }
  return hex[start + amnt];
}

function rand(max) {
  return Math.floor(Math.random() * max);
}
