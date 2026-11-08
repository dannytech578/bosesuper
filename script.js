const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const main = document.querySelector("main");
const sectionPanels = [...main.querySelectorAll(":scope > section:not(#home)")];

function showSectionFromHash(hash) {
  const targetId = hash.slice(1);
  const target = targetId ? document.getElementById(targetId) : null;
  const activeSection = target?.parentElement === main && target.id !== "home" ? target : null;

  sectionPanels.forEach((section) => {
    section.hidden = section !== activeSection;
  });
}

showSectionFromHash(window.location.hash);
window.addEventListener("hashchange", () => showSectionFromHash(window.location.hash));
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (link) showSectionFromHash(link.getAttribute("href"));
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  }
});

const videoDialog = document.querySelector(".video-dialog");
const demoVideo = videoDialog.querySelector("video");
const dialogTitle = videoDialog.querySelector(".dialog-title");

document.querySelectorAll(".video-card").forEach((card) => {
  card.addEventListener("click", () => {
    dialogTitle.textContent = card.dataset.videoTitle;
    videoDialog.showModal();
    demoVideo.play().catch(() => {
      // Playback remains available through the visible video controls.
    });
  });
});

function closeVideoDialog() {
  demoVideo.pause();
  demoVideo.currentTime = 0;
  videoDialog.close();
}

videoDialog.querySelector(".dialog-close").addEventListener("click", closeVideoDialog);
videoDialog.addEventListener("click", (event) => {
  if (event.target === videoDialog) closeVideoDialog();
});
videoDialog.addEventListener("close", () => {
  demoVideo.pause();
  demoVideo.currentTime = 0;
});

const galleryItems = [...document.querySelectorAll(".gallery-card")];
const galleryLightbox = document.querySelector(".gallery-lightbox");
const galleryLightboxImage = galleryLightbox.querySelector(".gallery-lightbox-image");
const galleryLightboxCaption = galleryLightbox.querySelector(".gallery-lightbox-caption");
const galleryLightboxCount = galleryLightbox.querySelector(".gallery-lightbox-count");
let activeGalleryIndex = 0;

function showGalleryImage(index) {
  activeGalleryIndex = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[activeGalleryIndex];
  const image = item.querySelector("img");
  galleryLightboxImage.src = image.src;
  galleryLightboxImage.alt = image.alt;
  galleryLightboxCaption.textContent = item.querySelector(".gallery-caption").textContent;
  galleryLightboxCount.textContent = `Image ${activeGalleryIndex + 1} of ${galleryItems.length}`;
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    showGalleryImage(index);
    galleryLightbox.showModal();
  });
});

galleryLightbox.querySelector(".gallery-lightbox-close").addEventListener("click", () => {
  galleryLightbox.close();
});
galleryLightbox.querySelector(".gallery-lightbox-previous").addEventListener("click", () => {
  showGalleryImage(activeGalleryIndex - 1);
});
galleryLightbox.querySelector(".gallery-lightbox-next").addEventListener("click", () => {
  showGalleryImage(activeGalleryIndex + 1);
});
galleryLightbox.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) galleryLightbox.close();
});
galleryLightbox.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showGalleryImage(activeGalleryIndex - 1);
  if (event.key === "ArrowRight") showGalleryImage(activeGalleryIndex + 1);
  if (event.key === "Escape") {
    event.preventDefault();
    galleryLightbox.close();
  }
});

document.querySelector("#booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const subject = encodeURIComponent(`Evang. Bose Super enquiry from ${formData.get("name")}`);
  const body = encodeURIComponent(
    `Name: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`,
  );
  window.location.href = `mailto:hello@bosesuper.com?subject=${subject}&body=${body}`;
});

document.querySelector("#year").textContent = new Date().getFullYear();

const posterCarousel = document.querySelector(".poster-carousel");
const posterSlides = [...posterCarousel.querySelectorAll(".poster-slide")];
const posterDots = [...posterCarousel.querySelectorAll(".poster-dot")];
const posterStatus = posterCarousel.querySelector(".poster-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activePosterIndex = 0;
let posterTimer;

function showPoster(index) {
  activePosterIndex = (index + posterSlides.length) % posterSlides.length;
  posterSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activePosterIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.inert = !isActive;
  });
  posterDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === activePosterIndex;
    dot.classList.toggle("is-active", isActive);
    dot.setAttribute("aria-current", String(isActive));
  });
  posterStatus.textContent = `Flyer ${activePosterIndex + 1} of ${posterSlides.length}`;
}

function stopPosterRotation() {
  window.clearInterval(posterTimer);
  posterTimer = undefined;
}

function startPosterRotation() {
  stopPosterRotation();
  if (prefersReducedMotion.matches || document.hidden) return;
  posterTimer = window.setInterval(() => showPoster(activePosterIndex + 1), 5000);
}

posterCarousel.querySelector(".poster-previous").addEventListener("click", () => {
  showPoster(activePosterIndex - 1);
  startPosterRotation();
});
posterCarousel.querySelector(".poster-next").addEventListener("click", () => {
  showPoster(activePosterIndex + 1);
  startPosterRotation();
});
posterDots.forEach((dot, index) => {
  dot.addEventListener("click", () => {
    showPoster(index);
    startPosterRotation();
  });
});
posterCarousel.addEventListener("mouseenter", stopPosterRotation);
posterCarousel.addEventListener("mouseleave", startPosterRotation);
posterCarousel.addEventListener("focusin", stopPosterRotation);
posterCarousel.addEventListener("focusout", (event) => {
  if (!posterCarousel.contains(event.relatedTarget)) startPosterRotation();
});
document.addEventListener("visibilitychange", startPosterRotation);
prefersReducedMotion.addEventListener?.("change", startPosterRotation);
startPosterRotation();

const scrollProgress = document.querySelector(".scroll-progress");

function updateScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100)) : 0;
  scrollProgress.style.setProperty("--scroll-progress", `${progress}%`);
  scrollProgress.setAttribute("aria-valuenow", String(progress));
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const revealElements = document.querySelectorAll(
  ".section-kicker, .intro-content, .section-heading, .annual-concert, .video-card, .gallery-card, .music-copy, .music-art, .platform-list, .booking-copy, .booking-form",
);

if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 3) * 80}ms`);
    revealObserver.observe(element);
  });
}
