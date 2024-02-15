var questions = [];
var questionElements = [];
var categories = ["category", "math", "geography", "science"];
var selectedCategories = [true, true, true, true];
var givenAnswers = [];
var selectedNameCategories = ["category", "math", "geography", "science"];
var editorPane = document.getElementById("questionEditor");
var modeBtn = document.getElementById("modeButton");
var resultsButton = document.getElementById("resultsButton");
var popup = document.getElementById("popup");
var infoBtn = document.getElementById("infoBtn");
var testQuestions = [];
var onScreenCheckboxes = [];
var shuffledAnswerKey = [];
var questionIdx = 0;
var isTestMode = false;
var askingQuestion = false;
var ansRevealed = false;
var resultsRevealed = false;
var currentCard;
var goBtn;
var cardAmntPerRow, createButton;
var selectedCategoryPrevVal = "";
var localSave = localStorage.getItem("studySaveFile");
var infoTooltip = document.getElementById("infoTooltip");
var availableCategories = [];

window.addEventListener("keydown", (e) => {
  if (e.key == "Escape") {
    removePopup();
  }
});

infoTooltip.style.opacity = "0";
infoTooltip.style.visibility = "hidden";

loadLocalStorage();

popup.style.left = "-400px";
popup.style.opacity = "1";
modeBtn.innerHTML = "Test me";
resultsButton.style.opacity = "0";

document.body.addEventListener("keydown", (e) => {
  if (!isTestMode) return;

  if (e.key == "ArrowRight" && !resultsRevealed) {
    nextQuestion();
  }
  if (e.key == "ArrowLeft") {
    prevQuestion();
  }

  if ((e.key == "ArrowUp" || e.key == "ArrowDown" || e.key == "Enter") && !resultsRevealed) {
    if (e.key == "Enter" && ansRevealed) {
      nextQuestion();
    }
    ansRevealed = !ansRevealed;
    if (ansRevealed) {
      revealAns();
    } else {
      createTestQuestion();
    }
  }
});

infoBtn.addEventListener("click", () => {
  popup.innerHTML = "";
  let title = document.createElement("p");
  title.innerHTML = "Info";
  title.style.fontSize = "30px";
  title.style.fontWeight = "bold";
  let someText = document.createElement("p");
  someText.innerHTML = "Create/delete questions using the obvious buttons<br>";
  someText.innerHTML += "Right click multiple choice options to mark them as correct<br>";
  someText.innerHTML += "Sort your questions into categories if you want<br>";
  someText.innerHTML += 'Press the "test me" button when you are ready<br><br>';
  someText.innerHTML += "DURING TEST MODE:<br>";
  someText.innerHTML += "Press left/right arrow keys to move between cards<br>";
  someText.innerHTML += "Press up/down arrow keys to compare you answer<br>";
  someText.innerHTML += "The enter key is best though, as it moves on once the answer is revealed<br>";
  someText.innerHTML += 'Also, the "view results" button will let you view your results<br><br>';
  someText.innerHTML += "Press Esc to close";
  someText.style.fontSize = "15px";

  popup.append(title);
  popup.append(someText);

  createPopup();
});

function toggleTest() {
  resultsButton.style.opacity = 0;
  if (isTestMode) {
    genQuestions();
    askingQuestion = false;
    currentCard.remove();
    if (goBtn != undefined) {
      goBtn.remove();
    }
    modeBtn.innerHTML = "Test me";

    isTestMode = false;
  } else {
    isTestMode = true;
    modeBtn.innerHTML = "Back to editor";

    availableCategories = [];

    categories.forEach((category) => {
      if (questions.map((x) => x.category).includes(category)) availableCategories.push(category);
    });

    for (let i = 0; i < questionElements.length; i++) {
      questionElements[i].remove();
    }
    let categoriesGood = false;
    for (let i = 0; i < selectedNameCategories.length; i++) {
      if (availableCategories.includes(selectedNameCategories[i])) {
        categoriesGood = true;
        break;
      }
    }
    if (availableCategories.length == 1) {
      selectedNameCategories = [];
      selectedNameCategories.push(availableCategories[0]);
      selectedCategories = new Array(categories.length);
      selectedCategories.fill(false);
      selectedCategories[categories.indexOf(availableCategories[0])] = true;
      setupTest();
    } else {
      if (availableCategories.length > 1 || selectedCategories.indexOf(true) == -1 || !categoriesGood) {
        getTestCategories();
      } else {
        setupTest();
      }
    }
  }
}

function getTestCategories() {
  if (currentCard != undefined) currentCard.remove();
  currentCard = document.createElement("div");
  currentCard.classList.add("bigCard");
  currentCard.style.width = window.innerWidth - 60 + "px";

  currentCard.append(createBigCardTitle("Select the categories you would like to study"));

  /*
  if (availableCategories.length < 2 && selectedNameCategories.length > 0) {
    currentCard.remove();
    setupTest();
    return;
  }
  */

  for (let i = 0; i < categories.length; i++) {
    let temp = document.createElement("div");
    let c = document.createElement("label");
    c.innerHTML = categories[i];
    c.style.fontSize = "30px";
    let box = document.createElement("input");
    box.type = "checkbox";
    box.style.transform = "scale(2)";
    box.style.margin = "10px";
    box.checked = selectedCategories[i];

    box.addEventListener("change", function (e) {
      selectedCategories[i] = box.checked;
      if (box.checked) {
        selectedNameCategories.push(c.innerHTML);
      } else {
        selectedNameCategories.splice(selectedNameCategories.indexOf(c.innerHTML), 1);
      }
    });

    temp.append(c);
    temp.append(box);
    currentCard.append(temp);
  }

  goBtn = document.createElement("btn");
  goBtn.classList.add("coolBtn");
  goBtn.innerHTML = "<br>Go!";
  goBtn.style.fontWeight = "bold";
  goBtn.style.lineHeight = "26px";
  goBtn.style.position = "absolute";
  goBtn.style.bottom = "20px";
  goBtn.style.right = "60px";

  goBtn.addEventListener("click", function (e) {
    let dummyTestQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      if (selectedNameCategories.includes(questions[i].category)) {
        dummyTestQuestions.push(questions[i]);
      }
    }
    if (dummyTestQuestions.length < 1) {
      let noQuestions = document.createElement("p");
      noQuestions.innerHTML = "There are no questions under the selected " + (selectedCategories.filter((el) => el).length == 1 ? "category." : "categories.");
      noQuestions.style.backgroundColor = "rgb(200,100,100)";
      currentCard.append(noQuestions);
      return;
    }

    isTestMode = true;
    setupTest();
    resultsButton.style.opacity = 1;
    goBtn.remove();
  });

  document.body.append(goBtn);
  document.body.append(currentCard);
}

function viewResults() {
  if (!isTestMode) return;
  if (!currentCard == undefined) givenAnswers[questionIdx] = currentCard.children[2].value;
  resultsRevealed = true;
  resultsButton.style.opacity = 0;
  currentCard.remove();
  currentCard = document.createElement("div");
  currentCard.classList.add("bigCard");
  currentCard.style.width = window.innerWidth - 60 + "px";

  currentCard.style.height = window.innerHeight + "px";
  currentCard.style.top = "20px";
  currentCard.style.position = "fixed";

  let answerTable = document.createElement("table");
  let t = document.createElement("tr");
  t.innerHTML = "Question";
  t.style.fontWeight = "bold";
  t.classList.add("answerTableRow");
  let given = document.createElement("th");
  given.innerHTML = "Provided Answer";
  t.append(given);
  let ans = document.createElement("th");
  ans.innerHTML = "Answer";
  t.append(ans);
  answerTable.append(t);
  for (let i = 0; i < testQuestions.length; i++) {
    let t = document.createElement("tr");
    t.innerHTML = testQuestions[i].question;
    t.classList.add("answerTableRow");
    if (testQuestions[i].type == "text") {
      if (testQuestions[i].answer == givenAnswers[i]) {
        t.style.backgroundColor = "rgb(100,200,100)";
      }
    } else if (testQuestions[i].type == "choice") {
      if (arrayEquals(givenAnswers[i], testQuestions[i].choice.correct)) {
        t.style.backgroundColor = "rgb(100,200,100)";
      }
    }
    let given = document.createElement("td");
    if (testQuestions[i].type == "text") {
      given.innerHTML = givenAnswers[i];
    } else if (testQuestions[i].type == "choice") {
      let givenAsText = [];
      if (givenAnswers[i] != "") {
        givenAnswers[i].map((x, i2) => {
          if (x) givenAsText.push(testQuestions[i].choice.options[i2]);
        });
      }
      given.innerHTML = givenAsText.toString();
    }
    t.append(given);
    let ans = document.createElement("td");
    if (testQuestions[i].type == "text") {
      ans.innerHTML = testQuestions[i].answer;
    } else if (testQuestions[i].type == "choice") {
      let ansAsText = [];
      testQuestions[i].choice.correct.map((x, i2) => {
        if (x) ansAsText.push(testQuestions[i].choice.options[i2]);
      });
      ans.innerHTML = ansAsText;
    }
    t.append(ans);
    answerTable.append(t);
  }
  answerTable.classList.add("answerTable");

  currentCard.append(createBigCardTitle("Results"));
  currentCard.append(answerTable);

  document.body.append(currentCard);
}

function arrayEquals(arr1, arr2) {
  if (arr1 == "" || arr2 == "") return false;
  if (arr1.every((c1, c2) => c1 === arr2[c2])) {
    return true;
  } else {
    return arr2.every((c1, c2) => c1 === arr1[c2]);
  }
}

function setupTest() {
  resultsButton.style.opacity = 1;
  testQuestions = [];

  questionIdx = 0;

  const duplicatedQuestions = JSON.parse(JSON.stringify(questions));
  for (let i = 0; i < questions.length; i++) {
    if (selectedNameCategories.includes(questions[i].category)) {
      testQuestions.push(duplicatedQuestions[i]);
      if (testQuestions.type == "choice") {
        testQuestions[i].choice.options = testQuestions[i].choice.options.removeUndefined();
      }
    }
  }

  givenAnswers = new Array(testQuestions.length);
  givenAnswers.fill("");

  shuffle(testQuestions);

  createTestQuestion();
}

function nextQuestion() {
  if (!isTestMode || !askingQuestion) return;

  if (questionIdx == testQuestions.length - 1) {
    viewResults();
    return;
  }

  if (questionIdx < testQuestions.length - 1) {
    questionIdx++;
  }
  createTestQuestion();
}

function prevQuestion() {
  if (!isTestMode || !askingQuestion) return;
  resultsRevealed = false;
  resultsButton.style.opacity = 1;
  if (questionIdx > 0) {
    questionIdx--;
  }
  createTestQuestion();
}

function revealAns() {
  if (!isTestMode || !askingQuestion) return;
  currentCard.children[1].remove();
  currentCard.children[1].remove();
  let reveal = document.createElement("div");
  reveal.append(createBigCardBody("Your answer:"));
  if (testQuestions[questionIdx].type == "text") {
    reveal.append(createBigCardBody(givenAnswers[questionIdx]));
  } else if (testQuestions[questionIdx].type == "choice") {
    let givenAsText = [];
    if (givenAnswers[questionIdx] != "") {
      givenAnswers[questionIdx].map((x, i2) => {
        if (x) givenAsText.push(testQuestions[questionIdx].choice.options[i2]);
      });
    }
    reveal.append(createBigCardBody(givenAsText.toString()));
  }
  reveal.append(createBigCardBody("\nAnswer:"));
  if (testQuestions[questionIdx].type == "text") {
    reveal.append(createBigCardBody(testQuestions[questionIdx].answer));
  } else if (testQuestions[questionIdx].type == "choice") {
    let ansAsText = [];
    questions[questionIdx].choice.correct.map((x, i2) => {
      if (x) ansAsText.push(questions[questionIdx].choice.options[i2]);
    });

    reveal.append(createBigCardBody(ansAsText.toString()));
  }
  currentCard.append(reveal);
}

function createTestQuestion() {
  if (!isTestMode) return;
  askingQuestion = true;
  if (currentCard != undefined) currentCard.remove();
  currentCard = document.createElement("div");
  currentCard.classList.add("bigCard");
  currentCard.style.width = window.innerWidth - 60 + "px";

  currentCard.append(createBigCardTitle(testQuestions[questionIdx].question));

  let idx = document.createElement("p");
  idx.classList.add("bigCardIndex");
  idx.innerText = questionIdx + 1 + "/" + testQuestions.length;
  currentCard.append(idx);

  if (testQuestions[questionIdx].type == "text") {
    let ans = document.createElement("textarea");
    ans.classList.add("bigTextarea");
    ans.placeholder = "Type your answer here";
    ans.value = givenAnswers[questionIdx];

    ans.addEventListener("keydown", () => {
      givenAnswers[questionIdx] = ans.value;
    });

    currentCard.append(ans);
    window.setTimeout(function () {
      ans.focus();
    }, 30);
  }
  if (testQuestions[questionIdx].type == "choice") {
    let choiceContainer = document.createElement("div");
    let blankAmnt = 0;
    for (let c = 0; c < 6; c++) {
      if (!testQuestions[questionIdx].choice.correct[c]) {
        blankAmnt++;
      }
    }
    let shuffledAnswers = [];
    testQuestions[questionIdx].choice.correct = testQuestions[questionIdx].choice.correct.removeUndefined();
    shuffledAnswerKey = testQuestions[questionIdx].choice.correct.removeUndefined();
    testQuestions[questionIdx].choice.options = testQuestions[questionIdx].choice.options.removeUndefined();
    for (let c = 0; c < 6; c++) {
      if (testQuestions[questionIdx].choice.options[c] != "" && testQuestions[questionIdx].choice.options[c] != undefined) {
        shuffledAnswers.push(testQuestions[questionIdx].choice.options[c]);
      }
    }
    testQuestions[questionIdx].choice.options = shuffle(shuffledAnswers, shuffledAnswerKey, givenAnswers[questionIdx]);
    testQuestions[questionIdx].choice.correct = shuffledAnswerKey;
    for (let c = 0; c < testQuestions[questionIdx].choice.options.length; c++) {
      if (testQuestions[questionIdx].choice.options[c] != "") {
        choiceContainer.append(createMultipleChoiceAnswer(shuffledAnswers[c], blankAmnt != 5, c, givenAnswers[questionIdx][c]));
      }
    }
    currentCard.append(choiceContainer);
  }

  document.body.append(currentCard);
}

function createMultipleChoiceAnswer(text, selectMultiple, id, checked) {
  let container = document.createElement("div");
  let box = document.createElement("input");
  box.type = "checkbox";
  if (checked) {
    box.checked = true;
  }
  container.style.textAlign = "left";
  container.classList.add("multipleChoiceContainer");

  container.addEventListener("click", (e) => {
    if (e.target.type !== "checkbox") {
      box.checked = !box.checked;
      if (box.checked && !selectMultiple) {
        clearOnScreenCheckboxes();
        box.checked = true;
      }
      givenAnswers[questionIdx] = onScreenCheckboxes.map((x) => x.checked);
    }
  });

  box.addEventListener("change", (e) => {
    if (box.checked && !selectMultiple) {
      clearOnScreenCheckboxes();
      box.checked = true;
    }
    givenAnswers[questionIdx] = onScreenCheckboxes.map((x) => x.checked);
  });

  box.classList.add("multipleChoiceCheckbox");
  let words = document.createElement("p");
  words.innerHTML = text;
  words.classList.add("multipleChoiceWords");

  container.append(box);
  container.append(words);
  onScreenCheckboxes[id] = box;
  return container;
}

function clearOnScreenCheckboxes() {
  for (let i = 0; i < onScreenCheckboxes.length; i++) {
    onScreenCheckboxes[i].checked = false;
  }
}

function createBigCardTitle(text) {
  let el = document.createElement("p");
  el.classList.add("bigCardTitle");
  el.innerHTML = text;
  return el;
}

function createBigCardBody(text) {
  let el = document.createElement("p");
  el.classList.add("bigCardBody");
  el.innerHTML = text;
  return el;
}

function createQuestion(
  question = "",
  type = "text",
  answer = "",
  choice = { options: ["", "", "", "", "", ""], correct: [true, false, false, false, false, false] },
  category = categories[0],
  media
) {
  //answer can be array for multiple choice, object for click position, string for text
  //type can be text, click, choice
  questions.push({
    question: question,
    type: type,
    answer: answer,
    choice: choice,
    category: category,
    media: media,
  });
  genQuestions();
}

function genQuestions() {
  cardAmntPerRow = window.innerWidth / 270;
  for (let i = 0; i < questionElements.length; i++) {
    questionElements[i].remove();
  }
  questionElements = new Array(0);
  for (let i = 0; i < questions.length; i++) {
    let e = document.createElement("div");

    e.style.left = (i % Math.floor(cardAmntPerRow)) * 270 + "px";
    e.style.top = 370 * Math.floor(i / Math.floor(cardAmntPerRow)) + "px";

    e.oncontextmenu = function () {
      return false;
    };

    e.classList.add("editorCard");
    let question = document.createElement("textarea");
    question.placeholder = "type your question here";
    question.value = questions[i].question;
    question.classList.add("editorQuestion");

    question.addEventListener("change", function (e) {
      questions[i].question = question.value;
      saveToLocal();
    });

    question.addEventListener("keydown", function (e) {
      if (e.keyCode == 13) question.blur();
    });
    let typeSelector = document.createElement("select");
    let selectText = document.createElement("option");
    selectText.innerHTML = "text answer";
    typeSelector.append(selectText);
    let selectChoice = document.createElement("option");
    selectChoice.innerHTML = "multiple choice";
    typeSelector.append(selectChoice);
    let selectClick = document.createElement("option");
    selectClick.innerHTML = "click on image";
    //typeSelector.append(selectClick);

    if (questions[i].type == "text") selectText.selected = "selected";
    if (questions[i].type == "choice") selectChoice.selected = "selected";
    if (questions[i].type == "click") selectClick.selected = "selected";

    typeSelector.classList.add("select");

    typeSelector.addEventListener("change", function (e) {
      if (typeSelector.value == "text answer") questions[i].type = "text";
      if (typeSelector.value == "multiple choice") questions[i].type = "choice";
      if (typeSelector.value == "click on image") questions[i].type = "click";
      saveToLocal();
      genQuestions();
    });

    e.append(question);
    e.append(typeSelector);

    if (questions[i].type == "text") {
      let answer = document.createElement("textarea");
      answer.placeholder = "type the answer here";
      answer.value = questions[i].answer;
      answer.classList.add("editorAnswer");

      answer.addEventListener("change", function (e) {
        questions[i].answer = answer.value;
        saveToLocal();
      });

      e.append(answer);
    } else if (questions[i].type == "choice") {
      for (let choiceIdx = 0; choiceIdx < 6; choiceIdx++) {
        let choice = document.createElement("textarea");
        choice.placeholder = "Type choice " + (choiceIdx + 1) + " here";
        choice.style.height = "21px";
        choice.style.cursor = "default";
        choice.value = questions[i].choice.options[choiceIdx];
        if (questions[i].choice.correct[choiceIdx]) {
          choice.style.backgroundColor = "rgb(100,200,100)";
        }
        choice.oncontextmenu = function () {
          questions[i].choice.correct[choiceIdx] = !questions[i].choice.correct[choiceIdx];
          genQuestions();
          return false;
        };
        choice.onchange = function () {
          questions[i].choice.options[choiceIdx] = choice.value;
          saveToLocal();
        };
        e.append(choice);
      }
      let spacer = document.createElement("div");
      spacer.style.margin = "11px";
      e.append(spacer);
    }

    let parentPos = e.getBoundingClientRect();
    let del = document.createElement("span");
    del.classList.add("material-symbols-outlined");
    del.classList.add("delBtn");
    del.style.left = parentPos.x + 240 + "px";
    del.style.top = parentPos.y + 0 + "px";
    del.innerHTML = " delete ";
    del.addEventListener("click", (event) => {
      event.preventDefault();
      questions.splice(i, 1);
      e.remove();
      genQuestions();
    });

    e.appendChild(del);

    let copy = document.createElement("span");
    copy.classList.add("material-symbols-outlined");
    copy.classList.add("copyBtn");
    copy.style.left = parentPos.x + 240 + "px";
    copy.style.top = parentPos.y + 24 + "px";
    copy.innerHTML = " content_copy ";
    copy.addEventListener("click", (event) => {
      event.preventDefault();
      questions.splice(i + 1, 0, JSON.parse(JSON.stringify(questions[i])));
      genQuestions();
    });

    e.appendChild(copy);

    if (categories.length > 0) {
      let categorySelector = document.createElement("select");
      categorySelector.classList.add("select");

      for (let k = 0; k < categories.length; k++) {
        let temp = document.createElement("option");
        temp.innerHTML = categories[k];
        if (questions[i].category == categories[k]) temp.selected = "selected";
        categorySelector.append(temp);
      }
      let categoryAdd = document.createElement("option");
      categoryAdd.innerHTML = "Create new";
      categoryAdd.style.fontStyle = "italic";
      categorySelector.append(categoryAdd);

      let categoryRename = document.createElement("option");
      categoryRename.innerHTML = "Rename";
      categoryRename.style.fontStyle = "italic";
      categorySelector.append(categoryRename);

      let categoryDelete = document.createElement("option");
      categoryDelete.innerHTML = "Delete";
      categoryDelete.style.fontStyle = "italic";
      categorySelector.append(categoryDelete);

      e.append(categorySelector);

      categorySelector.addEventListener("focus", () => {
        selectedCategoryPrevVal = categorySelector.value;
      });

      categorySelector.addEventListener("change", () => {
        categorySelector.blur();
        if (categorySelector.value == "Create new") {
          popup.innerHTML = "";
          categorySelector.value = selectedCategoryPrevVal;

          let title = document.createElement("p");
          title.innerHTML = "Create new category";
          title.style.fontSize = "30px";
          title.style.fontWeight = "bold";
          let someText = document.createElement("p");
          someText.innerHTML = "Press Esc to escape or Enter to enter";
          someText.style.fontSize = "10px";
          let inputBox = document.createElement("input");
          inputBox.type = "text";
          inputBox.placeholder = "Press enter to create";
          inputBox.addEventListener("keydown", (e) => {
            if (e.key == "Enter" && inputBox.value != "" && inputBox.value != "Create new" && inputBox.value != "Rename" && inputBox.value != "Delete" && !categories.includes(inputBox.value)) {
              questions[i].category = inputBox.value;
              createCategory(inputBox.value);
              saveToLocal();
              removePopup();
            }
          });

          popup.append(title);
          popup.append(someText);
          popup.append(inputBox);

          inputBox.focus();

          createPopup();
        } else if (categorySelector.value == "Rename") {
          popup.innerHTML = "";
          categorySelector.value = selectedCategoryPrevVal;

          let title = document.createElement("p");
          title.innerHTML = "Rename " + selectedCategoryPrevVal;
          title.style.fontSize = "30px";
          title.style.fontWeight = "bold";
          let someText = document.createElement("p");
          someText.innerHTML = "Press Esc to escape or Enter to enter";
          someText.style.fontSize = "10px";
          let inputBox = document.createElement("input");
          inputBox.type = "text";
          inputBox.placeholder = "Rename " + selectedCategoryPrevVal + " to";
          inputBox.addEventListener("keydown", (e) => {
            if (e.key == "Enter" && inputBox.value != "" && inputBox.value != "Create new" && inputBox.value != "Rename" && inputBox.value != "Delete" && !categories.includes(inputBox.value)) {
              renameCategory(questions[i].category, inputBox.value);
              genQuestions();
              removePopup();
            }
          });

          popup.append(title);
          popup.append(someText);
          popup.append(inputBox);

          inputBox.focus();

          createPopup();
        } else if (categorySelector.value == "Delete") {
          popup.innerHTML = "";
          categorySelector.value = selectedCategoryPrevVal;

          let title = document.createElement("p");
          title.innerHTML = "Delete '" + selectedCategoryPrevVal + "'?";
          title.style.fontSize = "30px";
          title.style.fontWeight = "bold";
          let someText = document.createElement("p");
          someText.innerHTML = "Press Esc to escape or Enter to enter";
          someText.style.fontSize = "10px";
          let inputBox = document.createElement("input");
          inputBox.type = "text";
          inputBox.placeholder = "type whatever you want here it doesn't matter";
          inputBox.addEventListener("keydown", (e) => {
            if (e.key == "Enter") {
              removeCategory(selectedCategoryPrevVal);
              genQuestions();
              removePopup();
            }
          });

          popup.append(title);
          popup.append(someText);
          popup.append(inputBox);

          inputBox.focus();

          createPopup();
        } else {
          questions[i].category = categorySelector.value;
          saveToLocal();
        }
      });
    }

    questionEditor.append(e);
    questionElements.push(e);
  }
  createButton = document.createElement("div");
  createButton.classList.add("coolBtn");
  if (questionElements.length > 0) {
    if (cardAmntPerRow - Math.floor(cardAmntPerRow) > 0.4 && questionElements.length % Math.floor(cardAmntPerRow) == 0) {
      createButton.style.left = (((questionElements.length - 1) % Math.floor(cardAmntPerRow)) + 1) * 270 + 10 + "px";
      createButton.style.top = 370 * Math.floor((questionElements.length - 1) / Math.floor(cardAmntPerRow)) + 145 + "px";
    } else {
      createButton.style.left = (questionElements.length % Math.floor(cardAmntPerRow)) * 270 + 10 + "px";
      createButton.style.top = 370 * Math.floor(questionElements.length / Math.floor(cardAmntPerRow)) + 145 + "px";
    }
  } else {
    createButton.style.left = "10px";
    createButton.style.top = "145px";
  }

  createButton.addEventListener("click", function () {
    createQuestion();
  });

  let createBtnIcon = document.createElement("span");
  createBtnIcon.classList.add("material-symbols-outlined");
  createBtnIcon.innerHTML = " add ";
  createBtnIcon.style.transform = "scale(3) translateY(9px)";
  createButton.append(createBtnIcon);

  questionEditor.append(createButton);
  questionElements.push(createButton);

  saveToLocal();
}

function saveToLocal() {
  localStorage.setItem("studySaveFile", JSON.stringify({ version: "0.1", categories: categories, file: questions }));
}

function renameCategory(prev, newName) {
  categories[categories.indexOf(prev)] = newName;
  questions.forEach((e) => {
    if (e.category == prev) e.category = newName;
  });
}

function createCategory(category) {
  categories.push(category);
  selectedCategories.push(true);
  selectedNameCategories.push(category);
  genQuestions();
}

function removeCategory(category) {
  let idx = categories.indexOf(category);
  categories.splice(idx, 1);
  selectedCategories.splice(idx, 1);
  selectedNameCategories.splice(idx, 1);
  if (categories.length > 0) {
    questions.forEach((e) => {
      if (e.category == category) e.category = categories[0];
    });
  } else {
    createCategory("have at least one category pls");
    questions.forEach((e) => {
      if (e.category == category) e.category = categories[0];
    });
  }
}

function removePopup() {
  popup.style.left = "-400px";
  popup.opacity = "0";
  window.setTimeout(function () {
    popup.innerHTML = "";
  }, 500);
}

function createPopup() {
  popup.style.left = "20px";
  popup.opacity = "1";
}

function shuffle(array, answerKey, extra) {
  let currentIndex = array.length,
    randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    if (answerKey != undefined) {
      [answerKey[currentIndex], answerKey[randomIndex]] = [answerKey[randomIndex], answerKey[currentIndex]];
    }
    if (extra != undefined) {
      [extra[currentIndex], extra[randomIndex]] = [extra[randomIndex], extra[currentIndex]];
    }
  }

  return array;
}

Array.prototype.removeUndefined = function () {
  let removed = [];
  this.forEach((x) => {
    if (x != undefined) removed.push(x);
  });
  return removed;
};

function saveFile() {
  popup.innerHTML = "";

  let title = document.createElement("p");
  title.innerHTML = "What should this set be called?";
  title.style.fontSize = "30px";
  title.style.fontWeight = "bold";
  let someText = document.createElement("p");
  someText.innerHTML = "Press Esc to cancel or Enter to proceed";
  someText.style.fontSize = "10px";
  let inputBox = document.createElement("input");
  inputBox.type = "text";
  inputBox.placeholder = "Type something fun";
  inputBox.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && inputBox.value != "") {
      downloadFile(JSON.stringify({ version: "0.1", file: questions }), inputBox.value + ".study");
      removePopup();
    }
  });

  popup.append(title);
  popup.append(someText);
  popup.append(inputBox);

  inputBox.focus();
  createPopup();
}

function loadFile() {
  localSave = localStorage.getItem("studySaveFile");

  popup.innerHTML = "";

  let title = document.createElement("p");
  title.innerHTML = "THIS WILL OVERRIDE YOUR<br>CURRENT SET";
  title.style.fontSize = "30px";
  title.style.fontWeight = "bold";

  let someText = document.createElement("p");
  someText.innerHTML = "Press Esc to cancel";
  someText.style.fontSize = "10px";
  let inputBox = document.createElement("input");
  inputBox.type = "file";
  inputBox.accept = ".study";
  inputBox.addEventListener("change", (e) => {
    let input = e.target.files[0];
    renderTooltip("Loaded " + e.target.files[0].name);
    if (input.name.includes(".study")) {
      let reader = new FileReader();
      reader.readAsText(input, "UTF-8");
      reader.onload = function (e) {
        questions = JSON.parse(e.target.result).file;
        window.setTimeout(function () {
          try {
            genQuestions();
          } catch (err) {
            renderTooltip(err + " - reloading in 4s");
            window.setTimeout(function () {
              loadLocalStorage(true);
            }, 4000);
          }
        }, 100);
      };
      reader.onerror = function () {
        renderTooltip("Error reading file");
      };
      removePopup();
    } else {
      renderTooltip("Should be a .study file");
      removePopup();
    }
  });

  popup.append(title);
  popup.append(someText);
  popup.append(inputBox);

  createPopup();
}

function loadLocalStorage(shouldGen) {
  if (localSave != null && JSON.parse(localSave).version == "0.1" && JSON.parse(localSave).file.length > 0) {
    questions = JSON.parse(localSave).file;

    categories = JSON.parse(localSave).categories;
    selectedCategories = new Array(categories.length);
    selectedCategories.fill(false);

    selectedNameCategories = [];

    renderTooltip("Restored previous session");
    if (shouldGen) {
      genQuestions();
    }
  } else {
    genPresetQuestions();
  }
}

const downloadFile = (contents, name) => {
  const link = document.createElement("a");
  const blob = new Blob([contents], { type: "text/plain" });
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
};

function renderTooltip(text, event) {
  infoTooltip.style.visibility = "visible";
  infoTooltip.innerText = text;
  infoTooltip.style.opacity = "1";
  infoTooltip.onclick = () => {
    infoTooltip.style.opacity = "0";
    infoTooltip.style.visibility = "hidden";
    if (event != undefined) {
      event();
    }
  };
  window.setTimeout(() => {
    infoTooltip.style.opacity = "0";
    infoTooltip.style.visibility = "hidden";
    infoTooltip.onclick = () => {};
  }, 4000);
}

function genPresetQuestions() {
  createQuestion(
    "What is 4+5?",
    "choice",
    "",
    {
      options: ["1", "2", "3", "9", "5", "6"],
      correct: [false, false, false, true, false, false],
    },
    "math"
  );

  createQuestion(
    "What is the first element in the periodic table?",
    "choice",
    "",
    {
      options: ["Hydrogen", "Helium", "Lithium", "Beryllium", "", ""],
      correct: [true, false, false, false],
    },
    "science"
  );
  createQuestion("Which continent is Canada in?", "text", "North America", {}, "geography");

  /*
  createQuestion("What is 1+1?", "text", "2");
  createQuestion("What is 2+3?", "text", "5");
  createQuestion("What is 4+5?", "text", "9");
  createQuestion("What is 43+1?", "text", "44");
  createQuestion("What is 2+3?", "text", "5");
  createQuestion("What is 6+5?", "text", "11");
  createQuestion("What is 54+1?", "text", "55");
  createQuestion("What is 1+3?", "text", "4");
  */
}
try {
  genQuestions();
} catch (err) {
  renderTooltip("Failed to load from local storage. Click this text to reset", () => {
    localStorage.removeItem("studySaveFile");
    location.reload();
  });
}
