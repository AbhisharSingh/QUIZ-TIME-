let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedAnswers = [];
let isAnswerSelected = false;
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
  showLoadingState();
  fetchQuestions(category);
}

function showLoadingState() {
  categorySelectionContainer.style.display = "none";
  quizQuestionsContainer.style.display = "block";
  questionText.textContent = "Loading questions...";
  optionsList.innerHTML = "";
  document.getElementById("next-button").style.display = "none";
}

function fetchQuestions(category) {
  fetch(`https://opentdb.com/api.php?amount=10&category=${category}&type=multiple`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.response_code !== 0) {
        throw new Error('Failed to fetch questions from API');
      }
      questions = data.results;
      currentQuestionIndex = 0;
      score = 0;
      selectedAnswers = [];
      isAnswerSelected = false;
      loadQuestion();
    })
    .catch(error => {
      console.error("Error fetching questions:", error);
      showErrorState(error.message);
    });
}

function showErrorState(errorMessage) {
  questionText.textContent = "Sorry, we couldn't load the quiz questions.";
  optionsList.innerHTML = `
    <li style="background: #f8d7da; color: #721c24; cursor: default;">
      ${errorMessage || 'Please check your internet connection and try again.'}
    </li>
  `;
  document.getElementById("next-button").style.display = "none";
  
  // Add a retry button
  const retryButton = document.createElement("button");
  retryButton.textContent = "Try Again";
  retryButton.onclick = () => {
    categorySelectionContainer.style.display = "block";
    quizQuestionsContainer.style.display = "none";
  };
  optionsList.appendChild(retryButton);
}

function loadQuestion() {
  let currentQuestion = questions[currentQuestionIndex];
  // Use textContent to prevent XSS attacks
  questionText.textContent = decodeHtmlEntities(currentQuestion.question);
  let options = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
  shuffleArray(options);
  optionsList.innerHTML = "";
  isAnswerSelected = false;
  
  // Show next button but keep it disabled until answer is selected
  const nextButton = document.getElementById("next-button");
  nextButton.style.display = "block";
  nextButton.disabled = true;
  nextButton.textContent = "Select an answer";

  options.forEach((option, index) => {
    let optionElement = document.createElement("li");
    // Use textContent to prevent XSS attacks
    optionElement.textContent = decodeHtmlEntities(option);
    optionElement.setAttribute('tabindex', '0');
    optionElement.setAttribute('role', 'button');
    optionElement.setAttribute('aria-label', `Option ${index + 1}: ${decodeHtmlEntities(option)}`);
    
    // Add keyboard support
    optionElement.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isAnswerSelected) {
          selectAnswer(option, currentQuestion.correct_answer);
        }
      }
    };
    
    optionElement.onclick = () => {
      if (!isAnswerSelected) {
        selectAnswer(option, currentQuestion.correct_answer);
      }
    };
    optionsList.appendChild(optionElement);
  });
}

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function selectAnswer(selectedOption, correctOption) {
  if (isAnswerSelected) return; // Prevent multiple selections
  
  isAnswerSelected = true;
  let options = optionsList.children;
  
  for (let option of options) {
    option.onclick = null;
    option.onkeydown = null;
    option.style.cursor = 'default';
    
    if (option.textContent === correctOption) {
      option.classList.add("correct");
    } else if (option.textContent === selectedOption) {
      option.classList.add("incorrect");
    }
  }

  selectedAnswers.push({ 
    question: questions[currentQuestionIndex].question, 
    selectedOption, 
    correctOption 
  });

  if (selectedOption === correctOption) {
    score++;
  }

  // Enable the next button and update its text
  const nextButton = document.getElementById("next-button");
  nextButton.disabled = false;
  nextButton.textContent = currentQuestionIndex === questions.length - 1 ? "Show Results" : "Next Question";
}

function nextQuestion() {
  if (!isAnswerSelected) return; // Prevent advancing without selecting an answer
  
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
    // Use textContent for security and decode HTML entities
    const questionDiv = document.createElement("div");
    questionDiv.innerHTML = `<strong>Q: </strong>`;
    questionDiv.appendChild(document.createTextNode(decodeHtmlEntities(question)));
    
    const answerDiv = document.createElement("div");
    answerDiv.innerHTML = `<strong>Your Answer: </strong>`;
    answerDiv.appendChild(document.createTextNode(decodeHtmlEntities(selectedOption)));
    answerDiv.appendChild(document.createTextNode(` ${selectedOption === correctOption ? "✅" : "❌"}`));
    
    const correctDiv = document.createElement("div");
    correctDiv.innerHTML = `<strong>Correct Answer: </strong>`;
    correctDiv.appendChild(document.createTextNode(decodeHtmlEntities(correctOption)));
    
    resultText.appendChild(questionDiv);
    resultText.appendChild(answerDiv);
    resultText.appendChild(correctDiv);
    resultText.style.marginBottom = "15px";
    answerSummary.appendChild(resultText);
  });
}

function restartQuiz() {
  // Reset all state variables
  currentQuestionIndex = 0;
  score = 0;
  questions = [];
  selectedAnswers = [];
  isAnswerSelected = false;
  
  // Reset UI
  resultContainer.style.display = "none";
  categorySelectionContainer.style.display = "block";
  quizQuestionsContainer.style.display = "none";
}

function shuffleArray(arr) {
  // Fisher-Yates shuffle algorithm for truly random shuffling
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
