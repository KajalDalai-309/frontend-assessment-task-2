async function fetchQuestions(amount, difficulty) {
  const url = `https://opentdb.com/api.php?amount=${amount}&difficulty=${difficulty}&type=multiple`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('network');

  const data = await res.json();

  if (data.response_code === 1) throw new Error('not_enough');
  if (data.response_code === 5) throw new Error('rate_limit');
  if (data.response_code !== 0) throw new Error('api_error');

  return data.results;
}

function decodeHTML(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function getBestScore() {
  try {
    const val = localStorage.getItem('quiz_best_score');
    const num = parseInt(val);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    const current = getBestScore();
    if (score > current) {
      localStorage.setItem('quiz_best_score', score);
    }
  } catch {
    // localStorage blocked (private browsing)
  }
}

