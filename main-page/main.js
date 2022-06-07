const GENRES = [
  {
    displayName: 'Common Sense',
    category: 'General Knowledge',
    id: 9
  },
  {
    displayName: 'Books',
    category: 'Entertainment: Books',
    id: 10
  },
  {
    displayName: 'Film',
    category: 'Entertainment: Film',
    id: 11
  },
  {
    displayName: 'Music',
    category: 'Entertainment: Music',
    id: 12
  },
  {
    displayName: 'Musicals & Theatres',
    category: 'Entertainment: Musicals & Theatres',
    id: 13
  },
  {
    displayName: 'Television',
    category: 'Entertainment: Television',
    id: 14
  },
  {
    displayName: 'Video Games',
    category: 'Entertainment: Video Games',
    id: 15
  },
  {
    displayName: 'Board Games',
    category: 'Entertainment: Board Games',
    id: 16
  },
  {
    displayName: 'Science & Nature',
    category: 'Science & Nature',
    id: 17
  },
  {
    displayName: 'Computers',
    category: 'Science: Computers',
    id: 18
  },
  {
    displayName: 'Maths',
    category: 'Science: Mathematics',
    id: 19
  },
  {
    displayName: 'Mythology',
    category: 'Mythology',
    id: 20
  },
  {
    displayName: 'Sports',
    category: 'Sports',
    id: 21
  },
  {
    displayName: 'Geography',
    category: 'Geography',
    id: 22
  },
  {
    displayName: 'History',
    category: 'History',
    id: 23
  },
  {
    displayName: 'Politics',
    category: 'Politics',
    id: 24
  },
  {
    displayName: 'Art',
    category: 'Art',
    id: 25
  },
  {
    displayName: 'Celebrities',
    category: 'Celebrities',
    id: 26
  },
  {
    displayName: 'Animals',
    category: 'Animals',
    id: 27
  },
  {
    displayName: 'Vehicles',
    category: 'Vehicles',
    id: 28
  },
  {
    displayName: 'Comics',
    category: 'Entertainment: Comics',
    id: 29
  },
  {
    displayName: 'Gadgets',
    category: 'Science: Gadgets',
    id: 30
  },
  {
    displayName: 'Anime & Manga',
    category: 'Entertainment: Japanese Anime & Manga',
    id: 31
  },
  {
    displayName: 'Cartoon & Animations',
    category: 'Entertainment: Cartoon & Animations',
    id: 32
  },
];
// const LEVELS = ["easy", "medium", "hard"];
const LEVELS = ["base", "beginner", "intermediate", "advanced", "expert"];
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const questionBox = document.getElementById("modal");

let qa = {};
let pickedGenres = [];

function handleFlipCard(e) {
  const category = this.getAttribute('data-category');
  const level = this.getAttribute('data-level');
  const data = qa[category][level];
  const answers = [data.correct_answer, ...data.incorrect_answers];

  const textDisplay = document.createElement('div');
  textDisplay.innerHTML = data.question;

  const buttonA = document.createElement('button');
  const buttonB = document.createElement('button');
  const buttonC = document.createElement('button');
  const buttonD = document.createElement('button');

  buttonA.innerHTML = answers[0];
  buttonB.innerHTML = answers[1];
  buttonC.innerHTML = answers[2];
  buttonD.innerHTML = answers[3];

  questionBox.innerHTML = '';
  questionBox.append(textDisplay);
  questionBox.append(buttonA);
  questionBox.append(buttonB);
  questionBox.append(buttonC);
  questionBox.append(buttonD);
  questionBox.removeAttribute('style');
}

function generateCards() {
  pickedGenres.forEach((genre) => {
    const column = document.createElement("div");
    column.classList.add("genre-column");
    column.innerHTML = genre.displayName;
    game.append(column);


    LEVELS.forEach((level) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute('data-category', genre.category);
      card.setAttribute('data-level', level);
      card.addEventListener('click', handleFlipCard);

      if (level === "base") {
        card.innerHTML = 200;
      } else if (level === "beginner") {
        card.innerHTML = 400;
      } else if (level === "intermediate") {
        card.innerHTML = 600;
      } else if (level === "advanced") {
        card.innerHTML = 800;
      } else {
        card.innerHTML = 1000;
      }

      column.append(card);
    })
  })
}

function getQuestions() {
  const requests = [];

  pickedGenres.forEach((genre) => {
    LEVELS.forEach((level) => {
      const link = `https://opentdb.com/api.php?amount=1&category=${genre.id}&difficulty=${level}&type=multiple`;
      const req = fetch(link).then((resp) => resp.json());
      requests.push(req);
    })
  })

  Promise.all(requests).then((responses) => {
    responses.forEach((resp) => {
      const genre = resp.results[0].category;
      const level = resp.results[0].difficulty;

      if (qa[genre]) {
        qa[genre][level] = resp.results[0];
      } else {
        qa[genre] = {
          [level]: resp.results[0],
        }
      }
    })

    // Use the qa variable to generate the cards
    generateCards();

    // Change to game screen when all data is downloaded
    document.querySelector('#loading').style.display = 'none';
    document.querySelector('#game').style.display = null;
  })
}

function pickGenres() {
  const genrePool = [...GENRES];

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * (genrePool.length));
    pickedGenres.push(genrePool[index]);
    genrePool.splice(index, 1);
  }
}

function init() {
  pickGenres();
  getQuestions();
}

init();
