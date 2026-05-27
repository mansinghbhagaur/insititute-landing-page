const header = document.getElementById("siteHeader");
const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll("main section[id], footer[id]");

const teamSlider = document.getElementById("teamSlider");
const teamPrev = document.getElementById("teamPrev");
const teamNext = document.getElementById("teamNext");
const teamDots = document.getElementById("teamDots");

const setHeaderState = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

const closeMenu = () => {
  navMenu.classList.remove("active");
  document.body.classList.remove("menu-open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
};

menuBtn.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("active");
  document.body.classList.toggle("menu-open", isOpen);
  menuBtn.setAttribute("aria-expanded", String(isOpen));
  menuBtn.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const activeSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  {
    rootMargin: "-45% 0px -45% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => activeSectionObserver.observe(section));

class TeamCarousel {
  constructor(track, previousButton, nextButton, dotsContainer) {
    this.track = track;
    this.previousButton = previousButton;
    this.nextButton = nextButton;
    this.dotsContainer = dotsContainer;
    this.cards = Array.from(track.children);
    this.index = 0;
    this.visibleCount = 1;
    this.maxIndex = 0;
    this.startX = 0;
    this.deltaX = 0;
    this.autoPlayTimer = null;

    this.setup();
  }

  setup() {
    this.previousButton.addEventListener("click", () => this.move(-1));
    this.nextButton.addEventListener("click", () => this.move(1));
    this.track.addEventListener("touchstart", (event) => this.onTouchStart(event), { passive: true });
    this.track.addEventListener("touchmove", (event) => this.onTouchMove(event), { passive: true });
    this.track.addEventListener("touchend", () => this.onTouchEnd());
    this.track.addEventListener("mouseenter", () => this.stopAutoPlay());
    this.track.addEventListener("mouseleave", () => this.startAutoPlay());
    window.addEventListener("resize", () => this.refresh());

    this.refresh();
    this.startAutoPlay();
  }

  refresh() {
    const firstCard = this.cards[0];

    if (!firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const trackWidth = this.track.parentElement.getBoundingClientRect().width;
    this.visibleCount = Math.max(1, Math.floor(trackWidth / cardWidth));
    this.maxIndex = Math.max(0, this.cards.length - this.visibleCount);
    this.index = Math.min(this.index, this.maxIndex);

    this.renderDots();
    this.update();
  }

  renderDots() {
    this.dotsContainer.innerHTML = "";

    for (let i = 0; i <= this.maxIndex; i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show team slide ${i + 1}`);
      dot.addEventListener("click", () => {
        this.index = i;
        this.update();
        this.restartAutoPlay();
      });
      this.dotsContainer.appendChild(dot);
    }
  }

  update() {
    const firstCard = this.cards[0];
    const cardGap = parseFloat(getComputedStyle(this.track).gap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width + cardGap;

    this.track.style.transform = `translateX(-${this.index * cardWidth}px)`;

    Array.from(this.dotsContainer.children).forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === this.index);
      dot.setAttribute("aria-current", dotIndex === this.index ? "true" : "false");
    });
  }

  move(direction) {
    const nextIndex = this.index + direction;
    this.index = nextIndex > this.maxIndex ? 0 : nextIndex < 0 ? this.maxIndex : nextIndex;
    this.update();
    this.restartAutoPlay();
  }

  onTouchStart(event) {
    this.startX = event.touches[0].clientX;
    this.deltaX = 0;
    this.stopAutoPlay();
  }

  onTouchMove(event) {
    this.deltaX = event.touches[0].clientX - this.startX;
  }

  onTouchEnd() {
    if (Math.abs(this.deltaX) > 45) {
      this.move(this.deltaX < 0 ? 1 : -1);
    }

    this.startAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = window.setInterval(() => this.move(1), 5200);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      window.clearInterval(this.autoPlayTimer);
    }
  }

  restartAutoPlay() {
    this.startAutoPlay();
  }
}

if (teamSlider && teamPrev && teamNext && teamDots) {
  new TeamCarousel(teamSlider, teamPrev, teamNext, teamDots);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });
