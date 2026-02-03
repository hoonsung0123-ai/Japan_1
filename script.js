// 일본어 단어 데이터 (일본어, 로마자, 한국어 뜻)
const VOCABULARY = [
  { ja: "水", romaji: "mizu", ko: "물" },
  { ja: "火", romaji: "hi", ko: "불" },
  { ja: "山", romaji: "yama", ko: "산" },
  { ja: "川", romaji: "kawa", ko: "강" },
  { ja: "人", romaji: "hito", ko: "사람" },
  { ja: "日", romaji: "hi", ko: "날, 해" },
  { ja: "月", romaji: "tsuki", ko: "달" },
  { ja: "木", romaji: "ki", ko: "나무" },
  { ja: "金", romaji: "kane", ko: "돈, 금속" },
  { ja: "土", romaji: "tsuchi", ko: "흙" },
  { ja: "食べる", romaji: "taberu", ko: "먹다" },
  { ja: "飲む", romaji: "nomu", ko: "마시다" },
  { ja: "行く", romaji: "iku", ko: "가다" },
  { ja: "来る", romaji: "kuru", ko: "오다" },
  { ja: "見る", romaji: "miru", ko: "보다" },
  { ja: "聞く", romaji: "kiku", ko: "듣다, 묻다" },
  { ja: "話す", romaji: "hanasu", ko: "말하다" },
  { ja: "読む", romaji: "yomu", ko: "읽다" },
  { ja: "書く", romaji: "kaku", ko: "쓰다" },
  { ja: "勉強", romaji: "benkyou", ko: "공부" },
  { ja: "学校", romaji: "gakkou", ko: "학교" },
  { ja: "友達", romaji: "tomodachi", ko: "친구" },
  { ja: "家族", romaji: "kazoku", ko: "가족" },
  { ja: "今日", romaji: "kyou", ko: "오늘" },
  { ja: "明日", romaji: "ashita", ko: "내일" },
  { ja: "昨日", romaji: "kinou", ko: "어제" },
  { ja: "時間", romaji: "jikan", ko: "시간" },
  { ja: "元気", romaji: "genki", ko: "건강, 기운" },
  { ja: "ありがとう", romaji: "arigatou", ko: "감사합니다" },
  { ja: "すみません", romaji: "sumimasen", ko: "죄송합니다" },
  { ja: "おはよう", romaji: "ohayou", ko: "안녕 (아침)" },
  { ja: "こんにちは", romaji: "konnichiwa", ko: "안녕하세요" },
  { ja: "こんばんは", romaji: "konbanwa", ko: "안녕하세요 (저녁)" },
  { ja: "大きい", romaji: "ookii", ko: "크다" },
  { ja: "小さい", romaji: "chiisai", ko: "작다" },
  { ja: "新しい", romaji: "atarashii", ko: "새롭다" },
  { ja: "古い", romaji: "furui", ko: "오래되다" },
  { ja: "暑い", romaji: "atsui", ko: "덥다" },
  { ja: "寒い", romaji: "samui", ko: "춥다" },
];

const screens = {
  start: document.getElementById("start-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
};

const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const nextBtn = document.getElementById("next-btn");
const quizModeSelect = document.getElementById("quiz-mode");
const quizCountSelect = document.getElementById("quiz-count");

let currentQuiz = [];
let currentIndex = 0;
let score = 0;
let answered = false;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandomChoices(correctValue, key = "ko", count = 4) {
  const others = VOCABULARY
    .map((v) => v[key])
    .filter((val) => val !== correctValue);
  const shuffled = shuffle(others);
  const picks = shuffled.slice(0, count - 1);
  const choices = [...picks, correctValue];
  return shuffle(choices);
}

function buildQuiz() {
  const mode = quizModeSelect.value;
  const count = Math.min(
    parseInt(quizCountSelect.value, 10),
    VOCABULARY.length
  );
  const pool = shuffle(VOCABULARY).slice(0, count);

  return pool.map((item) => {
    const questionMode =
      mode === "mixed"
        ? Math.random() < 0.5
          ? "ja-to-ko"
          : "ko-to-ja"
        : mode;
    const choices =
      questionMode === "ko-to-ja"
        ? getRandomChoices(item.ja, "ja", 4).map((text) => ({
            text,
            isCorrect: text === item.ja,
          }))
        : getRandomChoices(item.ko, "ko", 4).map((text) => ({
            text,
            isCorrect: text === item.ko,
          }));

    return {
      ...item,
      mode: questionMode,
      choices,
    };
  });
}

function showScreen(name) {
  Object.values(screens).forEach((el) => el.classList.remove("active"));
  screens[name].classList.add("active");
}

function renderQuestion() {
  answered = false;
  const total = currentQuiz.length;
  const item = currentQuiz[currentIndex];
  const questionText = document.getElementById("question-text");
  const romajiHint = document.getElementById("romaji-hint");
  const choicesEl = document.getElementById("choices");
  const currentNum = document.getElementById("current-num");
  const totalNum = document.getElementById("total-num");
  const progressFill = document.getElementById("progress-fill");

  currentNum.textContent = currentIndex + 1;
  totalNum.textContent = total;
  progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  if (item.mode === "ko-to-ja") {
    questionText.textContent = item.ko;
    romajiHint.textContent = "";
  } else {
    questionText.textContent = item.ja;
    romajiHint.textContent = `(${item.romaji})`;
  }

  choicesEl.innerHTML = "";
  item.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => handleAnswer(btn, choice.isCorrect));
    choicesEl.appendChild(btn);
  });

  nextBtn.style.display = "none";
}

function handleAnswer(clickedBtn, isCorrect) {
  if (answered) return;
  answered = true;

  const choices = document.querySelectorAll(".choice-btn");
  choices.forEach((btn) => (btn.disabled = true));

  if (isCorrect) {
    score += 1;
    clickedBtn.classList.add("correct");
  } else {
    clickedBtn.classList.add("wrong");
    choices.forEach((btn) => {
      if (btn.textContent === (currentQuiz[currentIndex].mode === "ko-to-ja"
            ? currentQuiz[currentIndex].ja
            : currentQuiz[currentIndex].ko)) {
        btn.classList.add("correct");
      }
    });
  }

  nextBtn.style.display = "block";
}

function nextQuestion() {
  currentIndex += 1;
  if (currentIndex < currentQuiz.length) {
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  const total = currentQuiz.length;
  document.getElementById("score-value").textContent = score;
  document.getElementById("total-value").textContent = total;

  let message = "";
  const ratio = score / total;
  if (ratio >= 1) message = "완벽해요! 🎌";
  else if (ratio >= 0.8) message = "아주 잘했어요!";
  else if (ratio >= 0.6) message = "잘했어요. 조금만 더 연습해 보세요.";
  else message = "다시 도전해 보세요!";

  document.getElementById("result-message").textContent = message;
  showScreen("result");
}

function startQuiz() {
  currentQuiz = buildQuiz();
  currentIndex = 0;
  score = 0;
  showScreen("quiz");
  renderQuestion();
}

startBtn.addEventListener("click", startQuiz);
retryBtn.addEventListener("click", () => showScreen("start"));
nextBtn.addEventListener("click", nextQuestion);

/* 연락하기 모달 */
const contactOverlay = document.getElementById("contact-overlay");
const contactOpenBtn = document.getElementById("contact-open-btn");
const contactCloseBtn = document.getElementById("contact-close-btn");
const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("contact-message");
const contactSubmitBtn = document.getElementById("contact-submit-btn");

function openContactModal() {
  contactOverlay.classList.add("is-open");
  contactOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeContactModal() {
  contactOverlay.classList.remove("is-open");
  contactOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function setContactMessage(text, type) {
  contactMessage.textContent = text;
  contactMessage.className = "contact-message " + (type || "");
}

contactOpenBtn.addEventListener("click", openContactModal);
contactCloseBtn.addEventListener("click", closeContactModal);
contactOverlay.addEventListener("click", (e) => {
  if (e.target === contactOverlay) closeContactModal();
});

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const payload = {
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    email: formData.get("email").trim(),
  };

  contactSubmitBtn.disabled = true;
  setContactMessage("전송 중…");

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setContactMessage("제출되었습니다. 연락드리겠습니다.", "success");
      contactForm.reset();
      setTimeout(closeContactModal, 1500);
    } else {
      setContactMessage(data.message || "전송에 실패했습니다. 다시 시도해 주세요.", "error");
    }
  } catch (err) {
    setContactMessage("네트워크 오류입니다. 서버가 실행 중인지 확인해 주세요.", "error");
  } finally {
    contactSubmitBtn.disabled = false;
  }
});
