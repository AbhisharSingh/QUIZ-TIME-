let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedAnswers = [];
const categorySelect = document.getElementById("category-select");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options-list");
const scoreDisplay = document.getElementById("score");
const resultContainer = document.getElementById("result-container");
const answerSummary = document.getElementById("answer-summary");
const quizQuestionsContainer = document.getElementById("quiz-questions");
const categorySelectionContainer = document.getElementById("category-selection");

function startQuiz() {
  let category = categorySelect.value;
  fetchQuestions(category);
  categorySelectionContainer.style.display = "none";
  quizQuestionsContainer.style.display = "block";
}

function fetchQuestions(category) {
  fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`)
    .then(response => response.json())
    .then(data => {
      questions = data.results;
      currentQuestionIndex = 0;
      score = 0;
      selectedAnswers = [];
      loadQuestion();
    })
    .catch(error => console.error("Error fetching questions:", error));
}

function loadQuestion() {
  let currentQuestion = questions[currentQuestionIndex];
  questionText.innerHTML = currentQuestion.question;
  let options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  shuffleArray(options);
  optionsList.innerHTML = "";

  options.forEach((option) => {
    let optionElement = document.createElement("li");
    optionElement.innerHTML = option;
    optionElement.onclick = () => selectAnswer(option, currentQuestion.correct_answer);
    optionsList.appendChild(optionElement);
  });
}

function selectAnswer(selectedOption, correctOption) {
  let options = optionsList.children;
  for (let option of options) {
    option.onclick = null;
    if (option.innerHTML === correctOption) {
      option.classList.add("correct");
    } else if (option.innerHTML === selectedOption) {
      option.classList.add("incorrect");
    }
  }

  selectedAnswers.push({ question: questions[currentQuestionIndex].question, selectedOption, correctOption });

  if (selectedOption === correctOption) {
    score++;
  }

  setTimeout(nextQuestion, 1000);
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizQuestionsContainer.style.display = "none";
  resultContainer.style.display = "block";
  scoreDisplay.innerText = score;
  answerSummary.innerHTML = "<h3>Correct Answers:</h3>";

  selectedAnswers.forEach(({ question, selectedOption, correctOption }) => {
    let resultText = document.createElement("p");
    resultText.innerHTML = `<strong>Q: </strong>${question}<br>
      <strong>Your Answer: </strong>${selectedOption} ${selectedOption === correctOption ? "✅" : "❌"}<br>
      <strong>Correct Answer: </strong>${correctOption}`;
    answerSummary.appendChild(resultText);
  });
}

function restartQuiz() {
  resultContainer.style.display = "none";
  categorySelectionContainer.style.display = "block";
}

function shuffleArray(arr) {
  arr.sort(() => Math.random() - 0.5);
}
