document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".grid-matches");
  const dateInput = document.getElementById("match-date");
  const prevBtn = document.getElementById("prev-day");
  const nextBtn = document.getElementById("next-day");
  const dayTitle = document.getElementById("day-title");

  let matchesData = [];
  let newsData = [];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const minDate = new Date(today);
  minDate.setDate(today.getDate() - 3);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 3);

  const minStr = minDate.toISOString().split("T")[0];
  const maxStr = maxDate.toISOString().split("T")[0];

  dateInput.min = minStr;
  dateInput.max = maxStr;
  dateInput.value = todayStr;

  // ======== تحميل المباريات ========
  fetch("data.json")
    .then(res => res.json())
    .then(data => { matchesData = data; showMatchesForDate(todayStr); updateButtons(); })
    .catch(err => console.error("خطأ في تحميل data.json:", err));

  // ======== تحميل الأخبار ========
  fetch("news.json")
    .then(res => res.json())
    .then(data => { newsData = data; showNews(); })
    .catch(err => console.error("خطأ في تحميل news.json:", err));

  // ======== تحريك التاريخ ========
  dateInput.addEventListener("change", () => { showMatchesForDate(dateInput.value); updateButtons(); });
  prevBtn.addEventListener("click", () => changeDay(-1));
  nextBtn.addEventListener("click", () => changeDay(1));

  function changeDay(step) {
    const current = new Date(dateInput.value);
    current.setDate(current.getDate() + step);
    const newDate = current.toISOString().split("T")[0];
    dateInput.value = newDate;
    showMatchesForDate(newDate);
    updateButtons();
  }

  function updateButtons() {
    prevBtn.disabled = dateInput.value <= minStr;
    nextBtn.disabled = dateInput.value >= maxStr;
  }

  function showMatchesForDate(dateStr) {
    grid.innerHTML = "";
    const selectedDate = new Date(dateStr);
    dayTitle.textContent = getArabicDay(selectedDate);

    const sameDayMatches = matchesData.filter(m => new Date(m.time).toDateString() === selectedDate.toDateString());

    if (sameDayMatches.length === 0) {
      grid.innerHTML = `<div class="no-matches">لا توجد مباريات في هذا اليوم</div>`;
      return;
    }

    sameDayMatches.forEach(match => {
      const matchTime = new Date(match.time);
      const status = getStatus(matchTime, match.scoreA, match.scoreB);

      const card = document.createElement("div");
      card.classList.add("match-card");
      card.innerHTML = `
       <div class="league">
        <img class="league-logo" src="${match.leagueLogo}" alt="${match.leagueName}">
        <span class="league-name">${match.leagueName}</span>
       </div>
        <div class="teams">
          <div class="team">
            <img src="${match.logoA}" alt="${match.teamA}">
            <span>${match.teamA}</span>
          </div>
          <div class="score-time">
            <div class="label">النتيجة</div>
            <div class="status">${status}</div>
            <div class="time">${matchTime.toLocaleTimeString('ar-MA',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
          <div class="team">
            <img src="${match.logoB}" alt="${match.teamB}">
            <span>${match.teamB}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function getArabicDay(date) {
    const days = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
    const months = ["يناير","فبراير","مارس","أبريل","ماي","يونيو","يوليوز","غشت","شتنبر","أكتوبر","نونبر","دجنبر"];
    return `مباريات يوم ${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }

  function getStatus(time, scoreA, scoreB) {
    const now = new Date();
    if(scoreA!==null && scoreB!==null) return `${scoreA} - ${scoreB}`;
    if(now < time) return "لم تبدأ بعد";
    const end = new Date(time.getTime() + 1000*60*110);
    if(now>=time && now<=end) return "مباشر الآن";
    return "انتهت (بدون نتيجة)";
  }

  // ======== الوضع الليلي ========
  const toggle = document.getElementById("dark-mode-toggle");
  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggle.innerHTML = document.body.classList.contains("dark") ? '<i class="fa fa-sun"></i>' : '<i class="fa fa-moon"></i>';
  });

  // ======== قائمة الهاتف ========
  const menuIcon = document.getElementById("menu-icon");
  const navLinks = document.getElementById("nav-links");
  menuIcon.addEventListener("click", () => { navLinks.classList.toggle("show"); });

  // ======== عرض الأخبار ========
  const newsSlider = document.querySelector(".news-slider");
  function showNews() {
    newsSlider.innerHTML = "";
    newsData.forEach(news => {
      const card = document.createElement("div");
      card.classList.add("news-card");
      card.innerHTML = `<img src="${news.image}" alt="${news.title}"><h4>${news.title}</h4>`;
      card.addEventListener("click", () => {
        document.getElementById("modal-image").src = news.image;
        document.getElementById("modal-title").textContent = news.title;
        document.getElementById("modal-description").textContent = news.description || "";
        document.getElementById("news-modal").style.display = "block";
      });
      newsSlider.appendChild(card);
    });
  }

  // إغلاق النافذة
  document.getElementById("modal-close").addEventListener("click", () => {
    document.getElementById("news-modal").style.display = "none";
  });
  window.addEventListener("click", (e) => {
    if(e.target.id==="news-modal") document.getElementById("news-modal").style.display="none";
  });

  // تحريك شريط الأخبار
  document.querySelector(".slider-btn.left").addEventListener("click",()=>{newsSlider.scrollBy({left:-220,behavior:'smooth'});});
  document.querySelector(".slider-btn.right").addEventListener("click",()=>{newsSlider.scrollBy({left:220,behavior:'smooth'});});
});
