const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('.project');
const progressBar = document.querySelector('.scroll-progress span');
const navLinks = document.querySelectorAll('[data-nav-link]');
const projectMenu = document.querySelector('.project-menu');

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

document.querySelectorAll('.brand-guideline-slides').forEach((gallery) => {
  let startX = 0;
  let startScroll = 0;
  let dragging = false;

  gallery.addEventListener('wheel', (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      gallery.scrollLeft += event.deltaY;
    }
  }, { passive: false });

  gallery.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    startScroll = gallery.scrollLeft;
    gallery.setPointerCapture(event.pointerId);
  });

  gallery.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    gallery.scrollLeft = startScroll - (event.clientX - startX);
  });

  ['pointerup', 'pointercancel'].forEach((eventName) => {
    gallery.addEventListener(eventName, () => { dragging = false; });
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
