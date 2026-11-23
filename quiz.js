class Quiz {
  constructor(questions, playerName) {
    this.questions = questions;
    this.playerName = playerName;
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  getShuffledOptions() {
    const q = this.getCurrentQuestion();
    const opts = [...q.incorrect_answers, q.correct_answer].map(decodeHTML);
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }

  submitAnswer(answer) {
    const q = this.getCurrentQuestion();
    const correct = decodeHTML(q.correct_answer);
    const isCorrect = answer === correct;
    if (isCorrect) this.score++;
    this.answers.push({
      question: decodeHTML(q.question),
      userAnswer: answer,
      correctAnswer: correct,
      isCorrect,
    });
    this.currentIndex++;
  }

  skipQuestion() {
    const q = this.getCurrentQuestion();
    this.answers.push({
      question: decodeHTML(q.question),
      userAnswer: null,
      correctAnswer: decodeHTML(q.correct_answer),
      isCorrect: false,
    });
    this.currentIndex++;
  }

  isFinished() {
    return this.currentIndex >= this.questions.length;
  }

  getResults() {
    return {
      playerName: this.playerName,
      score: this.score,
      total: this.questions.length,
      percentage: Math.round((this.score / this.questions.length) * 100),
      answers: this.answers,
    };
  }
}

