var table = document.getElementById("table");
const elementSize = 70;
const elementMargin = 4;
const skip = elementMargin + elementSize;
var SECRET_ELEMENT = -1;
var farthestDistance = -1;
var guesses = 0;
var showNumbers = false;
var showAbbreviations = false;
var shownCharacters = 0;
var revealAnswer = 0;
table.width = 18 * elementSize + 18 * elementMargin;
table.height = 9 * elementSize + 18 * elementMargin + elementSize / 8; // add that extra margin because of the space between the lanthanides and main area

const elements=[["HYDROGEN"],["HELIUM"],["LITHIUM"],["BERYLLIUM"],["BORON"],["CARBON"],["NITROGEN"],["OXYGEN"],["FLUORINE"],["NEON"],["SODIUM"],["MAGNESIUM"],["ALUMINUM","ALUMINIUM"],["SILICON"],["PHOSPHORUS"],["SULFUR","SULPHUR"],["CHLORINE"],["ARGON"],["POTASSIUM"],["CALCIUM"],["SCANDIUM"],["TITANIUM"],["VANADIUM"],["CHROMIUM"],["MANGANESE"],["IRON"],["COBALT"],["NICKEL"],["COPPER"],["ZINC"],["GALLIUM"],["GERMANIUM"],["ARSENIC"],["SELENIUM"],["BROMINE"],["KRYPTON"],["RUBIDIUM"],["STRONTIUM"],["YTTRIUM"],["ZIRCONIUM"],["NIOBIUM"],["MOLYBDENUM"],["TECHNETIUM"],["RUTHENIUM"],["RHODIUM"],["PALLADIUM"],["SILVER"],["CADMIUM"],["INDIUM"],["TIN"],["ANTIMONY"],["TELLURIUM"],["IODINE"],["XENON"],["CESIUM","CAESIUM"],["BARIUM"],["LANTHANUM"],["CERIUM"],["PRASEODYMIUM"],["NEODYMIUM"],["PROMETHIUM"],["SAMARIUM"],["EUROPIUM"],["GADOLINIUM"],["TERBIUM"],["DYSPROSIUM"],["HOLMIUM"],["ERBIUM"],["THULIUM"],["YTTERBIUM"],["LUTETIUM"],["HAFNIUM"],["TANTALUM"],["TUNGSTEN"],["RHENIUM"],["OSMIUM"],["IRIDIUM"],["PLATINUM"],["GOLD"],["MERCURY"],["THALLIUM"],["LEAD"],["BISMUTH"],["POLONIUM"],["ASTATINE"],["RADON"],["FRANCIUM"],["RADIUM"],["ACTINIUM"],["THORIUM"],["PROTACTINIUM"],["URANIUM"],["NEPTUNIUM"],["PLUTONIUM"],["AMERICIUM"],["CURIUM"],["BERKELIUM"],["CALIFORNIUM"],["EINSTEINIUM"],["FERMIUM"],["MENDELEVIUM"],["NOBELIUM"],["LAWRENCIUM"],["RUTHERFORDIUM"],["DUBNIUM"],["SEABORGIUM"],["BOHRIUM"],["HASSIUM"],["MEITNERIUM"],["DARMSTADTIUM"],["ROENTGENIUM"],["COPERNICIUM"],["NIHONIUM"],["FLEROVIUM"],["MOSCOVIUM"],["LIVERMORIUM"],["TENNESSINE"],["OGANESSON"]];

const abbreviations=["H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar","K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr","Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe","Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu","Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn","Fr","Ra","Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr","Rf","Db","Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og",];


var elementData = new Array(0);
var added = false;

var revealedElements = new Array(118);
var lines = new Array(8); //connectors for lanthanides and actinides

g = table.getContext("2d");
g.strokeStyle = "rgb(150, 150, 150)";
g.lineWidth = 1;
g.font = "small-caps 12px Courier New";

g.beginPath();
g.clearRect(0, 0, table.width, table.height);
var x = 0;
var y = 0;
var i = 0;

//1
createElement(1, x, y);
x = table.width - skip;
createElement(2, x, y);
//2
x = 0;
y += skip;
createElement(3, x, y);
x += skip;
createElement(4, x, y);
i = 5;
for (x = table.width - 6 * skip; i < 5 + 6; x += skip) {
  createElement(i, x, y);
  i++;
}
//3
x = 0;
y += skip;
createElement(11, x, y);
x += skip;
createElement(12, x, y);
i = 13;
for (x = table.width - 6 * skip; i < 13 + 6; x += skip) {
  createElement(i, x, y);
  i++;
}
//4, 5
i = 19;
for (let j = 0; j < 2; j++) {
  y += skip;
  for (x = 0; i < 19 + j * 18 + 18; x += skip) {
    createElement(i, x, y);
    i++;
  }
}
//6
y += skip;
x = 0;
createElement(55, x, y);
x += skip;
createElement(56, x, y);
lines[0] = x + elementSize * 1.5;
lines[1] = y + elementSize / 2;
x += skip;
x += skip;
i = 72;
for (x = table.width - 15 * skip; i < 72 + 15; x += skip) {
  createElement(i, x, y);
  i++;
}
//7
y += skip;
x = 0;
createElement(87, x, y);
x += skip;
createElement(88, x, y);
lines[4] = x + elementSize * 1.5;
lines[5] = y + elementSize / 2;
x += skip;
x += skip;
i = 104;
for (x = table.width - 15 * skip; i < 104 + 15; x += skip) {
  createElement(i, x, y);
  i++;
}
//lanthanide series
y += skip + elementSize / 8;
i = 57;
lines[2] = (table.width - 15 * skip) / 2;
lines[3] = y + elementSize / 2;
for (x = 0 + (table.width - 15 * skip) / 2; i < 57 + 15; x += skip) {
  createElement(i, x, y);
  i++;
}
//actinide series
y += skip;
i = 89;
lines[6] = (table.width - 15 * skip) / 2;
lines[7] = y + elementSize / 2;
for (x = 0 + (table.width - 15 * skip) / 2; i < 89 + 15; x += skip) {
  createElement(i, x, y);
  i++;
}
added = true;
farthestDistance = getDistance(getElementIn(1), getElementIn(118));

g.stroke();

resetGame();

function drawTable() {
  g.beginPath();
  g.clearRect(0, 0, table.width, table.height);
  for (let m = 0; m < 118; m++) {
    g.font = "small-caps 10px Courier New";
    g.strokeStyle = "rgb(150, 150, 150)";
    g.lineWidth = 1;
    drawElement(m, elementData[m].x, elementData[m].y);
  }
  g.strokeStyle = "rgb(220, 220, 220)";
  g.font = "small-caps 85px Courier New";
  g.strokeText("Guesses: " + guesses, skip * 4, skip * 1.6);
  g.lineWidth = 3;
  g.strokeStyle = "rgb(220, 220, 220, 0.3)";
  g.moveTo(lines[0], lines[1]);
  g.lineTo(lines[2], lines[3]);
  g.moveTo(lines[4], lines[5]);
  g.lineTo(lines[6], lines[7]);
  g.stroke();

  //console.log("Secret element: " + SECRET_ELEMENT + ": " + elements[SECRET_ELEMENT]);
}

function createElement(id, x, y) {
  elementData.push({ id, x, y });
}

function drawElement(id, x, y) {
  //id is the number in the array that is currently being drawn
  g.strokeRect(x, y, elementSize, elementSize);

  if (revealedElements[id] == true || revealAnswer == 2) {
    if (id < 119 && id > -1) {
      g.fillStyle =
        "rgb(" +
        ((farthestDistance -
          getDistance(getElementIn(SECRET_ELEMENT + 1), id)) /
          farthestDistance) *
          255 +
        ", " +
        (getDistance(getElementIn(SECRET_ELEMENT + 1), id) / farthestDistance) *
          150 +
        ", " +
        (getDistance(getElementIn(SECRET_ELEMENT + 1), id) / farthestDistance) *
          255 +
        ")";

      g.fillRect(x, y, elementSize, elementSize);
      g.strokeStyle = "rgb(30, 30, 30)";
      g.strokeText(elements[elementData[id].id - 1][0], x + 2, y + 20);
      g.strokeText(elementData[id].id, x + 2, y + 10);
      g.font = "small-caps 30px Courier New";
      g.strokeStyle = "rgb(255, 255, 255, 0.6)";
      g.strokeText(abbreviations[elementData[id].id - 1], x + 20, y + 45);
    }
  } else {
    if (showNumbers) {
      g.strokeText(elementData[id].id, x + 2, y + 10);
    }
    if (shownCharacters > 0) {
      g.strokeText(
        elements[elementData[id].id - 1][0].slice(0, shownCharacters),
        x + 2,
        y + 20
      );
    }
    if (showAbbreviations) {
      g.font = "small-caps 30px Courier New";
      g.strokeStyle = "rgb(255, 255, 255, 0.6)";
      g.strokeText(abbreviations[elementData[id].id - 1], x + 20, y + 45);
    }
  }
  if (elementData[id].id - 1 == SECRET_ELEMENT && revealAnswer > 0) {
    g.lineWidth = 3;
    g.strokeStyle = "rgb(255, 255, 255)";
    g.strokeRect(x, y, elementSize, elementSize);
  }
}

var input = document.getElementById("elementIn");
input.addEventListener("keyup", function () {
  for (let k = 0; k < elements.length; k++) {
    let tryElement = getElementIn(k + 1);
    if (elements[k].includes(input.value.toUpperCase())) {
      if (revealedElements[tryElement] != true) {
        revealedElements[tryElement] = true;
        guesses++;
        drawTable();
        if (k == SECRET_ELEMENT) {
          win();
        }
      }
      input.value = "";
    }
  }
});

function getDistance(id1_, id2_) {
  //takes in item as in elements array
  var id1 = id1_;
  var id2 = id2_;
  var x1 = elementData[id1].x + elementSize / 2;
  var y1 = elementData[id1].y + elementSize / 2;
  var x2 = elementData[id2].x + elementSize / 2;
  var y2 = elementData[id2].y + elementSize / 2;

  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getElementIn(element) {
  //get the position of a specific element in the display array
  for (let q = 0; q < elementData.length; q++) {
    if (elementData[q].id == element) {
      return q;
    }
  }
}

function resetGame() {
  revealAnswer = 0;
  guesses = 0;
  document.getElementById("element_win").classList.remove("element_win_show");
  revealedElements = new Array(118);

  SECRET_ELEMENT = rand(118);

  drawTable();
}

function win() {
  if (revealAnswer < 2) {
    document.getElementById("popupGuesses").innerHTML = "Guesses: " + guesses;
    document.getElementById("element_win").classList.add("element_win_show");
  }
}

function closeWin() {
  resetGame();
}
function rand(max) {
  return Math.floor(Math.random() * max);
}

function reveal() {
  if (revealAnswer < 2) {
    revealAnswer += 1;
  }
  drawTable();
}

function toggleNumbers() {
  showNumbers = !showNumbers;
  if (showNumbers) {
    document.getElementById("numT").classList.add("tbSelected");
  } else {
    document.getElementById("numT").classList.remove("tbSelected");
  }
  drawTable();
}

function toggleCharacters() {
  shownCharacters++;
  if (shownCharacters > 3) shownCharacters = 0;
  if (shownCharacters != 0) {
    document.getElementById("charT").classList.add("tbSelected");
  } else {
    document.getElementById("charT").classList.remove("tbSelected");
  }
  drawTable();
}

function toggleAbbreviations() {
  showAbbreviations = !showAbbreviations;
  if (showAbbreviations) {
    document.getElementById("abbT").classList.add("tbSelected");
  } else {
    document.getElementById("abbT").classList.remove("tbSelected");
  }
  drawTable();
}
