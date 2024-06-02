const content = document.getElementById("content");
var questionDisplay;
var inputs;

var currentQuestion = 0;
var questionOrder;
var userAnswers;

// util
function generateOrder() {
    var order = Array.from({ length: quizData.length }, (_, i) => i);

    order.sort(() => Math.random() - 0.5);

    return order;
}

function filterText(text) {
    return text.replace(/[\s\.-]+/g,'').toLowerCase();
}

function percentToColor(percent) {
    var hue = (percent * 120).toString(10);
    return `hsl(${hue}, 100%, 34%)`;
}

/*
below 2 functions are stolen from https://stackoverflow.com/questions/4825683/how-do-i-create-and-read-a-value-from-cookie-with-javascript
its 11:47 pm and the music test is tomorrow and i want to go to sleep Ok ?
*/
function setCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function deleteCookie(name) {
    setCookie(name, "", 1);
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return null;
}

// main
function saveData() {
    setCookie('inputData', JSON.stringify(userAnswers));
    setCookie('orderData', JSON.stringify(questionOrder));
}

function handleButtonsDisplay() {
    var goPrevious = content.querySelector("#goPrevious");
    var goNext = content.querySelector("#goNext");
    var submit = content.querySelector("#submit");

    if (currentQuestion == 0) {
        goPrevious.setAttribute("hidden", "hidden");
        goNext.removeAttribute("hidden");
    } else if (currentQuestion == quizData.length - 1) {
        goPrevious.removeAttribute("hidden");
        goNext.setAttribute("hidden", "hidden");
    } else {
        goPrevious.removeAttribute("hidden");
        goNext.removeAttribute("hidden");
    }

    if (currentQuestion == quizData.length - 1) {
        submit.innerText = "end quiz";
    } else {
        submit.innerText = "submit";
    }
}

function loadQuestion(questionNumber) {
    if (questionNumber < 0 || quizData.length <= questionNumber) {
        console.log(`Error loading question: question number ${questionNumber} out of bound`);
        
        return;
    }

    const question = quizData[questionOrder[questionNumber]];
    currentQuestion = questionNumber;

    handleButtonsDisplay();

    questionDisplay.innerHTML = `<h2>question ${questionNumber + 1}</h2>`;
    questionDisplay.innerHTML += `
    <audio controls>
        <source src=${question.audio} type="audio/mp3">
    </audio>
    `;

    var inputTable = document.createElement("table");

    inputs.innerHTML = ``;
    for (var i = 0; i < question.answers.length; i++) {
        var inputRow = inputTable.insertRow();

        var labelCell = inputRow.insertCell();
        labelCell.className += "left";
        labelCell.appendChild(document.createTextNode(question.label[i]));

        var inputCell = inputRow.insertCell();
        var input = document.createElement("input");
        input.classList.add("center", "mono");
        input.id = "input" + i;

        if (userAnswers[questionNumber] != null && userAnswers[questionNumber][i] != "") {
            input.value = userAnswers[questionNumber][i];
        }

        inputCell.appendChild(input);
    }

    inputs.appendChild(inputTable);
}

function submitAnswer() {
    const question = quizData[questionOrder[currentQuestion]];
    userAnswers[currentQuestion] = new Array(question.answers.length).fill("");

    inputs.querySelectorAll("tr").forEach((row) => {
        var input = row.cells[1].querySelector("input");
        var inputNumber = input.id.replace(/^\D+/g, '');

        userAnswers[currentQuestion][inputNumber] = filterText(input.value);
    });

    saveData();
}

function showResults() {
    content.innerHTML = `<h2>Results</h2>`;

    var userScore = 0;
    var totalScore = 0;
    for (var i = 0; i < quizData.length; i++) {
        const div = document.createElement("div");
        const question = quizData[questionOrder[i]];

        div.innerHTML += (i > 0 ? "<br>" : "");
        div.innerHTML += `<h3 class="mono">question ${i + 1}</h3>`;
        div.innerHTML += `
        <audio controls>
            <source src=${question.audio} type="audio/mp3">
        </audio>
        `;

        var tbl = document.createElement("table");

        //answer row
        var answerRow = tbl.insertRow();
        var asdf1 = answerRow.insertCell();
        asdf1.appendChild(document.createTextNode("答案是..."));
        asdf1.className += "left";

        question.answers.forEach((answer) => {
            var td = answerRow.insertCell();

            if (Array.isArray(answer)) {
                td.appendChild(document.createTextNode(answer[0]));
            } else {
                td.appendChild(document.createTextNode(answer));
            }

            td.classList.add("left", "mono");
        });

        //user answer row
        var userRow = tbl.insertRow();
        var asdf2 = userRow.insertCell();
        asdf2.appendChild(document.createTextNode("而你答了"));
        asdf2.className += "left";

        var userQuestionScore = 0;
        var questionScore = 0;
        userAnswers[i].forEach((answer, inputIndex) => {
            var td = userRow.insertCell();
            td.appendChild(document.createTextNode(answer === "" ? "(none)" : answer));
            td.classList.add("left", "mono");

            var isCorrect = false;
            if (Array.isArray(question.answers[inputIndex])) {
                question.answers[inputIndex].forEach((correctAnswer) => {
                    if (answer === filterText(correctAnswer)) {
                        isCorrect = true;
                    }
                })
            } else {
                isCorrect = answer === filterText(question.answers[inputIndex]);
            }

            if (isCorrect) {
                userQuestionScore += question.scores[inputIndex];
                td.style.color = "green";
            } else {
                td.style.color = "red";
            }

            questionScore += question.scores[inputIndex];
        });

        var scoreColor = percentToColor(userQuestionScore / questionScore);
        div.querySelector("h3").innerHTML += ` <p style="color:${scoreColor}">(${userQuestionScore}/${questionScore})</p>`

        userScore += userQuestionScore;
        totalScore += questionScore;
        div.appendChild(tbl);
        content.appendChild(div);
    }

    content.innerHTML += `<br><h3 style="color:${percentToColor(userScore / totalScore)}">總分: ${userScore}/${totalScore}</h3>`;
    content.innerHTML += `<button onclick="location.reload()">try again <i class="fa-solid fa-arrow-right"></i></button>`;

    deleteCookie("inputData");
    deleteCookie("orderData");
}

function startQuiz(isReloadSession) {
    content.innerHTML = `<div id="question">what happened on 1984</div>

    <div id="inputs"></div>
    <br>
    <span style="display: inline;">
        <button hidden="hidden" id="goPrevious"><i class="fa-solid fa-arrow-left"></i></button>
        <button id="submit">submit</button>
        <button id="goNext"><i class="fa-solid fa-arrow-right"></i></button>
    </span>`;

    questionDisplay = content.querySelector("#question");
    inputs = content.querySelector("#inputs");

    if (isReloadSession === true && getCookie("inputData") != null && getCookie("orderData") != null) {
        questionOrder = JSON.parse(getCookie("orderData"));
        userAnswers = JSON.parse(getCookie("inputData"));
    } else {
        questionOrder = generateOrder();

        userAnswers = new Array(quizData.length);
        questionOrder.forEach((questionIndex, index) => {
            userAnswers[index] = new Array(quizData[questionIndex].answers.length).fill("");
        });
    }

    content.querySelector("#goPrevious").addEventListener("click", function () {
        loadQuestion(currentQuestion - 1);
    });

    content.querySelector("#goNext").addEventListener("click", function() {
        loadQuestion(currentQuestion + 1);
    });

    content.querySelector("#submit").addEventListener("click", function () {
        submitAnswer();

        if (currentQuestion + 1 < quizData.length) {
            currentQuestion++;
            loadQuestion(currentQuestion);
        } else {
            showResults();
        }
    });

    loadQuestion(currentQuestion);
}

// initialize
if (getCookie("inputData") != null && getCookie("orderData") != null) { //found data >:D
    var notice = document.createElement("h3");
    notice.style.color = "#568eff";
    notice.innerText = "!! 偵測到過去進度，啟動自動還原 !!";

    content.prepend(notice);

    content.querySelector("#start").addEventListener("click", function() {
        startQuiz(true);
    });
} else {
    content.querySelector("#start").addEventListener("click", startQuiz); //no data / data broken D:
}