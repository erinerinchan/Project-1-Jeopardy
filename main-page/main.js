//Loading section
const loading = document.getElementById('loading');
const main = document.getElementById('main');

function fadeIn() {
  setTimeout(() => {
    loading.style.opacity = 0;
    loading.style.display = 'none';

    main.style.display = 'block';
    setTimeout(() => (main.style.opacity = 1), 50);
  }, 4000);
}

fadeIn();

// Main page
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
const LEVELS = ["easy", "medium", "hard"];
const game = document.getElementById("game");
const scoreDisplay = document.getElementById("score");
const modal = document.getElementById("modal");

let qa = {};
let pickedGenres = [];

function handleFlipCard(e) {
  const category = this.getAttribute('data-category');
  const level = this.innerHTML;
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

//   // Modals
//   modal.innerHTML = '';
//   modal.append(textDisplay);
//   modal.append(buttonA);
//   modal.append(buttonB);
//   modal.append(buttonC);
//   modal.append(buttonD);
//   modal.removeAttribute('style');
}

function generateCards() {
  pickedGenres.forEach((genre) => {
    const column = document.createElement("div");
    column.classList.add("genre-column");
    column.innerHTML = genre.displayName;
    game.append(column);

    for (let i = 0; i < 5; i++) {
      const card = document.createElement("div");
      card.classList.add("card");
      card.setAttribute('data-category', genre.category);
      card.addEventListener('click', handleFlipCard);
      card.innerHTML = 200 * (i + 1)
      column.append(card)
    }
  })
}

function getQuestions() {
  const requests = [];

  pickedGenres.forEach((genre) => {
    LEVELS.forEach((level) => {
      const link = `https://opentdb.com/api.php?amount=2&category=${genre.id}&difficulty=${level}&type=multiple`;
      const req = fetch(link).then((resp) => resp.json());
      requests.push(req);
    })
  })

  Promise.all(requests).then((responses) => {
    responses.forEach((resp) => {
      const genre = resp.results[0].category;
      const difficulty = resp.results[0].difficulty;
      const levelIndex = LEVELS.indexOf(difficulty)
      const level = ((levelIndex * 2) + 1) * 200

      if (qa[genre]) {
        qa[genre][level] = resp.results[0];
        qa[genre][level + 200] = resp.results[1];
      } else {
        qa[genre] = {
          [level]: resp.results[0],
          [level + 200]: resp.results[1]
        }
      }
    })

    console.log(qa)

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
