//Loading section
const loading = document.getElementById("loading");
const main = document.getElementById("main");

function fadeIn() {
  setTimeout(() => {
    loading.style.opacity = 0;
    loading.style.display = "none";

    main.style.display = "block";
    setTimeout(() => (main.style.opacity = 1), 50);
  }, 4000);
}

fadeIn();

// Main page
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
const LEVELS = ["easy", "medium", "hard"];
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score-value");
const modal = document.getElementById("modal");

let card;
let qa = {};
let pickedGenres = [];
let score = 0;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}

function handleFlipCard() {
  if (!this.className.includes("completed") && !card) {
    card = this;
    const category = this.getAttribute("data-category");
    const level = this.innerHTML;
    const data = qa[category][level];
    const answers = shuffle([data.correct_answer, ...data.incorrect_answers]);

    const textDisplay = document.createElement("div");
    textDisplay.innerHTML = data.question;

    const buttonA = document.createElement("button");
    const buttonB = document.createElement("button");
    const buttonC = document.createElement("button");
    const buttonD = document.createElement("button");

    buttonA.className = "button-mc";
    buttonB.className = "button-mc";
    buttonC.className = "button-mc";
    buttonD.className = "button-mc";

    buttonA.innerHTML = answers[0];
    buttonB.innerHTML = answers[1];
    buttonC.innerHTML = answers[2];
    buttonD.innerHTML = answers[3];

    buttonA.addEventListener("click", getResult, { once: true });
    buttonB.addEventListener("click", getResult, { once: true });
    buttonC.addEventListener("click", getResult, { once: true });
    buttonD.addEventListener("click", getResult, { once: true });

    // Close Modal Button
    const closeModal = document.createElement("button");
    closeModal.innerHTML = "Exit";
    closeModal.addEventListener("click", () => {
      modal.style.display = "none";
      card = null;
    });
    document.body.appendChild(closeModal);

    // Setting Model Content
    modal.innerHTML = "";
    modal.append(textDisplay, buttonA, buttonB, buttonC, buttonD, closeModal);
    modal.removeAttribute("style");
  }
}

// Get result
function getResult() {
  const buttons = document.querySelectorAll(".button-mc");
  const cardValue = card.getAttribute("data-value");
  const correctAnswer = card.getAttribute("data-answer");

  if (correctAnswer === this.innerHTML) {
    score = score + parseInt(cardValue);
    scoreDisplay.innerHTML = score;
    card.classList.add("correct-answer");
  } else {
    this.classList.add("wrong-answer");
    card.classList.add("wrong-answer");
  }

  card.classList.add("completed");
  buttons.forEach((btn) => {
    btn.disabled = true;

    if (btn.innerHTML === correctAnswer) {
      btn.classList.add("correct-answer");
    }
  });
}

//Generate Cards
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

      // Disable card after it has been played
      newCard.addEventListener("click", handleFlipCard);

      column.append(newCard);
    }
  });
}

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

    // Use the qa variable to generate the cards
    generateCards();

    // Change to game screen when all data is downloaded
    document.querySelector("#loading").style.display = "none";
    document.querySelector("#game").style.display = null;
  });
}

function pickGenres() {
  const genrePool = [...GENRES];

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * genrePool.length);
    pickedGenres.push(genrePool[index]);
    genrePool.splice(index, 1);
  }
}

function init() {
  pickGenres();
  getQuestions();
}

init();
