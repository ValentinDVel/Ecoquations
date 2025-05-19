const NUM_QUESTIONS = 10;
const OPERATORS = [
    { op: '+', fn: (a, b) => a + b },
    { op: '-', fn: (a, b) => a - b },
    { op: '×', fn: (a, b) => a * b },
    { op: '÷', fn: (a, b) => a / b }
];
const ECO_GRAPHICS = [
    // Free-to-use SVG or PNG URLs (nature/eco themed)
    `<img src="bird1.png" alt="Bird" style="height:45px">`,
    `<img src="butterfly1.png" alt="Butterfly" style="height:45px">`,
    `<img src="flower1.png" alt="Flower" style="height:45px">`,
    `<img src="tree1.png" alt="Tree" style="height:45px">`,
    `<img src="bee1.png" alt="Bee" style="height:45px">`
];

let questions = [];
let current = 0;
let score = 0;
let level = 0;
let timer = null;
let timeLeft = 0;

const startBtn = document.getElementById('start-btn');
const levelSelect = document.getElementById('level');
const gameArea = document.getElementById('game-area');
const questionDiv = document.getElementById('question');
const answerForm = document.getElementById('answer-form');
const answerInput = document.getElementById('answer');
const scoreSpan = document.getElementById('score');
const questionNumSpan = document.getElementById('question-number');
const timerSpan = document.getElementById('timer');
const gameOverDiv = document.getElementById('game-over');
const finalScoreDiv = document.getElementById('final-score');
const ecoSound = document.getElementById('eco-sound');
const correctSound = document.getElementById('correct-sound');
const natureGraphic = document.getElementById('nature-graphic');

function randomInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function generateQuestion() {
    let operatorIdx = randomInt(0, 3);
    let a, b, opSymbol, answer;

    switch (operatorIdx) {
        case 0: // Addition
            a = randomInt(1, 12);
            b = randomInt(1, 12);
            opSymbol = '+';
            answer = a + b;
            break;
        case 1: // Subtraction - avoid negative
            a = randomInt(1, 12);
            b = randomInt(1, a); // b <= a
            opSymbol = '-';
            answer = a - b;
            break;
        case 2: // Multiplication
            a = randomInt(1, 12);
            b = randomInt(1, 12);
            opSymbol = '×';
            answer = a * b;
            break;
        case 3: // Division - avoid fractions & negative
            b = randomInt(1, 12);
            answer = randomInt(1, 12);
            a = b * answer;
            opSymbol = '÷';
            break;
    }
    return {
        a,
        b,
        op: opSymbol,
        answer
    };
}

function nextNatureGraphic() {
    // Randomly select a nature graphic
    let idx = randomInt(0, ECO_GRAPHICS.length - 1);
    natureGraphic.innerHTML = ECO_GRAPHICS[idx];
}

function showQuestion() {
    if (current >= NUM_QUESTIONS) {
        endGame();
        return;
    }
    let q = questions[current];
    nextNatureGraphic();
    questionDiv.textContent = `${q.a} ${q.op} ${q.b} = ?`;
    scoreSpan.textContent = `Score: ${score}`;
    questionNumSpan.textContent = `Question ${current + 1}/${NUM_QUESTIONS}`;
    answerInput.value = '';
    answerInput.focus();

    // Timer setup
    timerSpan.textContent = '';
    if (level > 0) {
        timeLeft = level === 1 ? 20 : 10;
        timerSpan.textContent = `⏰ ${timeLeft}s`;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = `⏰ ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                wrongAnswer('Out of time!');
            }
        }, 1000);
    }
}

function rightAnswer() {
    score++;
    // Play eco friendly sounds
    correctSound.currentTime = 0;
    correctSound.play();
    setTimeout(() => {
        ecoSound.currentTime = 0;
        ecoSound.play();
    }, 250);
    current++;
    if (timer) clearInterval(timer);
    setTimeout(showQuestion, 650);
}

function wrongAnswer(msg) {
    if (timer) clearInterval(timer);
    current++;
    // Show error briefly (red flash or similar) -- for simplicity, use alert
    if (msg) alert(msg);
    setTimeout(showQuestion, 500);
}

function endGame() {
    gameArea.classList.add('hidden');
    gameOverDiv.classList.remove('hidden');
    finalScoreDiv.textContent = `🌿 Your Score: ${score} / ${NUM_QUESTIONS}`;
    ecoSound.currentTime = 0;
    ecoSound.play();
}

startBtn.onclick = function () {
    level = parseInt(levelSelect.value, 10);
    questions = [];
    for (let i = 0; i < NUM_QUESTIONS; i++) {
        questions.push(generateQuestion());
    }
    current = 0;
    score = 0;
    document.querySelector('.level-select').classList.add('hidden');
    gameArea.classList.remove('hidden');
    gameOverDiv.classList.add('hidden');
    showQuestion();
};

answerForm.onsubmit = function (e) {
    e.preventDefault();
    let userAns = parseInt(answerInput.value, 10);
    let q = questions[current];
    if (timer) clearInterval(timer);
    if (userAns === q.answer) {
        rightAnswer();
    } else {
        wrongAnswer('Oops! Try the next one.');
    }
    return false;
};

// Keyboard support for Enter key in answer form
answerInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        answerForm.dispatchEvent(new Event('submit'));
    }
});