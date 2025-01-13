// script.js

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let currentCategory = 9; // Default category (General Knowledge)

const categorySelect = document.getElementById("category-select");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options-list");
const scoreDisplay = document.getElementById("score");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const quizQuestionsContainer = document.getElementById("quiz-questions");
const categorySelectionContainer = document.getElementById("category-selection");

function startQuiz() {
  currentCategory = categorySelect.value; // Get the selected category
  fetchQuestions(currentCategory); // Fetch 10 questions from the API
  categorySelectionContainer.style.display = "none"; // Hide category selection
  quizQuestionsContainer.style.display = "block"; // Show quiz container
}

function fetchQuestions(category) {
  // Change the number of questions to 10
  fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`)
    .then(response => response.json())
    .then(data => {
      questions = data.results;
      loadQuestion();
    })
    .catch(error => {
      console.error("Error fetching questions:", error);
    });
}

function loadQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionText.innerText = currentQuestion.question;
  const options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  shuffleArray(options);

  // Clear previous options
  optionsList.innerHTML = '';

  options.forEach((option, index) => {
    const optionElement = document.createElement('li');
    optionElement.innerHTML = `<input type="radio" name="option" value="${index}"> ${option}`;
    optionsList.appendChild(optionElement);
  });
}

function nextQuestion() {
  const selectedOption = document.querySelector('input[name="option"]:checked');
  if (selectedOption) {
    const selectedAnswer = parseInt(selectedOption.value);
    const correctAnswer = questions[currentQuestionIndex].correct_answer;
    const correctIndex = questions[currentQuestionIndex].incorrect_answers
      .concat(correctAnswer)
      .indexOf(correctAnswer);

    if (selectedAnswer === correctIndex) {
      score++;
    }
    scoreDisplay.innerText = score;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizQuestionsContainer.style.display = "none"; // Hide the quiz container
  resultContainer.style.display = "block"; // Show the result container

  // Display user's score
  const scoreText = document.createElement('p');
  scoreText.innerHTML = `Your Score: <strong>${score}</strong> out of 10`;
  resultContainer.appendChild(scoreText);

  // Display correct answers for each question
  questions.forEach((question, index) => {
    const questionDiv = document.createElement('div');
    questionDiv.classList.add('question-result');
    
    // Display question text
    const questionTextDiv = document.createElement('p');
    questionTextDiv.innerHTML = `<strong>Q${index + 1}: </strong>${question.question}`;
    questionDiv.appendChild(questionTextDiv);
    
    // Show all options
    const optionsDiv = document.createElement('ul');
    question.incorrect_answers.concat(question.correct_answer).forEach((option, i) => {
      const optionElement = document.createElement('li');
      optionElement.innerHTML = option;
      
      // Highlight the correct answer
      if (option === question.correct_answer) {
        optionElement.style.color = 'green';
        optionElement.style.fontWeight = 'bold';
      }
      
      optionsDiv.appendChild(optionElement);
    });

    questionDiv.appendChild(optionsDiv);
    resultContainer.appendChild(questionDiv);
  });
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  scoreDisplay.innerText = score;
  resultContainer.innerHTML = ''; // Clear result container
  resultContainer.style.display = "none";
  categorySelectionContainer.style.display = "block";
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
}


