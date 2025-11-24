/* =====================================================
   🇮🇳 VIDHA — Full Integrated Script
   Preamble + Topics + Articles + Quiz + Cloudflare AI
===================================================== */

/* ---------- DOM refs ---------- */
const chatArea = document.getElementById("chat-area");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const themeToggle = document.getElementById("themeToggle");
const anthemToggle = document.getElementById("anthemToggle");
const anthemAudio = document.getElementById("anthem");
const topicsSelect = document.getElementById("topics");
const quizBtn = document.getElementById("quizBtn");

/* ---------- State ---------- */
let articles = [];
let quizData = [];
let quizActive = false;
let userName = localStorage.getItem("vidha_user") || null;
let quizIndex = 0;
let score = 0;

/* ---------- Boot ---------- */
window.addEventListener("DOMContentLoaded", async() => {
    showLoading();
    // ❌ loadKnowledge() removed
    await loadArticles();
    await preloadQuiz();
    populateTopicsDropdown(); // build colored dropdown
    greetOnLoad();
});

/* ---------- UI helpers ---------- */
function showLoading() {
    chatArea.innerHTML = `
    <div class="loading flex-center">
      <div class="spinner"></div>
      <p style="margin-left:1rem;">🔄 Loading verified constitutional information...</p>
    </div>`;
}

function addUserBubble(text) {
    const d = document.createElement("div");
    d.className = "message message-user";
    d.textContent = text;
    chatArea.appendChild(d);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function typeBotMessage(messageHtml) {
    const typing = document.createElement("div");
    typing.className = "typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    chatArea.appendChild(typing);

    // Instantly replace typing with message
    typing.remove();

    const bubble = document.createElement("div");
    bubble.className = "message message-bot";
    bubble.innerHTML = messageHtml;
    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;
}



/* ---------- Greetings ---------- */
function getTimeGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning 🌞";
    if (h < 18) return "Good afternoon ☀️";
    return "Good evening 🌙";
}

function greetOnLoad() {
    setTimeout(() => {
        chatArea.innerHTML = "";
        const today = new Date();
        const isConstitutionDay = today.getMonth() === 10 && today.getDate() === 26;
        if (isConstitutionDay) {
            const msg = `👋 Hello !<strong>Happy Constitution Day!</strong> `;
            typeBotMessage(msg);
            document.body.style.background =
                "linear-gradient(135deg, #FF9933, #FFFFFF, #138808)";
        } else {
            if (userName) {
                typeBotMessage(
                    `${getTimeGreeting()}, ${userName}! 👋 Ask me anything about the Constitution.`
                );
            } else {
                typeBotMessage(
                    `${getTimeGreeting()}! 👋 I’m <strong>VIDHA</strong>, your Constitutional guide.`
                );
            }
        }
    }, 900);
}

/* ---------- Data loading (ONLY articles + quiz now) ---------- */

async function loadArticles() {
    try {
        const r = await fetch("data_articles.json");
        articles = await r.json();
    } catch (e) {
        articles = [];
    }
}

async function preloadQuiz() {
    try {
        const r = await fetch("quiz.json");
        quizData = await r.json();
    } catch (e) {
        quizData = [];
    }
}

/* ---------- Send handlers ---------- */
sendBtn.addEventListener("click", onUserSend);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") onUserSend();
});

function onUserSend() {
    const txt = userInput.value.trim();
    if (!txt) return;
    addUserBubble(txt);
    userInput.value = "";
    processUserMessage(txt);
}

/* ---------- Word → Number helper ---------- */
function wordToNumber(word) {
    const map = {
        first: 1,
        second: 2,
        third: 3,
        fourth: 4,
        fifth: 5,
        sixth: 6,
        seventh: 7,
        eighth: 8,
        ninth: 9,
        tenth: 10,
        eleventh: 11,
    };
    return map[String(word).toLowerCase()] || null;
}

/* ---------- VIDHA meaning (single-line) ---------- */
function vidhaMeaning() {
    return `💫 <strong>VIDHA</strong> stands for <strong>Values, Integrity, Democracy, Harmony & Awareness</strong> — from Sanskrit <em>"Vidhā"</em> meaning <strong>Knowledge, Law, Guidance</strong>.`;
}

/* ---------- Topic summaries (used by dropdown & direct queries) ---------- */
const topicSummaries = {
    "fundamental rights": {
        summary: `<strong>Fundamental Rights</strong> 🕊️<br>These are the essential freedoms guaranteed to every citizen of India.`,
        details: `<strong>Detailed Fundamental Rights (Articles 12–35)</strong><br>
      1️⃣ Right to Equality (Articles 14–18)<br>
      2️⃣ Right to Freedom (Articles 19–22)<br>
      3️⃣ Right against Exploitation (Articles 23–24)<br>
      4️⃣ Right to Freedom of Religion (Articles 25–28)<br>
      5️⃣ Cultural and Educational Rights (Articles 29–30)<br>
      6️⃣ Right to Constitutional Remedies (Article 32)`,
    },
    "fundamental duties": {
        summary: `<strong>Fundamental Duties</strong> 🇮🇳<br>These are moral obligations added by the 42nd Amendment (Article 51A).`,
        details: `<strong>List of Fundamental Duties</strong><br>
      1️⃣ Respect the Constitution, National Flag & Anthem.<br>
      2️⃣ Cherish the ideas of the freedom struggle.<br>
      3️⃣ Uphold the sovereignty, unity & integrity of India.<br>
      4️⃣ Defend the nation when called upon.<br>
      5️⃣ Promote harmony & brotherhood.<br>
      6️⃣ Preserve cultural heritage.<br>
      7️⃣ Protect the environment.<br>
      8️⃣ Develop scientific temper & reform.<br>
      9️⃣ Safeguard public property.<br>
      🔟 Strive toward excellence.<br>
      1️⃣1️⃣ Provide education to children aged 6–14.`,
    },

    "constitution day": {
        summary: `📅 <strong>Constitution Day (Samvidhan Divas)</strong><br>It is celebrated in India on November 26th to commemorate the adoption of the Constitution of India in 1949. The day aims to spread awareness about the importance of the Constitution and encourage citizens to uphold its values and fundamental duties. It was first celebrated as "Law Day" before being officially renamed "Constitution Day" in 2015. `,
    },
};

/* ---------- Populate dropdown (only desired topics, colorful) ---------- */
function populateTopicsDropdown() {
    const topics = {
        preamble: { icon: "🌅", label: "Preamble" },
        "fundamental rights": { icon: "⚖️", label: "Fundamental Rights" },
        "fundamental duties": { icon: "🇮🇳", label: "Fundamental Duties" },
        "constitution day": { icon: "📅", label: "Constitution Day" },
    };

    topicsSelect.innerHTML = `<option value="">📚 Select a Topic</option>`;
    Object.entries(topics).forEach(([key, v]) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = `${v.icon} ${v.label}`;
        topicsSelect.appendChild(opt);
    });
}

/* ---------- Dropdown handler ---------- */
topicsSelect.addEventListener("change", (e) => {
    const selected = e.target.value.trim().toLowerCase();
    if (!selected) return;

    if (selected === "preamble") {
        const preambleText = `
      <div class="preamble"
           style="background: linear-gradient(135deg, #ff9f43, #feca57, #ff6b6b);
                  color: #1a1a2e; padding: 0.5rem 0.5rem; border-radius: 15px;
                  font-size:0.8rem; line-height: 0.3;width:75%; box-shadow: 0 0 20px rgba(255,165,0,0.3);
                  animation: fadeInUpChat 1.2s ease-out;">
         <strong>The Preamble to the Constitution of India</strong>
        <em>"We, the People of India, having solemnly resolved to constitute India into a
        SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:<br><br>
        JUSTICE, social, economic and political;<br>
        LIBERTY of thought, expression, belief, faith and worship;<br>
        EQUALITY of status and of opportunity;<br>
        and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;<br><br>
        IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION."</em><br><br>🇮🇳
      </div>`;
        typeBotMessage(preambleText);
        e.target.value = "";
        return;
    }

    if (selected === "constitution day") {
        typeBotMessage(topicSummaries["constitution day"].summary);
        e.target.value = "";
        return;
    }

    const topic = topicSummaries[selected];
    if (topic) {
        typeBotMessage(topic.summary);
        if (topic.details) setTimeout(() => typeBotMessage(topic.details), 900);
    } else {
        addUserBubble(`Tell me about ${selected}.`);
        setTimeout(() => processUserMessage(selected), 400);
    }
    e.target.value = "";
});

/* ---------- Theme & Anthem ---------- */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    typeBotMessage(
        document.body.classList.contains("dark-mode") ?
        "🌙 Dark mode activated!" :
        "☀️ Light mode restored!"
    );
});

anthemToggle.addEventListener("click", () => {
    if (!anthemAudio) return;
    if (anthemAudio.paused) {
        anthemAudio.play().catch(() => {});
        anthemToggle.textContent = "⏸️";
        typeBotMessage("🎵 Playing the National Song softly in the background.");
    } else {
        anthemAudio.pause();
        anthemToggle.textContent = "🔊";
        typeBotMessage("🔇 Anthem paused.");
    }
});

/* ---------- Quiz (clickable options, smart randomization + replay) ---------- */
quizBtn.addEventListener("click", startQuiz);

let recentQuestions = []; // 🧠 Track recently used question indices

function startQuiz() {
    if (!quizData.length) {
        typeBotMessage("⚠️ Quiz data not loaded yet.");
        return;
    }

    quizActive = true;
    score = 0;
    quizIndex = 0;

    // 🎲 Pick 10 random questions, avoiding recently used ones if possible
    const totalQuestions = quizData.length;
    const availableIndices = quizData
        .map((_, i) => i)
        .filter((i) => !recentQuestions.includes(i));

    if (availableIndices.length < 10) {
        recentQuestions = recentQuestions.slice(-30);
    }

    const selectedIndices = [...quizData.keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    recentQuestions.push(...selectedIndices);
    window.currentQuizSet = selectedIndices.map((i) => quizData[i]);

    chatArea.innerHTML = "";
    typeBotMessage("🧠 Let's begin the Constitution Quiz! Click the correct option 👇");
    setTimeout(showNextQuestion, 800);
}

function showNextQuestion() {
    if (quizIndex >= window.currentQuizSet.length) {
        showFinalScore();
        quizActive = false;
        return;
    }

    const q = window.currentQuizSet[quizIndex];
    const qBox = document.createElement("div");
    qBox.className = "quiz-question";
    qBox.innerHTML = `
        <div class="question"><strong>Q${quizIndex + 1}.</strong> ${q.question}</div>
        <div class="options">
            ${q.options
              .map(
                (opt, i) =>
                  `<button class="quiz-option" data-index="${i}">
                    ${String.fromCharCode(65 + i)}) ${opt}
                </button>`
              )
              .join("")}
        </div>
    `;

  const bubble = document.createElement("div");
  bubble.className = "message message-bot";
  bubble.appendChild(qBox);
  chatArea.appendChild(bubble);
  chatArea.scrollTop = chatArea.scrollHeight;

  qBox.querySelectorAll(".quiz-option").forEach((btn) =>
    btn.addEventListener("click", () => handleOptionClick(btn, q))
  );
}

function handleOptionClick(selectedBtn, question) {
  const selectedIndex = parseInt(selectedBtn.getAttribute("data-index"));
  const correctIndex = question.correct;
  const allBtns = selectedBtn.parentElement.querySelectorAll(".quiz-option");
  allBtns.forEach((b) => (b.disabled = true));

  if (selectedIndex === correctIndex) {
    selectedBtn.classList.add("correct");
    score++;
  } else {
    selectedBtn.classList.add("wrong");
    allBtns[correctIndex].classList.add("correct");
  }

  const exp = document.createElement("div");
  exp.className = "quiz-explanation";
  exp.innerHTML = `<em>${question.explanation || ""}</em>`;
  selectedBtn.parentElement.appendChild(exp);

  quizIndex++;
  setTimeout(showNextQuestion, 1500);
}

function showFinalScore() {
  const percentage = Math.round((score / 10) * 100);
  let remark =
    percentage === 100
      ? "🏆 Outstanding!"
      : percentage >= 80
      ? "🎉 Excellent!"
      : percentage >= 60
      ? "👏 Good job!"
      : "🙂 Keep learning!";

  const finalBox = document.createElement("div");
  finalBox.className = "message message-bot";
  finalBox.innerHTML = `
        <div class="quiz-result">
            <strong>🏁 Quiz Over!</strong><br>
            <p>Score: <strong>${score}/10</strong> (${percentage}%)</p>
            <p>${remark}</p>
            <button id="playAgainBtn" class="play-again-btn">🔁 Play Again</button>
        </div>
    `;

  chatArea.appendChild(finalBox);
  chatArea.scrollTop = chatArea.scrollHeight;

  document
    .getElementById("playAgainBtn")
    .addEventListener("click", () => {
      chatArea.innerHTML = "";
      startQuiz();
    });
}

/* ---------- Cloudflare Worker AI (VIDHA backend) ---------- */
async function askGPT(question) {
    // 1. Create loading bubble
    const loadingBubble = document.createElement("div");
    loadingBubble.className = "message message-bot";
    loadingBubble.innerHTML = `
        <div class="typing">
            <span></span><span></span><span></span>
        </div>
    `;
    chatArea.appendChild(loadingBubble);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
        const url = `https://vidha-ai-worker.rrcollegeprojects.workers.dev?msg=${encodeURIComponent(question)}`;
        const response = await fetch(url);
        const data = await response.json();

        // Prevent undefined
        const answer =
            data.answer ||
            data.response ||
            (data.result && data.result.response) ||
            "I received an empty response.";

        // 2. Replace loader with answer
        loadingBubble.innerHTML = answer;

        return answer;

    } catch (err) {
        console.error(err);
        loadingBubble.innerHTML = "⚠️ Connection error. Please try again.";
        return "⚠️ Connection error. Please try again.";
    }
}



/* ---------- Main message processing ---------- */
function processUserMessage(raw) {
  if (!raw) return;
  if (quizActive) {
    handleQuizResponse(raw);
    return;
  }
  const msg = raw.trim().toLowerCase();

  // Set user name
  if (/^(my name is|i am|i'm)\s+/i.test(raw)) {
    const name = raw.replace(/^(my name is|i am|i'm)\s+/i, "").trim();
    if (name.length > 1) {
      userName = name.split(" ")[0];
      localStorage.setItem("vidha_user", userName);
      typeBotMessage(`Nice to meet you, <strong>${userName}</strong>! 🌸`);
      return;
    }
  }

  // Simple greetings and small talk
  if (/\b(hi|hello|hey|namaste)\b/i.test(raw)) {
    typeBotMessage(
      `Hello${userName ? ", " + userName : ""}! 👋 How may I assist you?`
    );
    return;
  }
  if (/\b(bye|goodbye|exit)\b/i.test(raw)) {
    typeBotMessage("Goodbye 👋 Stay proud of our Constitution 🇮🇳.");
    return;
  }
  if (/\b(thank|thanks|thankyou)\b/i.test(raw)) {
    typeBotMessage("You're most welcome! 🙏");
    return;
  } 
  if (/\b(who made you|who made u|who made vidha|who created you|who created u|who created vidha|who invented you|who invented u|who invented vidha|who developed you|who developed u|who developed vidha|creator of vidha|who built you|who built u|who built vidha|who designed you|who designed vidha|who is your creator|who is your developer|who is ur creator|who is ur developer)\b/i.test(raw)) {
    typeBotMessage("I was developed by <strong>Keerthishree</strong>");
    return;
}


  // VIDHA meaning (single-line)
  if (
    /\b(vidha|meaning|mean|stands for|full form|name meaning|what is your name)\b/i.test(
      msg
    )
  ) {
    typeBotMessage(vidhaMeaning());
    return;
  }

  // Article-specific quick lookup (from data_articles.json)
  const articleMatch = msg.match(/article\s*(number\s*)?(\d+[a-zA-Z]?)/i);
  if (articleMatch) {
    const articleNum = articleMatch[2];
    const found = articles.find((a) =>
      (a.keywords || [])
        .some((k) => k.toLowerCase().includes(`article ${articleNum}`))
    );
    if (found) {
      typeBotMessage(
        `<strong>Article ${articleNum.toUpperCase()}</strong><br>${found.answer}`
      );
      if (found.more)
        setTimeout(() => typeBotMessage(found.more), 800);
      return;
    }
  }

  // Detect fundamental right/duty (numeric or word)
  const frMatch = msg.match(
    /(?:fundamental\s*)?right\s*(number\s*)?(\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh)/i
  );
  const fdMatch = msg.match(
    /(?:fundamental\s*)?duty\s*(number\s*)?(\d+|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh)/i
  );

  if (frMatch) {
    const val = frMatch[2];
    const num = isNaN(val) ? wordToNumber(val) : parseInt(val);
    const rights = [
      "Right to Equality (Articles 14–18): Guarantees equality before law and equal protection of laws.",
      "Right to Freedom (Articles 19–22): Ensures freedom of speech, expression, and personal liberty.",
      "Right against Exploitation (Articles 23–24): Prohibits forced labour and child labour.",
      "Right to Freedom of Religion (Articles 25–28): Ensures freedom of conscience and religion.",
      "Cultural and Educational Rights (Articles 29–30): Protects the rights of minorities.",
      "Right to Constitutional Remedies (Article 32): Remedies via courts for rights violations.",
    ];
    if (num >= 1 && num <= rights.length) {
      typeBotMessage(
        `🕊️ <strong>${num}ᵗʰ Fundamental Right:</strong><br>${rights[num - 1]}`
      );
    } else {
      typeBotMessage(
        "There are only 6 Fundamental Rights in the Indian Constitution (Articles 12–35)."
      );
    }
    return;
  }

  if (fdMatch) {
    const val = fdMatch[2];
    const num = isNaN(val) ? wordToNumber(val) : parseInt(val);
    const duties = [
      "Respect the Constitution, National Flag, and National Anthem.",
      "Cherish the noble ideals of the freedom struggle.",
      "Uphold and protect the sovereignty, unity, and integrity of India.",
      "Defend the country and render national service when called upon.",
      "Promote harmony and the spirit of common brotherhood.",
      "Value and preserve the rich heritage of our composite culture.",
      "Protect and improve the natural environment including forests, lakes, rivers, and wildlife.",
      "Develop scientific temper, humanism, and the spirit of inquiry and reform.",
      "Safeguard public property and abjure violence.",
      "Strive towards excellence in all spheres of individual and collective activity.",
      "Provide opportunities for education to children between 6 and 14 years (added by 86th Amendment).",
    ];
    if (num >= 1 && num <= duties.length) {
      typeBotMessage(
        `🇮🇳 <strong>${num}ᵗʰ Fundamental Duty:</strong><br>${duties[num - 1]}`
      );
    } else {
      typeBotMessage(
        "There are 11 Fundamental Duties in the Indian Constitution (Article 51A)."
      );
    }
    return;
  }

  // If user asked a known topic (summary + details)
  for (const key of Object.keys(topicSummaries)) {
    if (msg.includes(key)) {
      typeBotMessage(topicSummaries[key].summary);
      if (topicSummaries[key].details)
        setTimeout(() => typeBotMessage(topicSummaries[key].details), 800);
      return;
    }
  }

  // ❌ data.json search removed – go directly to Cloudflare AI
  askGPT(raw);

/* ---------- Handle quiz typed answers (if still using typed A/B/C) ---------- */
function handleQuizResponse(raw) {
  const ans = raw.trim().toUpperCase();
  if (!["A", "B", "C", "D"].includes(ans)) {
    typeBotMessage("Please answer A, B, C, or D (or click an option).");
    return;
  }
  typeBotMessage(
    "Typed answers are not currently active — please click options in the quiz UI."
  );
}


/* ---------- End of file ---------- */}







