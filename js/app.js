/* =========================================================
   Ертегіден экранға — қолданба логикасы
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Ертегілер торын көрсету ---------- */
  const storyGrid = document.getElementById("storyGrid");
  const storyCount = document.getElementById("storyCount");
  const noResults = document.getElementById("noResults");
  const searchInput = document.getElementById("storySearch");

  function renderStories(list) {
    storyGrid.innerHTML = "";
    list.forEach(function (s) {
      const card = document.createElement("article");
      card.className = "story-card reveal";
      const chips = s.values.slice(0, 4).map(function (v) {
        return "<li>" + v + "</li>";
      }).join("");
      card.innerHTML =
        '<svg class="story-icon" aria-hidden="true"><use href="#' + s.icon + '"/></svg>' +
        "<h3>" + s.title + "</h3>" +
        '<p class="story-teaser">' + s.teaser + "</p>" +
        '<ul class="story-values">' + chips + "</ul>" +
        '<button class="story-btn" type="button" data-open-story="' + s.id + '">Толығырақ оқу <span aria-hidden="true">→</span></button>';
      storyGrid.appendChild(card);
    });
    storyCount.textContent = list.length === STORIES.length
      ? "Барлығы " + STORIES.length + " ертегі"
      : list.length + " ертегі табылды";
    noResults.hidden = list.length !== 0;
    observeReveals();
  }

  searchInput.addEventListener("input", function () {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = STORIES.filter(function (s) {
      return s.title.toLowerCase().indexOf(q) !== -1 ||
             s.teaser.toLowerCase().indexOf(q) !== -1;
    });
    renderStories(filtered);
  });

  /* ---------- Ертегі модальдық терезесі ---------- */
  const modal = document.getElementById("storyModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalUse = document.getElementById("modalUse");
  let lastFocus = null;

  function openStory(id) {
    const s = STORIES.find(function (x) { return x.id === id; });
    if (!s) return;
    lastFocus = document.activeElement;
    modalTitle.textContent = s.title;
    modalUse.setAttribute("href", "#" + s.icon);
    modalBody.innerHTML =
      '<section class="modal-section"><h4>Қысқаша мазмұны</h4><p>' + s.summary + "</p></section>" +
      '<section class="modal-section"><h4>Мультфильммен салыстыру</h4><p>' + s.cartoon + "</p></section>" +
      '<section class="modal-section"><h4>Ұлттық құндылықтар</h4><p>' + s.valuesText + '</p><ul class="modal-values" style="margin-top:12px">' +
        s.values.map(function (v) { return "<li>" + v + "</li>"; }).join("") + "</ul></section>" +
      '<section class="modal-section"><h4>Тәрбиелік мәні</h4><p>' + s.moral + "</p></section>" +
      '<section class="modal-section"><h4>Автордың пікірі</h4><p>' + s.opinion + "</p></section>";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }

  function closeStory() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    const opener = e.target.closest("[data-open-story]");
    if (opener) { openStory(opener.getAttribute("data-open-story")); return; }
    if (e.target.closest("[data-close]")) closeStory();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("open")) closeStory();
  });

  /* Басты беттегі чиптер — ертегіні бірден ашу */
  document.querySelectorAll("[data-story-link]").forEach(function (chip) {
    chip.addEventListener("click", function (e) {
      e.preventDefault();
      openStory(chip.getAttribute("data-story-link"));
    });
  });

  /* ---------- Ұлттық құндылықтар ---------- */
  const cultureGrid = document.getElementById("cultureGrid");
  CULTURE.forEach(function (c) {
    const card = document.createElement("article");
    card.className = "culture-card reveal";
    card.innerHTML =
      '<svg class="culture-icon" aria-hidden="true"><use href="#' + c.icon + '"/></svg>' +
      "<h3>" + c.title + "</h3>" +
      "<p>" + c.desc + "</p>" +
      '<span class="culture-stories">Кездеседі: ' + c.stories + "</span>";
    cultureGrid.appendChild(card);
  });

  /* ---------- Салыстыру кестелері ---------- */
  const compareList = document.getElementById("compareList");
  COMPARISONS.forEach(function (cmp) {
    const s = STORIES.find(function (x) { return x.id === cmp.storyId; });
    const card = document.createElement("article");
    card.className = "compare-card reveal";
    let rowsHtml = "";
    cmp.rows.forEach(function (row) {
      rowsHtml +=
        '<div class="compare-row">' +
          '<div class="compare-crit">' + row[0] + "</div>" +
          '<div class="compare-cell book"><strong>Ертегінің түпнұсқасы</strong>' + row[1] + "</div>" +
          '<div class="compare-cell toon"><strong>Мультфильм нұсқасы</strong>' + row[2] + "</div>" +
        "</div>";
    });
    card.innerHTML =
      '<div class="compare-card-head"><svg aria-hidden="true"><use href="#' + s.icon + '"/></svg><h3>' + s.title + "</h3></div>" +
      '<p class="compare-card-note">' + cmp.note + "</p>" +
      '<div class="compare-rows">' + rowsHtml + "</div>";
    compareList.appendChild(card);
  });

  document.getElementById("printBtn").addEventListener("click", function () {
    window.print();
  });

  /* ---------- Викторина ---------- */
  const quizBox = document.getElementById("quizBox");
  const LETTERS = ["А", "Ә", "Б", "В"];
  let quizState = { index: 0, score: 0, answered: false };

  function renderQuizStart() {
    quizBox.innerHTML =
      '<div class="quiz-start">' +
        '<svg class="quiz-start-icon" aria-hidden="true"><use href="#i-quiz"/></svg>' +
        "<h3>Викторинаға дайынсыз ба?</h3>" +
        '<ul class="quiz-rules">' +
          "<li>Барлығы " + QUIZ.length + " сұрақ, әр сұрақта төрт жауап нұсқасы.</li>" +
          "<li>Әр жауаптан кейін дұрыс жауап пен қысқаша түсіндірме ашылады.</li>" +
          "<li>Дұрыс жауап тек таңдағаннан кейін көрсетіледі.</li>" +
          "<li>Соңында ұпай саны және бағалау беріледі.</li>" +
        "</ul>" +
        '<button class="btn btn-primary" type="button" id="quizStartBtn">Викторинаны бастау</button>' +
      "</div>";
    document.getElementById("quizStartBtn").addEventListener("click", function () {
      quizState = { index: 0, score: 0, answered: false };
      renderQuizQuestion();
    });
  }

  function renderQuizQuestion() {
    const item = QUIZ[quizState.index];
    quizState.answered = false;
    const opts = item.options.map(function (opt, i) {
      return '<button class="quiz-option" type="button" data-opt="' + i + '">' +
        '<span class="opt-letter">' + LETTERS[i] + "</span><span>" + opt + "</span></button>";
    }).join("");
    quizBox.innerHTML =
      '<div class="quiz-progress-meta">' +
        "<span>Сұрақ " + (quizState.index + 1) + " / " + QUIZ.length + "</span>" +
        "<span>Ұпай: " + quizState.score + "</span>" +
      "</div>" +
      '<div class="quiz-progress"><span style="width:' + ((quizState.index) / QUIZ.length * 100) + '%"></span></div>' +
      '<h3 class="quiz-question">' + item.q + "</h3>" +
      '<div class="quiz-options">' + opts + "</div>" +
      '<div class="quiz-feedback" id="quizFeedback" aria-live="polite"></div>' +
      '<div class="quiz-next" id="quizNext"></div>';

    quizBox.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () { answerQuestion(parseInt(btn.dataset.opt, 10)); });
    });
  }

  function answerQuestion(choice) {
    if (quizState.answered) return;
    quizState.answered = true;
    const item = QUIZ[quizState.index];
    const buttons = quizBox.querySelectorAll(".quiz-option");
    buttons.forEach(function (b) { b.disabled = true; });
    buttons[item.correct].classList.add("correct");
    const isRight = choice === item.correct;
    if (!isRight) buttons[choice].classList.add("wrong");
    if (isRight) quizState.score += 1;

    const fb = document.getElementById("quizFeedback");
    fb.className = "quiz-feedback show " + (isRight ? "good" : "bad");
    fb.innerHTML = "<strong>" + (isRight ? "Дұрыс!" : "Дұрыс емес.") + "</strong>" + item.explain;

    quizBox.querySelector(".quiz-progress span").style.width =
      ((quizState.index + 1) / QUIZ.length * 100) + "%";
    quizBox.querySelector(".quiz-progress-meta span:last-child").textContent = "Ұпай: " + quizState.score;

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-primary";
    nextBtn.type = "button";
    nextBtn.textContent = quizState.index + 1 === QUIZ.length ? "Нәтижені көрсету" : "Келесі сұрақ";
    nextBtn.addEventListener("click", function () {
      quizState.index += 1;
      if (quizState.index < QUIZ.length) renderQuizQuestion();
      else renderQuizResult();
    });
    document.getElementById("quizNext").appendChild(nextBtn);
    nextBtn.focus();
  }

  function renderQuizResult() {
    const verdict = quizVerdict(quizState.score, QUIZ.length);
    quizBox.innerHTML =
      '<div class="quiz-result">' +
        '<div class="quiz-score"><b>' + quizState.score + " / " + QUIZ.length + "</b><small>Ұпай</small></div>" +
        "<h3>Викторина аяқталды!</h3>" +
        "<p>" + verdict + "</p>" +
        '<div class="quiz-result-actions">' +
          '<button class="btn btn-primary" type="button" id="quizRestart">Қайта өту</button>' +
          '<a class="btn btn-outline" href="#stories" id="quizBack">Ертегілерге оралу</a>' +
        "</div>" +
      "</div>";
    document.getElementById("quizRestart").addEventListener("click", function () {
      quizState = { index: 0, score: 0, answered: false };
      renderQuizQuestion();
    });
  }

  renderQuizStart();

  /* ---------- Навигация ---------- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  navToggle.addEventListener("click", function () {
    const open = navMenu.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Мәзірді жабу" : "Мәзірді ашу");
  });
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* Белсенді бөлімді белгілеу */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = navMenu.querySelectorAll("a");
  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navLinks.forEach(function (l) {
        l.classList.toggle("active", l.getAttribute("href") === "#" + id);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(function (s) { sectionObserver.observe(s); });

  /* ---------- Прокатка: прогресс, хедер, жоғарыға оралу ---------- */
  const progressBar = document.getElementById("progressBar");
  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.width = (max > 0 ? (doc.scrollTop / max) * 100 : 0) + "%";
    header.classList.toggle("scrolled", doc.scrollTop > 10);
    toTop.hidden = doc.scrollTop < 600;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Пайда болу анимациясы ---------- */
  function observeReveals() {
    const items = document.querySelectorAll(".reveal:not(.visible)");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Бастапқы көрсету ---------- */
  renderStories(STORIES);
  observeReveals();
})();
