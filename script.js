// Ждём полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {

// Получаем данные из базы
const hiragana = japaneseData.hiragana;
const radicals = japaneseData.radicals;

// Функция создания карточки
function buildCard(item, isRadical, day) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.day = day; // Добавляем атрибут дня
  
  if (isRadical) {
    card.innerHTML = `
      <div class="card-char">${item.ch}</div>
      <div class="card-reading">${item.r} — ${item.mean}</div>
      <div class="radical-card-mnemonic">
        <div class="mnemonic-label">Форма / смысл</div>
        <div class="mnemonic-text">${item.mForm}</div>
        <div class="mnemonic-label">Звучание</div>
        <div class="mnemonic-text">${item.mSound}</div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="card-char">${item.ch}</div>
      <div class="card-reading">${item.r}</div>
      <div class="card-mnemonic">${item.m}</div>
    `;
  }
  
  card.onclick = () => {
    const mn = card.querySelector(isRadical ? '.radical-card-mnemonic' : '.card-mnemonic');
    mn.style.display = mn.style.display === 'none' || !mn.style.display ? 'block' : 'none';
  };
  
  return card;
}

// Генерация карточек хираганы
const hGrid = document.getElementById('hiragana-grid');
hiragana.forEach((item, index) => {
  const day = index < 10 ? 'day1' : 'day2'; // Первые 10 - день 1, остальные - день 2
  hGrid.appendChild(buildCard(item, false, day));
});

// Генерация карточек радикалов
const radGrid = document.getElementById('radical-grid');
radicals.forEach((item, index) => {
  const day = index < 5 ? 'day1' : 'day2'; // Первые 5 - день 1, остальные - день 2
  radGrid.appendChild(buildCard(item, true, day));
});

// Переключение табов
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    // Убираем активность со всех табов
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
    });
    
    // Активируем текущий таб
    btn.classList.add('active');
    
    // Скрываем все панели
    document.querySelectorAll('.panel').forEach(p => p.style.display = 'none');
    
    // Показываем нужную панель
    document.getElementById('panel-' + btn.dataset.tab).style.display = 'block';
  };
});

// Фильтрация карточек
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.onclick = () => {
    const filter = btn.dataset.filter;
    const target = btn.dataset.target;
    
    // Убираем активность со всех кнопок фильтра в этой группе
    const container = btn.closest('.filter-container');
    container.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
    });
    
    // Активируем текущую кнопку
    btn.classList.add('active');
    
    // Фильтруем карточки
    const gridId = target === 'hiragana' ? 'hiragana-grid' : 'radical-grid';
    const cards = document.querySelectorAll(`#${gridId} .card`);
    
    cards.forEach((card, index) => {
      if (filter === 'all') {
        card.style.display = 'block';
        // Добавляем задержку для красивой анимации
        setTimeout(() => {
          card.style.animation = 'cardFadeIn 0.4s ease';
        }, index * 30);
      } else {
        if (card.dataset.day === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.animation = 'cardFadeIn 0.4s ease';
          }, index * 30);
        } else {
          card.style.display = 'none';
        }
      }
    });
  };
});

// Квиз
const quizPool = [
  ...hiragana.map((h, i) => ({ch: h.ch, r: h.r, day: i < 10 ? 'day1' : 'day2'})), 
  ...radicals.map((r, i) => ({ch: r.ch, r: r.r.split(' / ')[0].split(' ')[0], day: i < 5 ? 'day1' : 'day2'}))
];
let quizOrder = [];
let quizIdx = 0;
let correctCount = 0;
let currentQuizFilter = 'all';

// Перемешивание массива
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Запуск квиза
function startQuiz() {
  // Фильтруем пул вопросов в зависимости от выбранного фильтра
  let filteredPool = quizPool;
  if (currentQuizFilter !== 'all') {
    filteredPool = quizPool.filter(item => item.day === currentQuizFilter);
  }
  
  quizOrder = shuffle(filteredPool);
  quizIdx = 0;
  correctCount = 0;
  document.getElementById('quiz-correct').textContent = '0';
  document.getElementById('quiz-input').style.display = '';
  document.getElementById('quiz-check').style.display = '';
  document.getElementById('quiz-skip').style.display = '';
  showQuizItem();
}

// Показать текущий вопрос
function showQuizItem() {
  if (quizIdx >= quizOrder.length) {
    document.getElementById('quiz-char').textContent = '🎉';
    document.getElementById('quiz-question').textContent = 'Готово! Все знаки пройдены.';
    document.getElementById('quiz-progress').textContent = `Правильно ${correctCount} из ${quizOrder.length}`;
    document.getElementById('quiz-input').style.display = 'none';
    document.getElementById('quiz-check').style.display = 'none';
    document.getElementById('quiz-skip').style.display = 'none';
    document.getElementById('quiz-feedback').textContent = '';
    return;
  }
  
  const item = quizOrder[quizIdx];
  document.getElementById('quiz-char').textContent = item.ch;
  document.getElementById('quiz-progress').textContent = `Вопрос ${quizIdx + 1} из ${quizOrder.length}`;
  document.getElementById('quiz-input').value = '';
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-input').focus();
}

// Проверка ответа
function checkAnswer() {
  const item = quizOrder[quizIdx];
  const val = document.getElementById('quiz-input').value.trim().toLowerCase();
  const fb = document.getElementById('quiz-feedback');
  
  if (val === item.r.toLowerCase()) {
    correctCount++;
    document.getElementById('quiz-correct').textContent = correctCount;
    fb.textContent = '✓ Верно!';
    fb.style.color = 'var(--color-success)';
    quizIdx++;
    setTimeout(showQuizItem, 600);
  } else {
    fb.textContent = `✗ Неверно — правильный ответ: ${item.r}`;
    fb.style.color = 'var(--color-danger)';
  }
}

// Обработчики событий квиза
document.getElementById('quiz-check').onclick = checkAnswer;
document.getElementById('quiz-input').addEventListener('keydown', e => { 
  if (e.key === 'Enter') checkAnswer(); 
});
document.getElementById('quiz-skip').onclick = () => { 
  quizIdx++; 
  showQuizItem(); 
};
document.getElementById('quiz-restart').onclick = startQuiz;

// Фильтрация квиза
document.querySelectorAll('[data-quiz-filter]').forEach(btn => {
  btn.onclick = () => {
    currentQuizFilter = btn.dataset.quizFilter;
    
    // Убираем активность со всех кнопок
    const container = btn.closest('.filter-container');
    container.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active');
    });
    
    // Активируем текущую кнопку
    btn.classList.add('active');
    
    // Перезапускаем квиз с новым фильтром
    startQuiz();
  };
});

// Запускаем квиз при загрузке
startQuiz();

}); // Конец DOMContentLoaded
