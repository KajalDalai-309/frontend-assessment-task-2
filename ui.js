let quiz = null;
let timerInterval = null;
let timeLeft = 15;
let currentOptions = [];
let lastSettings = {};

const startScreen = document.getElementById('startScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');

function showScreen(name) {
  startScreen.className = 'screen hidden';
  quizScreen.className = 'screen hidden';
  resultScreen.className = 'screen hidden';
  document.getElementById(name + 'Screen').className = 'screen active';
}

function showBestScoreOnStart() {
  const best = getBestScore();
  const el = document.getElementById('bestScoreDisplay');
  el.textContent = best > 0 ? `Your best score: ${best} correct answers` : '';
}

showBestScoreOnStart();

document.getElementById('startForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nameInput = document.getElementById('playerName');
  const nameErr = document.getElementById('nameErr');
  const name = nameInput.value.trim();

  if (!name || name.length < 2 || name.length > 20) {
    nameErr.textContent = 'Name must be 2 to 20 characters.';
    nameInput.classList.add('invalid');
    return;
  }
  nameErr.textContent = '';
  nameInput.classList.remove('invalid');

  const amount = document.getElementById('questionCount').value;
  const difficulty = document.getElementById('difficulty').value;

  const validAmounts = ['5', '10', '15'];
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!validAmounts.includes(amount) || !validDifficulties.includes(difficulty)) {
    showStartError('Invalid selection. Please use the provided options.');
    return;
  }

  lastSettings = { name, amount, difficulty };

  const btn = document.getElementById('startBtn');
  btn.disabled = true;
  btn.textContent = 'Loading...';
  hideStartError();

  try {
    const questions = await fetchQuestions(amount, difficulty);
    quiz = new Quiz(questions, name);
    showScreen('quiz');
    renderQuestion();
  } catch (err) {
    handleFetchError(err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Start Quiz';
  }
});

function handleFetchError(err) {
  if (err.message === 'not_enough') {
    showStartError('Not enough questions for these settings. Try choosing fewer questions.', false);
  } else if (err.message === 'rate_limit') {
    showStartError('Too many requests. Wait a few seconds and try again.', false);
  } else {
    showStartError('Could not load questions. Check your connection.', true);
  }
}

function showStartError(msg, showRetry = false) {
  const el = document.getElementById('startErr');
  el.classList.remove('hidden');
  el.innerHTML = msg;
  if (showRetry) {
    const btn = document.createElement('button');
    btn.textContent = 'Retry';
    btn.onclick = () => document.getElementById('startForm').dispatchEvent(new Event('submit'));
    el.appendChild(btn);
  }
}

function hideStartError() {
  const el = document.getElementById('startErr');
  el.classList.add('hidden');
  el.innerHTML = '';
}

function renderQuestion() {
  if (quiz.isFinished()) {
    showResults();
    return;
  }

  clearTimer();

  const q = quiz.getCurrentQuestion();
  const total = quiz.questions.length;
  const current = quiz.currentIndex + 1;

  document.getElementById('playerLabel').textContent = quiz.playerName;
  document.getElementById('questionCounter').textContent = `Question ${current} of ${total}`;
  document.getElementById('progressBar').style.width = `${((current - 1) / total) * 100}%`;
  document.getElementById('questionText').textContent = decodeHTML(q.question);
  document.getElementById('answerErr').textContent = '';

  currentOptions = quiz.getShuffledOptions();
  const list = document.getElementById('optionsList');
  list.innerHTML = currentOptions.map((opt, i) => `
    <label class="option-label" id="label-${i}">
      <input type="radio" name="answer" value="${escapeAttr(opt)}" />
      ${opt}
    </label>
  `).join('');

  list.querySelectorAll('input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      list.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
      radio.closest('.option-label').classList.add('selected');
      document.getElementById('answerErr').textContent = '';
    });
  });

  startTimer(total, current);
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function startTimer(total, current) {
  timeLeft = 15;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearTimer();
      quiz.skipQuestion();
      renderQuestion();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const el = document.getElementById('timerDisplay');
  const wrap = el.closest('.timer-wrap');
  el.textContent = timeLeft;
  if (timeLeft <= 5) {
    wrap.classList.add('urgent');
  } else {
    wrap.classList.remove('urgent');
  }
}

function clearTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

document.getElementById('nextBtn').addEventListener('click', () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) {
    document.getElementById('answerErr').textContent = 'Please select an answer before continuing.';
    return;
  }
  clearTimer();
  quiz.submitAnswer(selected.value);
  renderQuestion();
});

function showResults() {
  clearTimer();
  const r = quiz.getResults();
  saveBestScore(r.score);
  const best = getBestScore();

  document.getElementById('resultTitle').textContent = `Well done, ${r.playerName}!`;
  document.getElementById('bigScore').textContent = `${r.score}/${r.total}`;
  document.getElementById('percentageText').innerHTML = `Percentage: <strong>${r.percentage}%</strong>`;
  document.getElementById('bestScoreText').innerHTML = `Best score: <strong>${best} correct</strong>`;

  const reviewList = document.getElementById('reviewList');
  reviewList.innerHTML = r.answers.map((item, i) => {
    const cls = item.isCorrect ? 'correct' : 'wrong';
    const userAnsHTML = item.userAnswer === null
      ? `<span class="skipped">Skipped (time ran out)</span>`
      : item.isCorrect
        ? `<span class="correct-ans">Your answer: ${item.userAnswer} ✓</span>`
        : `<span class="wrong-ans">Your answer: ${item.userAnswer} ✗</span>`;

    const correctLine = !item.isCorrect
      ? `<span class="correct-ans">Correct: ${item.correctAnswer}</span>`
      : '';

    return `
      <div class="review-item ${cls}">
        <div class="review-question">Q${i + 1}. ${item.question}</div>
        <div class="review-answers">
          ${userAnsHTML}
          ${correctLine}
        </div>
      </div>
    `;
  }).join('');

  showScreen('result');
}

document.getElementById('restartBtn').addEventListener('click', () => {
  quiz = null;
  showBestScoreOnStart();
  hideStartError();
  showScreen('start');
});

