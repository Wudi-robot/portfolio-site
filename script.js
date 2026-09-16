(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const closeNav = () => {
    navLinks?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  navToggle?.addEventListener('click', () => {
    const opening = navToggle.getAttribute('aria-expanded') !== 'true';
    navToggle.setAttribute('aria-expanded', String(opening));
    navLinks?.classList.toggle('is-open', opening);
    document.body.classList.toggle('nav-open', opening);
  });
  navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (window.innerWidth > 800) closeNav(); });

  const revealItems = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach(item => observer.observe(item));
  }

  const heroVideo = document.querySelector('#hero-video');
  document.querySelector('[data-play-featured]')?.addEventListener('click', () => {
    window.setTimeout(() => heroVideo?.play().catch(() => {}), reducedMotion ? 0 : 450);
  });

  const loadVideo = video => {
    const source = video.dataset.src;
    if (!source) return;
    video.controls = true;
    video.preload = 'metadata';
    video.src = source;
    video.removeAttribute('data-src');
    video.load();
  };

  const playVideo = (video, requireInView = false) => {
    loadVideo(video);
    video.parentElement?.querySelector('.video-load')?.remove();
    const startPlayback = () => {
      if (!requireInView || video.dataset.inView === 'true') {
        video.play().catch(() => {});
      }
    };
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startPlayback();
    } else {
      video.addEventListener('loadedmetadata', startPlayback, { once: true });
    }
  };

  document.querySelectorAll('.video-load').forEach(button => {
    button.addEventListener('click', () => {
      const video = button.previousElementSibling;
      if (!video) return;
      playVideo(video);
    }, { once: true });
  });

  const inViewVideos = document.querySelectorAll('[data-autoplay-in-view]');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const video = entry.target;
        video.dataset.inView = String(entry.isIntersecting);
        if (entry.isIntersecting) {
          video.muted = true;
          playVideo(video, true);
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.15, rootMargin: '0px' });
    inViewVideos.forEach(video => videoObserver.observe(video));
  } else {
    inViewVideos.forEach(video => {
      video.dataset.inView = 'true';
      video.muted = true;
      playVideo(video, true);
    });
  }

  // Direct Code links also expand the corresponding project's details.
  const openLinkedDetails = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('details')) target.open = true;
  };
  window.addEventListener('hashchange', openLinkedDetails);
  openLinkedDetails();

  // Keep the selected demo audible/visible without competing playback.
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => {
      video.parentElement?.querySelector('.video-load')?.remove();
      document.querySelectorAll('video').forEach(other => {
        if (other !== video) other.pause();
      });
    });
  });

  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('img');
  const lightboxCaption = lightbox?.querySelector('p');
  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage || !lightboxCaption) return;
      lightboxImage.src = button.dataset.lightbox;
      lightboxImage.alt = button.dataset.caption || '项目图片预览';
      lightboxCaption.textContent = button.dataset.caption || '';
      lightbox.showModal();
    });
  });
  lightbox?.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
  lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  document.querySelectorAll('a.is-placeholder').forEach(link => link.addEventListener('click', event => event.preventDefault()));
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
