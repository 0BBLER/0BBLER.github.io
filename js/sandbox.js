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
  "#ffde3b",
];
const spreadFireCol = "#ff7f00";
const charredWoodCol = "#261c00";
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
var airBtn = document.getElementById("air");
var rockBtn = document.getElementById("rock");
var sandBtn = document.getElementById("sand");
var waterBtn = document.getElementById("water");
var woodBtn = document.getElementById("wood");
var fireBtn = document.getElementById("fire");
var PAUSE = false;
var tickCounter = 0;
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
 * e: type data [fire source:0,fire spread:1,wood normal:0,wood charred:1]
 */
var game = document.getElementById("game");
var mouseX = 0;
var mouseY = 0;
var mcx = 0; //mouse canvas x
var mcy = 0; //mouse canvas y
var mousedown = false;
var placeType = 2;
sandBtn.classList.add("tbSelected");
var brushSize = 3;

document.getElementById("brushSizer").innerHTML =
  '<st>5 </st>Brush size: <tb onclick="changeBrushSize(-1)">&lt;</tb> ' +
  brushSize +
  ' <tb onclick="changeBrushSize(1)">&gt;</tb>';

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
        //make sure placement is only on air unless it's fire or water
        (pixels[hoverX + circlePoints[i].x][hoverY + circlePoints[i].y] == 0 ||
          placeType == 0 ||
          (pixels[hoverX + circlePoints[i].x][hoverY + circlePoints[i].y] ==
            6 &&
            placeType == 8) ||
          (pixels[hoverX + circlePoints[i].x][hoverY + circlePoints[i].y] ==
            8 &&
            placeType == 3))
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
          // all fire placed is source fire
          if (
            pixels[hoverX + circlePoints[i].x][hoverY + circlePoints[i].y] == 6
          ) {
            setPixel(
              hoverX + circlePoints[i].x,
              hoverY + circlePoints[i].y,
              placeType,
              true,
              0
            );
          }
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
              // try commenting out the code below - why doesn't this eliminate the issue with the offset water???
              /*if (current == 3) {
                pixelData[x][y] = replaceChar(
                  pixelData[x][y],
                  2,
                  "1"
                );
              } */
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
              } else if (gapright < gapleft) {
                pixelData[x][y] = replaceChar(pixelData[x][y], 2, "1"); // right
              } else
                pixelData[x][y] = replaceChar(
                  pixelData[x][y],
                  2,
                  ((tickCounter + 1) % 2).toString()
                ); //gapleft = gapright, so go in direction against the scan, though it doesn't seem to matter

              if (pixelData[x][y].charAt(2) == "0") {
                //left flow
                if (x != 0) {
                  if (pixels[x - 1][y] == 0) {
                    switchPixels(x - 1, y, x, y);
                  }
                }
              } else if (pixelData[x][y].charAt(2) == "1") {
                //right flow
                if (x != pixelSideCount - 1) {
                  if (pixels[x + 1][y] == 0) {
                    switchPixels(x + 1, y, x, y);
                  }
                }
              }
              //if (pixels[x][y + 1] == 0) {
              //  switchPixels(x, y + 1, x, y);
              //}
            }
          } else if (current == 8) {
            // fire stuff
            let stillFire = true;
            let left = x == 0;
            let right = x == pixelSideCount - 1;
            let bottom = y == pixelSideCount - 1;
            let top = y == 0;
            if (pixelData[x][y].charAt(4) == "1") {
              let action = rand(1000);
              // test for it is a spread fire, if so, try spreading
              // also test for getting watered

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

              fireAction(action, x, y, left, right, bottom, top, 1);
            } else {
              // source fire
              // test for water
              let action = rand(1000);
              if (!left) {
                if (pixels[x - 1][y] == 3) {
                  setPixel(x, y, 6, true, 1);
                  stillFire = false;
                }
              }
              if (!right && stillFire) {
                if (pixels[x + 1][y] == 3) {
                  setPixel(x, y, 6, true, 1);
                  stillFire = false;
                }
              }
              if (!top && stillFire) {
                if (pixels[x][y - 1] == 3) {
                  setPixel(x, y, 6, true, 1);
                  stillFire = false;
                }
              }
              if (!bottom && stillFire) {
                if (pixels[x][y + 1] == 3) {
                  setPixel(x, y, 6, true, 1);
                  stillFire = false;
                }
              }
              fireAction(action, x, y, left, right, bottom, top, 0);
            }
          }
        }
      }
    }
  }

  window.requestAnimationFrame(tick);
}

function fireAction(action, x, y, left, right, bottom, top, fireType) {
  if (fireType == 0) {
    //source fire
    if (action < 10) {
      //spread through wood
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
      if (action < 13) {
        //burn out
        setPixel(x, y, 0, true);
      } else {
        if (action < 500) {
          //spread by spread fire
          if (!left) {
            if (pixels[x - 1][y] == 0) {
              setPixel(x - 1, y, 8, true, 1);
            }
          }
          if (!right) {
            if (pixels[x + 1][y] == 0) {
              setPixel(x + 1, y, 8, true, 1);
            }
          }
          if (!top) {
            if (pixels[x][y - 1] == 0) {
              setPixel(x, y - 1, 8, true, 1);
            }
          }
        }
      }
    }
  } else {
    //spread fire
    let nearSource = false;
    if (!left) {
      if (pixels[x - 1][y] == 8) {
        if (pixelData[x - 1][y].charAt(4) == 0) {
          nearSource = true;
        }
      }
    }
    if (!right) {
      if (pixels[x + 1][y] == 8) {
        if (pixelData[x + 1][y].charAt(4) == 0) {
          nearSource = true;
        }
      }
    }
    if (!top) {
      if (pixels[x][y - 1] == 8) {
        if (pixelData[x][y - 1].charAt(4) == 0) {
          nearSource = true;
        }
      }
    }
    if (!bottom) {
      if (pixels[x][y + 1] == 8) {
        if (pixelData[x][y + 1].charAt(4) == 0) {
          nearSource = true;
        }
      }
    }
    if (action > 99 && action < 115) {
      //spread
      if (rand(10) < 4) {
        //higher chance to spread up
        if (!top) {
          if (pixels[x][y - 1] == 0) {
            setPixel(x, y - 1, 8, true, 1);
          }
        }
      } else {
        switch (rand(3)) {
          case 0:
            if (!left) {
              if (pixels[x - 1][y] == 0) {
                setPixel(x - 1, y, 8, true, 1);
              }
            }
            break;
          case 1:
            if (!right) {
              if (pixels[x + 1][y] == 0) {
                setPixel(x + 1, y, 8, true, 1);
              }
            }
            break;
          case 2:
            if (!bottom) {
              if (pixels[x][y + 1] == 0) {
                setPixel(x, y + 1, 8, true, 1);
              }
            }
            break;
        }
      }
    } else if (action > 99 && action < 117) {
      //spread to other logs, very small chance or it's own log will be incinerated
      if (!top) {
        if (pixels[x][y - 1] == 6) {
          setPixel(x, y - 1, 8, true, 0);
        }
      }
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
      if (!bottom) {
        if (pixels[x][y + 1] == 6) {
          setPixel(x, y + 1, 8, true, 0);
        }
      }
    }
    if (!nearSource) {
      //burn out
      if (action < 30) {
        setPixel(x, y, 0, true);
      }
    }
  }
}

function setSelected(type) {
  switch (placeType) {
    case 0:
      airBtn.classList.remove("tbSelected");
      break;
    case 1:
      rockBtn.classList.remove("tbSelected");
      break;
    case 2:
      sandBtn.classList.remove("tbSelected");
      break;
    case 3:
      waterBtn.classList.remove("tbSelected");
      break;
    case 6:
      woodBtn.classList.remove("tbSelected");
      break;
    case 8:
      fireBtn.classList.remove("tbSelected");
      break;
  }
  placeType = type;
  switch (placeType) {
    case 0:
      airBtn.classList.add("tbSelected");
      break;
    case 1:
      rockBtn.classList.add("tbSelected");
      break;
    case 2:
      sandBtn.classList.add("tbSelected");
      break;
    case 3:
      waterBtn.classList.add("tbSelected");
      break;
    case 6:
      woodBtn.classList.add("tbSelected");
      break;
    case 8:
      fireBtn.classList.add("tbSelected");
      break;
  }
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
  let origColor = colours[set];
  let col = colours[set];

  if (set == 8) {
    //change color for spreading fire
    if (typeData == 1) {
      origColor = spreadFireCol;
      col = spreadFireCol;
    }
  }
  if (set == 6) {
    //change color for charred wood
    if (typeData == 1) {
      origColor = charredWoodCol;
      col = charredWoodCol;
    }
  }

  col = replaceChar(
    col,
    1,
    changeHex(origColor.charAt(1), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    2,
    changeHex(origColor.charAt(2), -pixelData[x][y].charAt(1))
  );
  col = replaceChar(
    col,
    3,
    changeHex(origColor.charAt(3), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    4,
    changeHex(origColor.charAt(4), -pixelData[x][y].charAt(1))
  );
  col = replaceChar(
    col,
    5,
    changeHex(origColor.charAt(5), -pixelData[x][y].charAt(0))
  );
  col = replaceChar(
    col,
    6,
    changeHex(origColor.charAt(6), -pixelData[x][y].charAt(1))
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
window.addEventListener("touchstart", () => {
  mousedown = true;
});
window.addEventListener("touchend", () => {
  mousedown = false;
});

function changeBrushSize(amnt) {
  if (brushSize + changeBrushSize < 1) {
    brushSize = 0;
  } else {
    brushSize += amnt;
  }
  document.getElementById("brushSizer").innerHTML =
    '<st>5 </st>Brush size: <tb onclick="changeBrushSize(-1)">&lt;</tb> ' +
    brushSize +
    ' <tb onclick="changeBrushSize(1)">&gt;</tb>';
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
