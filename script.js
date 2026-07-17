// スクロールでメニュー表示
window.addEventListener("scroll", () => {
  const menu = document.getElementById("menu");
  if (window.scrollY > 200) {
    menu.classList.remove("hidden");
  } else {
    menu.classList.add("hidden");
  }
});

// パスワード
function checkPassword() {
  const pass = document.getElementById("password").value;
  if (pass === "1234") {
    document.getElementById("secretContent").classList.remove("hidden");
  } else {
    alert("違います");
  }
}

// fade-in / scroll shots
const fadeItems = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
}, {
  threshold: 0.28
});

fadeItems.forEach((item) => {
  observer.observe(item);
});

// Feature carousels for WORKS / BLOG
document.querySelectorAll("[data-stage-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".stage-track");
  const originalCards = Array.from(carousel.querySelectorAll(".stage-card"));
  const prev = carousel.querySelector(".stage-prev");
  const next = carousel.querySelector(".stage-next");
  const count = carousel.querySelector(".stage-count");
  const progress = carousel.querySelector(".stage-progress span");
  const windowEl = carousel.querySelector(".stage-window");
  const repeatSets = 9;
  const middleSet = Math.floor(repeatSets / 2);
  let index = 0;
  let position = 0;
  let cards = [];

  if (track && originalCards.length > 0) {
    track.innerHTML = "";

    for (let set = 0; set < repeatSets; set += 1) {
      originalCards.forEach((card, cardIndex) => {
        const clone = card.cloneNode(true);
        clone.dataset.originalIndex = String(cardIndex);
        clone.dataset.set = String(set);
        track.appendChild(clone);
      });
    }

    cards = Array.from(track.querySelectorAll(".stage-card"));
    position = middleSet * originalCards.length;
  }

  function updateStageCarousel(animate = true) {
    if (!track || cards.length === 0 || !windowEl) return;

    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].offsetWidth;
    const windowWidth = windowEl.clientWidth;
    const offset = (windowWidth / 2) - (cardWidth / 2) - (position * (cardWidth + gap));

    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${offset}px)`;

    cards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === position);
    });

    if (count) {
      count.textContent = `${String(index + 1).padStart(2, "0")}/${String(originalCards.length).padStart(2, "0")}`;
    }

    if (progress) {
      progress.style.width = `${((index + 1) / originalCards.length) * 100}%`;
    }
  }

  function recenterIfNeeded() {
    const lowerLimit = originalCards.length * 2;
    const upperLimit = originalCards.length * (repeatSets - 2);

    if (position <= lowerLimit || position >= upperLimit) {
      window.setTimeout(() => {
        position = (middleSet * originalCards.length) + index;
        updateStageCarousel(false);
      }, 470);
    }
  }

  function moveStage(direction) {
    index = (index + direction + originalCards.length) % originalCards.length;
    position += direction;
    updateStageCarousel(true);
    recenterIfNeeded();
  }

  if (!track || !prev || !next || originalCards.length === 0) return;

  prev.addEventListener("click", () => {
    moveStage(-1);
  });

  next.addEventListener("click", () => {
    moveStage(1);
  });

  let touchStartX = 0;
  let touchStartY = 0;

  windowEl.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  windowEl.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) < 42 || Math.abs(diffX) < Math.abs(diffY) * 1.2) return;
    moveStage(diffX < 0 ? 1 : -1);
  }, { passive: true });

  track.addEventListener("click", (event) => {
    const card = event.target.closest(".stage-card");
    if (!card || card.classList.contains("is-active")) return;

    event.preventDefault();
    const clickedPosition = cards.indexOf(card);
    if (clickedPosition < position) {
      moveStage(-1);
    } else {
      moveStage(1);
    }
  });

  window.addEventListener("resize", () => updateStageCarousel(false));
  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => updateStageCarousel(false), 180);
  });
  window.addEventListener("load", () => {
    updateStageCarousel(false);
    window.setTimeout(() => updateStageCarousel(false), 120);
    window.setTimeout(() => updateStageCarousel(false), 520);
  });
  updateStageCarousel(false);
});

// Section carousels
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const cards = carousel.querySelectorAll(".carousel-card");
  const prev = carousel.querySelector(".carousel-prev");
  const next = carousel.querySelector(".carousel-next");
  let index = 0;

  function updateCarousel() {
    if (!track) return;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  if (!track || !prev || !next || cards.length <= 1) {
    if (prev) prev.hidden = true;
    if (next) next.hidden = true;
    return;
  }

  prev.addEventListener("click", () => {
    index = (index - 1 + cards.length) % cards.length;
    updateCarousel();
  });

  next.addEventListener("click", () => {
    index = (index + 1) % cards.length;
    updateCarousel();
  });
});

// Long headline fitting
function fitHeadline(el) {
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const maxLines = el.classList.contains("hero-quote") ? (isMobile ? 2 : 1) : 3;
  const minSize = el.classList.contains("hero-quote") ? (isMobile ? 26 : 32) : 30;
  el.style.fontSize = "";

  const styles = window.getComputedStyle(el);
  let size = parseFloat(styles.fontSize);
  const lineHeight = parseFloat(styles.lineHeight) || size * 1.1;
  const maxHeight = lineHeight * maxLines + 2;

  while (
    size > minSize &&
    (el.scrollWidth > el.clientWidth || el.scrollHeight > maxHeight)
  ) {
    size -= 2;
    el.style.fontSize = `${size}px`;
  }
}

function fitHeadlines() {
  document
    .querySelectorAll(".hero-quote, .news-body h3")
    .forEach(fitHeadline);
}

function syncProfilePhotoHeight() {
  const card = document.querySelector(".profile-card");
  const image = document.querySelector(".profile-image");
  const body = document.querySelector(".profile-body");

  if (!card || !image || !body) return;

  if (window.innerWidth <= 768) {
    image.style.height = "";
    return;
  }

  const targetHeight = Math.max(body.scrollHeight + 24, 620);
  image.style.height = `${targetHeight}px`;
}

window.addEventListener("resize", fitHeadlines);
window.addEventListener("resize", syncProfilePhotoHeight);
window.addEventListener("load", fitHeadlines);
window.addEventListener("load", syncProfilePhotoHeight);

// 名言ランダム表示
const quotes = [
  {
    desktop: "生年月日ってなんですか？",
    mobile: "生年月日って<br>なんですか？"
  },
  {
    desktop: "言葉にできないから演じる。",
    mobile: "言葉にできないから<br>演じる。"
  }
];

const heroQuote = document.getElementById("heroQuote");
const quoteIndex = Math.floor(Math.random() * quotes.length);

function renderHeroQuote() {
  if (!heroQuote) return;
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  heroQuote.innerHTML = isMobile ? quotes[quoteIndex].mobile : quotes[quoteIndex].desktop;
  fitHeadline(heroQuote);
}

renderHeroQuote();
window.addEventListener("resize", renderHeroQuote);

// オープニング演出
document.body.classList.add("opening-active");

window.addEventListener("load", () => {
  const opening = document.getElementById("opening");

  setTimeout(() => {
    if (opening) {
      opening.classList.add("hide");
    }
    document.body.classList.remove("opening-active");
    document.body.classList.add("opening-done");
  }, 5000);
});
