// DOM elements
const loading = document.getElementById("loading");
const main = document.getElementById("main");
const timeDisplay = document.getElementById("time-value");
const modalTime = document.getElementById("modal-time");
const modalTimeContent = document.querySelector(".modal-time-content");
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score-value");
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
const modalComplete = document.getElementById("modal-complete");
const modalCompleteContent = document.querySelector(".modal-complete-content");

// 'Play again' button
const buttonPlayAgain = document.createElement("button");
buttonPlayAgain.className = "play-again";
buttonPlayAgain.innerHTML = "Play Again?";
buttonPlayAgain.addEventListener("click", () => {
    document.location.reload();
});

// Global variables
let card;
let qa = {};
let pickedGenres = [];
let score = 0;
let timeLeft = 600;
let timerInterval;

const GENRES = [
    { displayName: "General Knowledge", category: "General Knowledge", id: 9 },
    { displayName: "Books", category: "Entertainment: Books", id: 10 },
    { displayName: "Film", category: "Entertainment: Film", id: 11 },
    { displayName: "Music", category: "Entertainment: Music", id: 12 },
    { displayName: "Television", category: "Entertainment: Television", id: 14 },
    { displayName: "Video Games", category: "Entertainment: Video Games", id: 15 },
    { displayName: "Science & Nature", category: "Science & Nature", id: 17 },
    { displayName: "Computers", category: "Science: Computers", id: 18 },
    { displayName: "Mathematics", category: "Science: Mathematics", id: 19 },
    { displayName: "Mythology", category: "Mythology", id: 20 },
    { displayName: "Sports", category: "Sports", id: 21 },
    { displayName: "Geography", category: "Geography", id: 22 },
    { displayName: "History", category: "History", id: 23 },
    { displayName: "Politics", category: "Politics", id: 24 },
    { displayName: "Art", category: "Art", id: 25 },
    { displayName: "Animals", category: "Animals", id: 27 },
    { displayName: "Vehicles", category: "Vehicles", id: 28 },
    { displayName: "Comics", category: "Entertainment: Comics", id: 29 },
    { displayName: "Anime & Manga", category: "Entertainment: Japanese Anime & Manga", id: 31 },
    { displayName: "Cartoons", category: "Entertainment: Cartoon & Animations", id: 32 },
];

// UTILITY FUNCTIONS
function decodeHTML(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function fetchWithTimeout(url, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

async function getQuestions() {
    console.log("🎯 Starting to fetch questions for:", pickedGenres.map(g => g.displayName));

    try {
        // Build a map of API category name → genre for matching
        const categoryToGenre = {};
        pickedGenres.forEach(genre => {
            categoryToGenre[genre.category] = genre;
        });

        // Single bulk fetch — avoids rate limiting entirely
        const response = await fetchWithTimeout('https://opentdb.com/api.php?amount=50&type=multiple');
        const data = await response.json();

        let allQuestions = [];
        if (data.response_code === 0 && data.results?.length > 0) {
            allQuestions = data.results;
        }

        // Group fetched questions by their API category
        const questionsByCategory = {};
        allQuestions.forEach(q => {
            if (!questionsByCategory[q.category]) {
                questionsByCategory[q.category] = [];
            }
            questionsByCategory[q.category].push(q);
        });

        // Shuffle the full pool for fallback usage
        const questionPool = shuffle([...allQuestions]);
        let poolIndex = 0;

        // Assign questions to each picked genre
        const pointValues = [200, 400, 600, 800, 1000];

        pickedGenres.forEach(genre => {
            const categoryKey = genre.displayName;
            qa[categoryKey] = {};

            // Prefer questions that match this genre's API category
            const matched = questionsByCategory[genre.category]
                ? shuffle([...questionsByCategory[genre.category]])
                : [];

            for (let i = 0; i < 5; i++) {
                let q;
                if (i < matched.length) {
                    q = matched[i];
                } else {
                    // Fall back to questions from the general pool
                    q = questionPool[poolIndex % questionPool.length];
                    poolIndex++;
                }

                qa[categoryKey][pointValues[i]] = {
                    question: decodeHTML(q.question),
                    correct_answer: decodeHTML(q.correct_answer),
                    incorrect_answers: q.incorrect_answers.map(decodeHTML)
                };
            }
        });

        console.log("✅ Questions loaded:", Object.keys(qa));
        generateCards();
        showGame();

    } catch (error) {
        console.error("💥 Failed to load questions:", error);
        showError();
    }
}

function generateCards() {
    console.log("🃏 Generating cards...");
    game.innerHTML = '';
    
    pickedGenres.forEach((genre) => {
        const categoryKey = genre.displayName;
        
        const column = document.createElement("div");
        column.classList.add("genre-column");
        
        const header = document.createElement("span");
        header.textContent = genre.displayName;
        column.appendChild(header);
        
        const pointValues = [200, 400, 600, 800, 1000];
        pointValues.forEach((value) => {
            const newCard = document.createElement("div");
            newCard.classList.add("card");
            
            const questionData = qa[categoryKey][value];
            newCard.innerHTML = `$${value}`;
            newCard.setAttribute("data-category", categoryKey);
            newCard.setAttribute("data-value", value);
            newCard.setAttribute("data-question", questionData.question);
            newCard.setAttribute("data-answer", questionData.correct_answer);
            newCard.setAttribute("data-incorrect", JSON.stringify(questionData.incorrect_answers));
            newCard.addEventListener("click", handleFlipCard);
            
            column.appendChild(newCard);
        });
        
        game.appendChild(column);
    });
    
    console.log("✅ All cards generated:", pickedGenres.length * 5);
}

function handleFlipCard(e) {
    const clickedCard = e.currentTarget;
    if (clickedCard.classList.contains("completed") || card) return;
    
    card = clickedCard;
    const question = clickedCard.getAttribute("data-question");
    const correctAnswer = clickedCard.getAttribute("data-answer");
    const incorrectAnswers = JSON.parse(clickedCard.getAttribute("data-incorrect"));
    const answers = shuffle([correctAnswer, ...incorrectAnswers]);
    
    const questionDisplay = document.createElement("div");
    questionDisplay.innerHTML = `<h3>${question}</h3>`;
    
    const buttonContainer = document.createElement("div");
    answers.forEach(answer => {
        const button = document.createElement("button");
        button.className = "button-mc";
        button.textContent = answer;
        button.addEventListener("click", getResult);
        buttonContainer.appendChild(button);
    });
    
    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "\u00D7";
    closeBtn.addEventListener("click", closeModal);

    modalContent.innerHTML = "";
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(questionDisplay);
    modalContent.appendChild(buttonContainer);
    modal.style.display = "flex";
}

function getResult() {
    const buttons = modalContent.querySelectorAll(".button-mc");
    const cardValue = parseInt(card.getAttribute("data-value"));
    const correctAnswer = card.getAttribute("data-answer");
    const selectedAnswer = this.textContent;
    
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
            btn.classList.add("correct-answer");
        }
    });
    
    if (selectedAnswer === correctAnswer) {
        score += cardValue;
        scoreDisplay.innerHTML = score;
        card.classList.add("correct-answer");
    } else {
        this.classList.add("wrong-answer");
        card.classList.add("wrong-answer");
    }
    
    card.classList.add("completed");
    card.innerHTML = "—";
    
    setTimeout(() => {
        modal.style.display = "none";
        card = null;
        checkIfAllCardsCompleted();
    }, 2000);
}

function closeModal() {
    modal.style.display = "none";
    card = null;
}

function pickGenres() {
    const genrePool = [...GENRES];
    pickedGenres = [];
    for (let i = 0; i < 6; i++) {
        const index = Math.floor(Math.random() * genrePool.length);
        pickedGenres.push(genrePool[index]);
        genrePool.splice(index, 1);
    }
    console.log("🎲 Selected genres:", pickedGenres.map(g => g.displayName));
}

function showGame() {
    loading.style.display = "none";
    main.style.display = "block";
    setTimeout(() => main.style.opacity = 1, 50);
    startGame();
}

function showError() {
    loading.innerHTML = `
        <div class="loading-content">
            <h2 style="color: #ffd700;">Connection Error</h2>
            <p style="color: white; text-align: center; margin-top: 20px;">
                Sorry, we couldn't load the game questions.<br>
                Please check your internet connection and try again.
            </p>
            <button onclick="location.reload()" class="play-again" style="margin-top: 20px;">
                Try Again
            </button>
        </div>
    `;
}

function startGame() {
    timerInterval = setInterval(() => {
        timeLeft -= 1;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.innerHTML = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 30) {
            timeDisplay.style.color = "#ff6b6b";
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            showTimeUp();
        }
    }, 1000);
}

function showTimeUp() {
    modalTimeContent.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 20px;">Time's Up!</h2>
        <p style="font-size: 1.2rem;">Final Score: $${score}</p>
        <p style="margin-top: 10px;">Out of a possible $30,000</p>
    `;
    modalTimeContent.appendChild(buttonPlayAgain);
    modalTime.style.display = "flex";
}

function checkIfAllCardsCompleted() {
    const totalCards = pickedGenres.length * 5;
    const completedCards = document.querySelectorAll(".card.completed").length;
    
    if (completedCards === totalCards) {
        clearInterval(timerInterval);
        modalCompleteContent.innerHTML = `
            <h2 style="color: #ffd700; margin-bottom: 20px;">Congratulations!</h2>
            <p style="font-size: 1.2rem;">You completed all questions!</p>
            <p style="margin-top: 10px;">Final Score: $${score}</p>
            <p style="margin-top: 10px;">Out of a possible $30,000</p>
        `;
        modalCompleteContent.appendChild(buttonPlayAgain);
        modalComplete.style.display = "flex";
    }
}

function toggleMute() {
    const audio = document.getElementById("audio");
    audio.muted = !audio.muted;
    const icon = document.getElementById("mute-icon");
    if (audio.muted) {
        icon.classList.remove("fa-volume-low");
        icon.classList.add("fa-volume-xmark");
    } else {
        icon.classList.remove("fa-volume-xmark");
        icon.classList.add("fa-volume-low");
    }
}

function init() {
    pickGenres();
    getQuestions();
}

// Start when DOM is ready
document.addEventListener("DOMContentLoaded", init);