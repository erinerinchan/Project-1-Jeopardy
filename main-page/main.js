//Loading section

//DOM elements
const loading = document.getElementById("loading");
const main = document.getElementById("main");

//Setting time for the main page to fade in
function fadeIn() {
  setTimeout(() => {
    loading.style.opacity = 0;
    loading.style.display = "none";

    main.style.display = "block";
    setTimeout(() => (main.style.opacity = 1), 50);
  }, 4000);
}

fadeIn();

//Main page

//Timer
//DOM elements for the timer
const timeDisplay = document.getElementById("time-value");

const modalTime = document.getElementById("modal-time");
const modalTimeContent = document.querySelector(".modal-time-content");

const buttonPlayAgain = document.createElement("button");
buttonPlayAgain.className = "play-again";
buttonPlayAgain.innerHTML = "Play again?";
buttonPlayAgain.addEventListener("click", () => {
  document.location.href = "main.html";
});

//Global variables for the timer
let timeLeft = 600; //600 seconds, aka 10 mins
let timerInterval;

//Timer starts
function startGame() {
  timerInterval = setInterval(function () {
    timeLeft -= 1;

    const completedCards = document.querySelectorAll(".completed").length;
    if (timeLeft === 0 && completedCards === 30) {
      clearInterval(timerInterval);
      timeDisplay.style.color = "red";

      modalTime.removeAttribute("style");
      modalTimeContent.innerHTML = `Congrats! You completed all the questions within 10 minutes! And you scored ${scoreDisplay.innerHTML} out of 18,000 points!`;

      modalTimeContent.append(buttonPlayAgain);

      card = null;

    } else if (timeLeft === 0 && completedCards !== 30) {
      clearInterval(timerInterval);
      timeDisplay.style.color = "red";

      modalTime.removeAttribute("style");
      modalTimeContent.innerHTML = `Oops! You failed to complete all the questions within 10 minutes! But you scored ${scoreDisplay.innerHTML} out of 18,000 points!`;

      modalTimeContent.append(buttonPlayAgain);

      card = null;
    }

    if (timeLeft % 2 === 0) {
      timeDisplay.style.color = "magenta";
    } else {
      timeDisplay.style.color = "white";
    }

    timeDisplay.innerHTML = Math.ceil(timeLeft / 60);
  }, 1000);
}

//Question cards area
//DOM elements
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score-value");
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");

//Global variables
let card;
let qa = {};
let pickedGenres = [];
let score = 0;

//The game's categories
const GENRES = [
  {
    displayName: "Common Sense",
    category: "General Knowledge",
    id: 9,
  },
  {
    displayName: "Books",
    category: "Entertainment: Books",
    id: 10,
  },
  {
    displayName: "Film",
    category: "Entertainment: Film",
    id: 11,
  },
  {
    displayName: "Music",
    category: "Entertainment: Music",
    id: 12,
  },
  {
    displayName: "Musicals & Theatres",
    category: "Entertainment: Musicals & Theatres",
    id: 13,
  },
  {
    displayName: "Television",
    category: "Entertainment: Television",
    id: 14,
  },
  {
    displayName: "Video Games",
    category: "Entertainment: Video Games",
    id: 15,
  },
  {
    displayName: "Board Games",
    category: "Entertainment: Board Games",
    id: 16,
  },
  {
    displayName: "Science & Nature",
    category: "Science & Nature",
    id: 17,
  },
  {
    displayName: "Computers",
    category: "Science: Computers",
    id: 18,
  },
  {
    displayName: "Maths",
    category: "Science: Mathematics",
    id: 19,
  },
  {
    displayName: "Mythology",
    category: "Mythology",
    id: 20,
  },
  {
    displayName: "Sports",
    category: "Sports",
    id: 21,
  },
  {
    displayName: "Geography",
    category: "Geography",
    id: 22,
  },
  {
    displayName: "History",
    category: "History",
    id: 23,
  },
  {
    displayName: "Politics",
    category: "Politics",
    id: 24,
  },
  {
    displayName: "Art",
    category: "Art",
    id: 25,
  },
  {
    displayName: "Celebrities",
    category: "Celebrities",
    id: 26,
  },
  {
    displayName: "Animals",
    category: "Animals",
    id: 27,
  },
  {
    displayName: "Vehicles",
    category: "Vehicles",
    id: 28,
  },
  {
    displayName: "Comics",
    category: "Entertainment: Comics",
    id: 29,
  },
  {
    displayName: "Gadgets",
    category: "Science: Gadgets",
    id: 30,
  },
  {
    displayName: "Anime & Manga",
    category: "Entertainment: Japanese Anime & Manga",
    id: 31,
  },
  {
    displayName: "Cartoon & Animations",
    category: "Entertainment: Cartoon & Animations",
    id: 32,
  },
];

//The game's categories generated in a random order
function pickGenres() {
  const genrePool = [...GENRES];

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * genrePool.length);
    pickedGenres.push(genrePool[index]);
    genrePool.splice(index, 1);
  }
}

//Difficulty of the game
const LEVELS = ["easy", "medium", "hard"];

//Answer options on question cards generated in a random order
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

//Generate question cards
function generateCards() {
  pickedGenres.forEach((genre) => {
    const column = document.createElement("div");
    column.classList.add("genre-column");
    column.innerHTML = genre.displayName;
    game.append(column);

    for (let i = 0; i < 5; i++) {
      const category = genre.category;
      const level = 200 * (i + 1);

      const newCard = document.createElement("div");
      newCard.innerHTML = level;
      newCard.classList.add("card");
      newCard.setAttribute("data-category", category);
      newCard.setAttribute("data-value", level);
      newCard.setAttribute("data-answer", qa[category][level].correct_answer);

      newCard.addEventListener("click", handleFlipCard);

      column.append(newCard);
    }
  });
}

//Events when clicking on the question card
function handleFlipCard() {
  if (!this.className.includes("completed") && !card) {
    //Assign data to the question card
    card = this;
    const category = this.getAttribute("data-category");
    const level = this.innerHTML;
    const data = qa[category][level];
    const answers = shuffle([data.correct_answer, ...data.incorrect_answers]);

    //Text display on the questions
    const textDisplay = document.createElement("div");
    textDisplay.innerHTML = data.question;

    //Buttons for 4 answer options
    const buttonA = document.createElement("button");
    const buttonB = document.createElement("button");
    const buttonC = document.createElement("button");
    const buttonD = document.createElement("button");

    //Setting class names for the buttons
    buttonA.className = "button-mc";
    buttonB.className = "button-mc";
    buttonC.className = "button-mc";
    buttonD.className = "button-mc";

    //Text display on the buttons
    buttonA.innerHTML = answers[0];
    buttonB.innerHTML = answers[1];
    buttonC.innerHTML = answers[2];
    buttonD.innerHTML = answers[3];

    //Apply clicks to the buttons
    buttonA.addEventListener("click", getResult);
    buttonB.addEventListener("click", getResult);
    buttonC.addEventListener("click", getResult);
    buttonD.addEventListener("click", getResult);

    //Button for closing the question card's modal
    const closeModal = document.createElement("button");
    closeModal.className = "close-modal";
    closeModal.innerHTML = "Exit";
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
      card = null;
      cardsComplete();
    });
    document.body.appendChild(closeModal);

    //Setting the modal's content
    modal.removeAttribute("style");
    modalContent.innerHTML = "";
    modalContent.append(
      textDisplay,
      buttonA,
      buttonB,
      buttonC,
      buttonD,
      closeModal
    );
  }
}

//Get result
function getResult() {
  //DOM elements
  const buttons = document.querySelectorAll(".button-mc");
  const cardValue = card.getAttribute("data-value");
  const correctAnswer = card.getAttribute("data-answer");

  //Display on score and card when user chooses the right or wrong answer
  if (correctAnswer === this.innerHTML) {
    score = score + parseInt(cardValue);
    scoreDisplay.innerHTML = score;
    card.classList.add("correct-answer");
  } else {
    this.classList.add("wrong-answer");
    card.classList.add("wrong-answer");
  }

  //Avoid the question card's re-clicking once it's been played
  card.classList.add("completed");
  buttons.forEach((btn) => {
    btn.disabled = true;

    //Display on button when user chooses the correct answer
    if (btn.innerHTML === correctAnswer) {
      btn.classList.add("correct-answer");
    }
  });
}

//Fetch questions for the question cards
function getQuestions() {
  const requests = [];

  pickedGenres.forEach((genre) => {
    LEVELS.forEach((level) => {
      const link = `https://opentdb.com/api.php?amount=2&category=${genre.id}&difficulty=${level}&type=multiple`;
      const req = fetch(link).then((resp) => resp.json());
      requests.push(req);
    });
  });

  Promise.all(requests).then((responses) => {
    responses.forEach((resp) => {
      const genre = resp.results[0].category;
      const difficulty = resp.results[0].difficulty;
      const levelIndex = LEVELS.indexOf(difficulty);
      const level = (levelIndex * 2 + 1) * 200;

      if (qa[genre]) {
        qa[genre][level] = resp.results[0];
        qa[genre][level + 200] = resp.results[1];
      } else {
        qa[genre] = {
          [level]: resp.results[0],
          [level + 200]: resp.results[1],
        };
      }
    });

    console.log(qa);

    //Use the qa variable to generate the cards
    generateCards();

    //Change to game screen when all data is downloaded
    document.querySelector("#loading").style.display = "none";
    document.querySelector("#game").style.display = null;

    // Start timer
    startGame();
  });
}

//Call functions
function init() {
  pickGenres();
  getQuestions();
}

init();

//Events when all the cards are completed

//DOM elements for the modal
const modalComplete = document.getElementById("modal-complete");
const modalCompleteContent = document.querySelector(".modal-complete-content");

function cardsComplete() {
  const completedCards = document.querySelectorAll(".completed").length;
  if (completedCards === 30) {
    modalComplete.removeAttribute("style");
    modalCompleteContent.innerHTML = `Congrats! You scored ${scoreDisplay.innerHTML} out of 18,000 points in less than 10 minutes!`;
    modalCompleteContent.append(buttonPlayAgain);

    card = null;
  }
}

//Background music
function toggleMute() {
  const myAudio = document.getElementById('audio');
  myAudio.muted = !myAudio.muted;
}
