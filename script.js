const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.project');
const progressBar = document.querySelector('.scroll-progress span');
const navLinks = document.querySelectorAll('[data-nav-link]');
const projectMenu = document.querySelector('.project-menu');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const primaryNavigation = document.querySelector('.nav nav');
const brandMockup = document.querySelector('.brand-mockup-pair img');
const brandMockupWrap = brandMockup?.closest('.brand-mockup-pair');
const designProcessCta = document.querySelector('.design-process-cta');
const designProcessTeaser = document.querySelector('.design-process-teaser');

if (primaryNavigation) primaryNavigation.id = 'primary-navigation';

mobileMenuToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('mobile-menu-open');
  mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
  mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

primaryNavigation?.querySelectorAll('a, button').forEach((item) => {
  item.addEventListener('click', () => {
    document.body.classList.remove('mobile-menu-open');
    mobileMenuToggle?.setAttribute('aria-expanded', 'false');
    mobileMenuToggle?.setAttribute('aria-label', 'Open navigation menu');
  });
});

if (brandMockupWrap) {
  const designProcessLink = document.createElement('a');
  designProcessLink.className = 'design-process-link';
  designProcessLink.href = 'design-process.html';
  designProcessLink.innerHTML = '<span>View design process</span><b aria-hidden="true">↗</b>';
  brandMockupWrap.replaceWith(designProcessLink);
}

designProcessCta?.remove();
designProcessTeaser?.remove();

filters.forEach((button) => {
  button.addEventListener('click', () => {
    const scrollPosition = window.scrollY;
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle('active', item.dataset.filter === filter));
    projects.forEach((project) => {
      project.classList.toggle('hidden', filter !== 'all' && !project.dataset.category.includes(filter));
    });
    if (button.closest('.project-menu')) {
      const selectedProject = [...projects].find((project) => filter === 'all' || project.dataset.category.includes(filter));
      requestAnimationFrame(() => selectedProject?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } else {
      requestAnimationFrame(() => window.scrollTo(0, scrollPosition));
    }
  });
});

if (window.location.hash === '#brand-guidelines') {
  window.addEventListener('load', () => {
    document.querySelector('.project[data-category="brand"]')?.scrollIntoView({ block: 'start' });
  }, { once: true });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const navSection = entry.target.dataset.navSection || entry.target.id;
    navLinks.forEach((link) => link.classList.toggle('current', link.dataset.navLink === navSection));
    projectMenu?.classList.toggle('current', navSection === 'work');
  });
}, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

document.querySelectorAll('section[id]').forEach((section) => sectionObserver.observe(section));

document.querySelectorAll('.brand-guidelines-carousel').forEach((carousel) => {
  const stage = carousel.querySelector('.brand-guideline-stage');
  const slide = carousel.querySelector('.brand-guideline-slide');
  const previous = carousel.querySelector('.brand-guideline-previous');
  const following = carousel.querySelector('.brand-guideline-following');
  const image = slide.querySelector('img');
  const previousImage = previous.querySelector('img');
  const followingImage = following.querySelector('img');
  const count = carousel.querySelector('.brand-guideline-count');
  const images = [image, ...carousel.querySelector('.brand-guideline-images').content.querySelectorAll('img')];
  let current = 0;
  let isTransitioning = false;
  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let dragging = false;
  let horizontalDrag = false;
  let suppressClick = false;
  const desktopClick = window.matchMedia('(hover: hover) and (pointer: fine)');

  const showSlide = (index, direction) => {
    if (isTransitioning) return;
    isTransitioning = true;
    current = (index + images.length) % images.length;
    const nextImage = images[current];
    const leavingClass = direction === 'next' ? 'is-leaving-left' : 'is-leaving-right';
    const enteringClass = direction === 'next' ? 'is-entering-right' : 'is-entering-left';
    slide.classList.add(leavingClass);

    window.setTimeout(() => {
      image.src = nextImage.src;
      image.alt = nextImage.alt;
      previousImage.src = images[(current - 1 + images.length) % images.length].src;
      followingImage.src = images[(current + 1) % images.length].src;
      count.textContent = `${current + 1} / ${images.length}`;
      slide.classList.remove(leavingClass);
      slide.classList.add(enteringClass);
      image.addEventListener('animationend', () => {
        slide.classList.remove(enteringClass);
        isTransitioning = false;
      }, { once: true });
    }, 220);
  };

  slide.addEventListener('click', () => {
    if (desktopClick.matches) showSlide(current + 1, 'next');
  });

  previous.addEventListener('click', () => {
    if (desktopClick.matches) showSlide(current - 1, 'previous');
  });

  following.addEventListener('click', () => {
    if (desktopClick.matches) showSlide(current + 1, 'next');
  });

  stage.addEventListener('pointerdown', (event) => {
    if (isTransitioning || event.button > 0 || event.pointerType === 'mouse') return;
    startX = event.clientX;
    startY = event.clientY;
    pointerId = event.pointerId;
    dragging = true;
    horizontalDrag = false;
    stage.setPointerCapture(pointerId);
    stage.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!horizontalDrag && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 6) horizontalDrag = true;
    if (!horizontalDrag) return;

    const resistance = deltaX * .55;
    stage.style.transform = `translateX(${resistance}px)`;
  });

  const finishDrag = (event) => {
    if (!dragging || event.pointerId !== pointerId) return;
    const deltaX = event.clientX - startX;
    dragging = false;
    stage.classList.remove('is-dragging');
    stage.style.transform = '';
    if (stage.hasPointerCapture(pointerId)) stage.releasePointerCapture(pointerId);
    pointerId = null;

    if (!horizontalDrag || Math.abs(deltaX) < 55) return;
    suppressClick = true;
    showSlide(current + (deltaX < 0 ? 1 : -1), deltaX < 0 ? 'next' : 'previous');
  };

  stage.addEventListener('pointerup', finishDrag);
  stage.addEventListener('pointercancel', finishDrag);
  stage.addEventListener('click', (event) => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);

  slide.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') showSlide(current + 1, 'next');
    if (event.key === 'ArrowLeft') showSlide(current - 1, 'previous');
  });
});

const updateProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${scrollable ? window.scrollY / scrollable : 0})`;
};

window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const pageObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.classList.toggle('in-view', entry.isIntersecting);
  });
}, { threshold: 0.2, rootMargin: '-8% 0px -8% 0px' });

document.querySelectorAll('.page-section').forEach((section) => pageObserver.observe(section));
