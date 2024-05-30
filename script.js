const quizData = [
    {
        audio: "audio1",
        label: ["person", "song name"],
        answers: ["lololololol", "lolol"],
    }, {
        audio: "audio2",
        label: ["idfk", "mckzv;nb"],
        answers: ["??????", "Whar"],
    },
];

const content = document.getElementById("content");
var questionDisplay;
var inputs;

var currentQuestion;
var questionOrder;
var userAnswers;

// util
function generateOrder() {
    var order = Array.from({ length: quizData.length }, (_, i) => i);

    order.sort(() => Math.random() - 0.5);

    return order;
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

    inputs.innerHTML = ``;
    for (var i = 0; i < question.answers.length; i++) {
        inputs.innerHTML += `<br> ${question.label[i]} `;

        var input = document.createElement("input");
        input.id = "input" + i;

        inputs.appendChild(input);
    }
}

function submitAnswer() {
    const question = quizData[questionOrder[currentQuestion]];
    userAnswers[currentQuestion] = new Array(question.answers.length).fill("");

    for (var input of inputs.children) {
        var inputNumber = input.id.replace(/^\D+/g, '');

        userAnswers[currentQuestion][inputNumber] = input.value;
    }
}

function showResults() {
    content.innerHTML = `<h2>Results (you uhh finished)</h2>`; //table

    for (var i = 0; i < quizData.length; i++) {
        const div = document.createElement("div");
        const question = quizData[questionOrder[i]];

        div.innerHTML += (i > 0 ? "<br>" : "");
        div.innerHTML += `<h3>question ${i + 1}</h3>`;
        div.innerHTML += `
        <audio controls>
            <source src=${question.audio} type="audio/mp3">
        </audio>
        `;

        var tbl = document.createElement("table");

        //answer row
        var answerRow = tbl.insertRow();
        var asdf1 = answerRow.insertCell();
        asdf1.appendChild(document.createTextNode("The answer was..."));

        question.answers.forEach((answer) => {
            var td = answerRow.insertCell();
            td.appendChild(document.createTextNode(answer));
        });

        //user answer row
        var userRow = tbl.insertRow();
        var asdf2 = userRow.insertCell();
        asdf2.appendChild(document.createTextNode("and you submitted"));

        userAnswers[i].forEach((answer) => {
            var td = userRow.insertCell();
            td.appendChild(document.createTextNode(answer));
        });

        div.appendChild(tbl);
        content.appendChild(div);
    }

    content.innerHTML += `<br><button onclick="initialize()">try again</button>`;
}

function startQuiz() {
    content.innerHTML = `<div id="question">what happened on 1984</div>

    <div id="inputs"></div>
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

function initialize() {
    currentQuestion = 0;
    userAnswers = new Array(quizData.length);

    content.innerHTML = `
        gaspgsa
        <br>
        <br>
        <button id="start">start quiz</button>
    `;

    content.querySelector("#start").addEventListener("click", startQuiz);
}

initialize();