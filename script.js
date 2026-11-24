const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".primary-navigation");
const main = document.querySelector("main");
const homeSection = document.getElementById("home");
const sectionPanels = [...main.querySelectorAll(":scope > section")];

function showSectionFromHash(hash) {
  const targetId = (hash || "").replace(/^#/, "").trim();
  const requestedSection = targetId ? document.getElementById(targetId) : homeSection;
  const activeSection = requestedSection && requestedSection.parentElement === main ? requestedSection : homeSection;

  sectionPanels.forEach((section) => {
    const isActive = section === activeSection;
    section.hidden = !isActive;
    section.setAttribute("aria-hidden", String(!isActive));
  });
}

showSectionFromHash(window.location.hash);
window.addEventListener("hashchange", () => showSectionFromHash(window.location.hash));
document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (link) showSectionFromHash(link.getAttribute("href"));
});

function closeNavigation() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navigation.classList.remove("is-open");
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    closeNavigation();
    return;
  }
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation");
  navigation.classList.add("is-open");
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    closeNavigation();
    menuToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (
    menuToggle.getAttribute("aria-expanded") === "true" &&
    !navigation.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeNavigation();
  }
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 681px)").matches) closeNavigation();
});

const videoCards = [...document.querySelectorAll(".video-card")];

function loadVideoPreview(card) {
  const preview = card.querySelector(".video-card-preview");
  if (!preview || preview.hasAttribute("src")) return;

  preview.addEventListener("loadeddata", () => {
    preview.classList.add("is-ready");
  }, { once: true });
  preview.addEventListener("loadedmetadata", () => {
    if (Number.isFinite(preview.duration) && preview.duration > 1) {
      preview.currentTime = Math.min(1, preview.duration / 4);
    }
  }, { once: true });
  preview.src = card.dataset.videoSrc;
  preview.load();
}

if ("IntersectionObserver" in window) {
  const videoPreviewObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadVideoPreview(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "160px" });
  videoCards.forEach((card) => videoPreviewObserver.observe(card));
} else {
  videoCards.forEach(loadVideoPreview);
}

const videoDialog = document.querySelector(".video-dialog");
const demoVideo = videoDialog.querySelector("video");
const dialogTitle = videoDialog.querySelector(".dialog-title");
const dialogNote = videoDialog.querySelector(".dialog-note");

videoCards.forEach((card) => {
  card.addEventListener("click", () => {
    dialogTitle.textContent = card.dataset.videoTitle;
    dialogNote.textContent = "";
    demoVideo.defaultMuted = false;
    demoVideo.muted = false;
    demoVideo.volume = 1;
    demoVideo.src = card.dataset.videoSrc;
    demoVideo.load();
    videoDialog.showModal();
    demoVideo.play().catch((error) => {
      dialogNote.textContent = "The video could not start automatically. Use the player controls to try again.";
      console.warn(`Could not autoplay ${card.dataset.videoTitle}.`, error);
    });
  });
});

function closeVideoDialog() {
  demoVideo.pause();
  demoVideo.removeAttribute("src");
  demoVideo.load();
  videoDialog.close();
}

demoVideo.addEventListener("error", () => {
  const mediaError = demoVideo.error;
  if (!mediaError) return;
  dialogNote.textContent = "This video could not be loaded. Please check that the video file is available.";
  console.error("Could not load selected video.", mediaError);
});

videoDialog.querySelector(".dialog-close").addEventListener("click", closeVideoDialog);
videoDialog.addEventListener("click", (event) => {
  if (event.target === videoDialog) closeVideoDialog();
});
videoDialog.addEventListener("close", () => {
  demoVideo.pause();
  demoVideo.removeAttribute("src");
  demoVideo.load();
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
  const caption = item.querySelector(".gallery-caption");
  galleryLightboxImage.src = image.dataset.full || image.src;
  galleryLightboxImage.alt = image.alt;
  galleryLightboxCaption.textContent = caption?.textContent || "";
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
  const message = encodeURIComponent(
    `Website enquiry for Evang. Bose Super\nName: ${formData.get("name")}\nEmail: ${formData.get("email")}\n\n${formData.get("message")}`,
  );
  window.location.href = `https://wa.me/2348088048537?text=${message}`;
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
  ".section-kicker, .intro-content, .foundation-heading, .foundation-grid, .foundation-copy, .section-heading, .annual-concert, .video-card, .gallery-card, .music-copy, .music-art, .platform-list, .booking-copy, .booking-form",
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
