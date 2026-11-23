# frontend-assessment-task-2

A quiz app built with vanilla HTML, CSS and JavaScript. It fetches questions from the Open Trivia DB API and lets you test your general knowledge with a timer.

No libraries or frameworks used.

---

## How to run

Clone the repo and open `index.html` directly in your browser. No build step needed.

```bash
git clone https://github.com/KajalDalai-309/frontend-assessment-task-2.git
cd frontend-assessment-task-2
```

Then double click `index.html` or use VS Code Live Server.

You need an internet connection because questions are fetched from an external API.

---

## Folder structure

```
frontend-assessment-task-2/
├── index.html     - page structure and all three screens
├── styles.css     - all styling and responsive layout
├── api.js         - fetch logic, HTML decoding, localStorage helpers
├── quiz.js        - Quiz class (state, scoring, answer tracking)
├── ui.js          - DOM rendering, timer, event handling
└── README.md
```

---

## How it works

**Start screen** — enter your name, pick how many questions (5, 10 or 15) and choose a difficulty (easy, medium or hard), then hit Start.

**Quiz screen** — one question at a time with four shuffled options as radio buttons. A 15-second countdown runs for each question. If time runs out, the app moves to the next question automatically and marks it as skipped.

**Result screen** — shows your score, percentage and your all-time best score. Below that is a full review of every question with what you answered and what the correct answer was. Hit "Play Again" to go back to the start screen.

Best score is saved in localStorage so it sticks between sessions.

---

## API

Questions are fetched from Open Trivia DB:

```
GET https://opentdb.com/api.php?amount={n}&difficulty={d}&type=multiple
```

The API returns a `response_code` field. Code `0` means success. Any other code is treated as an error.

---

## Validations

- Name is required, trimmed, and must be 2–20 characters
- Question count must be 5, 10 or 15 (checked in JS even though the UI uses a dropdown)
- Difficulty must be easy, medium or hard (same check)
- User must select an answer before clicking Next — unless the timer already ran out

---

## Error handling

| Situation | What the app shows |
|-----------|-------------------|
| Network failure | "Could not load questions. Check your connection." + Retry button |
| response_code 1 (not enough questions) | "Not enough questions for these settings. Try choosing fewer questions." |
| response_code 5 (rate limit) | "Too many requests. Wait a few seconds and try again." |
| Timer runs out | Question is auto-skipped and marked wrong in the review |
| localStorage blocked | Silently ignored, best score just won't persist |

---

## Known limitations

- Open Trivia DB sometimes rate-limits if you restart the quiz too quickly — waiting a few seconds fixes it
- The API only has multiple choice questions (4 options), no true/false in this version
- No category filter, questions are from general knowledge mix

