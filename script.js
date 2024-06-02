const content = document.getElementById("content");
var questionDisplay;
var inputs;

var currentQuestion = 0;
var questionOrder;
var userAnswers = new Array(quizData.length);

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

// main
function loadQuestion() {
    const question = quizData[questionOrder[currentQuestion]];

    questionDisplay.innerHTML = `<h2>question ${currentQuestion + 1}</h2>`;
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
}

function startQuiz() {
    content.innerHTML = `<div id="question">what happened on 1984</div>

    <div id="inputs"></div>
    <br>
    <button id="submit">submit</button>`;

    questionDisplay = content.querySelector("#question");
    inputs = content.querySelector("#inputs");

    questionOrder = generateOrder();

    content.querySelector("#submit").addEventListener("click", function () {
        submitAnswer();

        if (currentQuestion + 1 < quizData.length) {
            currentQuestion++;
            loadQuestion();
        } else {
            showResults();
        }
    });

    loadQuestion();
}

content.querySelector("#start").addEventListener("click", startQuiz);