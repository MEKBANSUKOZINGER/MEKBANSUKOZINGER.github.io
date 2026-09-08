const year = document.querySelector("#year");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#primary-navigation");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = document.querySelectorAll(".reveal");
const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

year.textContent = new Date().getFullYear();

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("is-active", isCurrent);
      });
    });
  },
  {
    rootMargin: "-35% 0px -55% 0px",
    threshold: 0,
  }
);

document
  .querySelectorAll("main section[id]")
  .forEach((section) => sectionObserver.observe(section));

let stars = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const starCount = Math.floor((width * height) / 7200);
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.25,
    speed: Math.random() * 0.22 + 0.05,
    alpha: Math.random() * 0.55 + 0.28,
  }));
}

function drawStarfield() {
  ctx.clearRect(0, 0, width, height);

  stars.forEach((star) => {
    star.y += star.speed;

    if (star.y > height + 4) {
      star.y = -4;
      star.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(238, 248, 255, ${star.alpha})`;
    ctx.fill();
  });

  if (!motionQuery.matches) {
    animationFrame = requestAnimationFrame(drawStarfield);
  }
}

function startStarfield() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawStarfield();
}

window.addEventListener("resize", startStarfield);
motionQuery.addEventListener("change", startStarfield);
startStarfield();
