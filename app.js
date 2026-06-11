// ===== STATE =====
let currentSubject = null;
let currentIndex = 0;
let userAnswers = []; // null = ຍັງບໍ່ຕອບ, number = index ຕອບ

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderSubjectGrid();
});

function renderSubjectGrid() {
  const grid = document.getElementById('subject-grid');
  grid.innerHTML = '';
  SUBJECTS.forEach(sub => {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <span class="s-icon">${sub.icon}</span>
      <span class="s-name">${sub.name}</span>
      <span class="s-count">${sub.questions.length} ຂໍ້</span>
    `;
    card.onclick = () => startQuiz(sub.id);
    grid.appendChild(card);
  });
}

// ===== NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

function goHome() {
  if (confirm('ອອກຈາກການທົດສອບ? ຄຳຕອບຈະຖືກລຶບ')) {
    currentSubject = null;
    userAnswers = [];
    showPage('page-home');
  }
}

// ===== QUIZ =====
function startQuiz(subjectId) {
  currentSubject = SUBJECTS.find(s => s.id === subjectId);
  currentIndex = 0;
  userAnswers = new Array(currentSubject.questions.length).fill(null);

  document.getElementById('quiz-subject-label').textContent = currentSubject.name;
  showPage('page-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = currentSubject.questions[currentIndex];
  const total = currentSubject.questions.length;

  // Counter & progress
  document.getElementById('question-counter').textContent = `${currentIndex + 1} / ${total}`;
  document.getElementById('q-number').textContent = `ຂໍ້ທີ ${currentIndex + 1}`;
  document.getElementById('q-text').textContent = q.q;
  document.getElementById('progress-bar').style.width = `${((currentIndex + 1) / total) * 100}%`;

  // Choices
  const letters = ['ກ', 'ຂ', 'ຄ', 'ງ'];
  const container = document.getElementById('choices-container');
  container.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    if (userAnswers[currentIndex] === i) btn.classList.add('selected');
    btn.innerHTML = `<span class="choice-letter">${letters[i]}</span>${choice}`;
    btn.onclick = () => selectChoice(i);
    container.appendChild(btn);
  });

  // Nav buttons
  document.getElementById('btn-prev').style.visibility = currentIndex === 0 ? 'hidden' : 'visible';
  const isLast = currentIndex === total - 1;
  document.getElementById('btn-next').style.display  = isLast ? 'none' : 'inline-block';
  document.getElementById('btn-finish').style.display = isLast ? 'inline-block' : 'none';
}

function selectChoice(index) {
  userAnswers[currentIndex] = index;
  renderQuestion();
}

function nextQuestion() {
  if (currentIndex < currentSubject.questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
}

// ===== FINISH =====
function finishQuiz() {
  const unanswered = userAnswers.filter(a => a === null).length;
  if (unanswered > 0) {
    if (!confirm(`ຍັງມີ ${unanswered} ຂໍ້ ທີ່ຍັງບໍ່ຕອບ. ຢາກສົ່ງເລີຍໄດ້ເລີຍ~`)) return;
  }
  showResult();
}

function showResult() {
  const qs = currentSubject.questions;
  const total = qs.length;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  qs.forEach((q, i) => {
    if (userAnswers[i] === null) skipped++;
    else if (userAnswers[i] === q.answer) correct++;
    else wrong++;
  });

  const pct = Math.round((correct / total) * 100);
  const letters = ['ກ', 'ຂ', 'ຄ', 'ງ'];

  // Score & message
  document.getElementById('result-score').textContent = `${correct}/${total}`;
  document.getElementById('stat-correct').textContent = correct;
  document.getElementById('stat-wrong').textContent = wrong;
  document.getElementById('stat-skip').textContent = skipped;

  let emoji = '🎉', msg = '';
  if (pct >= 90)      { emoji = '🏆'; msg = 'ເກັ່ງຫຼາຍ! ດີຍອດ~ 💙'; }
  else if (pct >= 70) { emoji = '😊'; msg = 'ຜ່ານແລ້ວ ດີຫຼາຍ~ ສູ້ໂລດ! 🌸'; }
  else if (pct >= 50) { emoji = '😅'; msg = 'ພໍຜ່ານ... ໄຕ່ຕອງອີກໜ່ອຍ 📖'; }
  else                { emoji = '😢'; msg = 'ຍັງບໍ່ທັນຜ່ານ ລອງໃໝ່ໄດ້ເລີຍ 💪'; }

  document.getElementById('result-emoji').textContent = emoji;
  document.getElementById('result-msg').textContent = msg;

  // Wrong list
  const wrongList = document.getElementById('wrong-list');
  wrongList.innerHTML = '';
  let hasWrongOrSkip = false;

  qs.forEach((q, i) => {
    if (userAnswers[i] === q.answer) return;
    hasWrongOrSkip = true;
    const isSkip = userAnswers[i] === null;
    const div = document.createElement('div');
    div.className = `wrong-item${isSkip ? ' skipped' : ''}`;

    const myAns = isSkip
      ? '<span style="color:#aaa">ຍັງບໍ່ທັນຕອບ</span>'
      : `<span class="answer-wrong">${letters[userAnswers[i]]}. ${q.choices[userAnswers[i]]}</span>`;

    div.innerHTML = `
      <div class="wi-q">ຂໍ້ ${i + 1}: ${q.q}</div>
      <div class="wi-ans">
        <span class="label">ຕອບ:</span> ${myAns}&nbsp;&nbsp;
        <span class="label">ຄຳຕອບທີ່ຖືກ:</span> <span class="answer-correct">${letters[q.answer]}. ${q.choices[q.answer]}</span>
      </div>
    `;
    wrongList.appendChild(div);
  });

  document.getElementById('wrong-list-section').style.display = hasWrongOrSkip ? 'block' : 'none';

  // Answer key
  const keyList = document.getElementById('answer-key-list');
  keyList.innerHTML = '';
  qs.forEach((q, i) => {
    const item = document.createElement('div');
    item.className = 'key-item';
    item.innerHTML = `<span class="key-q">ຂໍ້ ${i + 1}</span><span class="key-a">${letters[q.answer]}. ${q.choices[q.answer]}</span>`;
    keyList.appendChild(item);
  });

  showPage('page-result');
}

function toggleAnswerKey() {
  const list = document.getElementById('answer-key-list');
  const btn = document.querySelector('.btn-toggle-key');
  if (list.style.display === 'none') {
    list.style.display = 'grid';
    btn.textContent = '🔑 ປິດເສລຍ';
  } else {
    list.style.display = 'none';
    btn.textContent = '🔑 ເບິ່ງເສລຍຄຳຕອບທັງໝົດ';
  }
}

function retryQuiz() {
  startQuiz(currentSubject.id);
}
