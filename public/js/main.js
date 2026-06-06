(function () {
  var header = document.querySelector('.site-header');
  var body = document.body;
  var tocToggle = document.querySelector('.nav-toc-toggle');
  var bookToc = document.querySelector('.book-toc');
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setTocMenuOpen(isOpen) {
    if (!bookToc || !tocToggle) return;
    bookToc.classList.toggle('is-open', isOpen);
    tocToggle.setAttribute('aria-expanded', String(isOpen));
    tocToggle.setAttribute('aria-label', isOpen ? 'Close table of contents' : 'Open table of contents');
    body.classList.toggle('is-toc-open', isOpen);
  }

  if (tocToggle && bookToc) {
    tocToggle.addEventListener('click', function () {
      setTocMenuOpen(!bookToc.classList.contains('is-open'));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setTocMenuOpen(false);
    });
  }

  var chapters = Array.prototype.slice.call(
    document.querySelectorAll('main .book-chapter, main .book-cover')
  );
  var sections = document.querySelectorAll('section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  var tocAnchors = document.querySelectorAll('.book-toc__list a[href^="#"]');
  var tocProgressBar = document.querySelector('.book-toc__progress-bar');
  var tocPageCurrent = document.querySelector('.book-toc__page-current');
  var tocPageTotal = document.querySelector('.book-toc__page-total');

  var chapterIndex = {};
  chapters.forEach(function (chapter, index) {
    if (chapter.id) chapterIndex[chapter.id] = index + 1;
  });

  if (tocPageTotal) {
    tocPageTotal.textContent = String(chapters.length);
  }

  if (tocAnchors.length) {
    tocAnchors.forEach(function (anchor) {
      anchor.addEventListener('click', function () {
        setTocMenuOpen(false);
      });
    });
  }

  function setActiveChapter(id) {
    navAnchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      anchor.classList.toggle('is-active', href === '#' + id);
    });
    tocAnchors.forEach(function (anchor) {
      var href = anchor.getAttribute('href');
      anchor.classList.toggle('is-active', href === '#' + id);
    });
    if (tocPageCurrent && chapterIndex[id]) {
      tocPageCurrent.textContent = String(chapterIndex[id]);
    }
  }

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
    if (window.history && window.history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setActiveChapter('hero');
    setTocMenuOpen(false);
    if (typeof updateStoryState === 'function') {
      updateStoryState();
    }
  }

  document.querySelectorAll('.footer-top, .nav-logo[href="#top"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      scrollToTop();
    });
  });

  if (sections.length && (navAnchors.length || tocAnchors.length)) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveChapter(entry.target.id);
        }
      });
    }, { rootMargin: '-42% 0px -48% 0px' });

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (chapters.length && 'IntersectionObserver' in window) {
    var chapterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-reading');
        }
      });
    }, {
      threshold: window.matchMedia('(max-width: 960px)').matches ? 0.05 : 0.12,
      rootMargin: window.matchMedia('(max-width: 960px)').matches ? '0px' : '-8% 0px -12% 0px'
    });

    chapters.forEach(function (chapter) {
      chapterObserver.observe(chapter);
      if (prefersReducedMotion) chapter.classList.add('is-reading');
    });
  } else {
    chapters.forEach(function (chapter) {
      chapter.classList.add('is-reading');
    });
  }

  document.querySelectorAll('.case-study__toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var detailsId = btn.getAttribute('aria-controls');
      var details = document.getElementById(detailsId);
      if (!details) return;

      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var nextExpanded = !isExpanded;

      btn.setAttribute('aria-expanded', String(nextExpanded));
      details.hidden = !nextExpanded;

      var textEl = btn.querySelector('.case-study__toggle-text');
      if (textEl) {
        textEl.textContent = nextExpanded ? 'Hide case study' : 'Read case study';
      }
    });
  });

  /* Scroll storytelling */
  var heroSection = document.getElementById('hero');
  var explorePrompt = document.querySelector('.explore-prompt');
  var scrollProgressBar = document.querySelector('.scroll-progress__bar');
  var heroSpotlight = document.querySelector('.hero-spotlight');
  var ticking = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getHeroProgress() {
    if (!heroSection) return 1;

    var rect = heroSection.getBoundingClientRect();
    var scrollable = heroSection.offsetHeight - window.innerHeight;

    if (scrollable <= 0) return 1;

    var scrolled = -rect.top;
    return clamp(scrolled / scrollable, 0, 1);
  }

  function updateStoryState() {
    ticking = false;

    var heroProgress = prefersReducedMotion ? 1 : getHeroProgress();
    document.documentElement.style.setProperty('--hero-progress', String(heroProgress));

    if (heroProgress > 0.08) {
      body.classList.add('is-story-active');
    } else {
      body.classList.remove('is-story-active');
      setActiveChapter('hero');
    }

    body.classList.toggle('is-nav-ready', heroProgress > 0.32);

    if (header) {
      var pastHero = heroSection
        ? heroSection.getBoundingClientRect().bottom < window.innerHeight * 0.35
        : window.scrollY > 80;

      header.classList.toggle('is-scrolled', window.scrollY > 20);
      document.documentElement.style.setProperty('--header-solid', pastHero ? '1' : '0');
    }

    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? clamp(window.scrollY / docHeight, 0, 1) : 0;

    if (scrollProgressBar) {
      scrollProgressBar.style.width = (progress * 100) + '%';
    }
    if (tocProgressBar) {
      tocProgressBar.style.width = (progress * 100) + '%';
    }
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateStoryState);
    }
  }

  if (!prefersReducedMotion && heroSection) {
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    updateStoryState();

    if (explorePrompt) {
      explorePrompt.addEventListener('click', function () {
        var about = document.getElementById('about');
        if (about) {
          about.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        var scrollable = heroSection.offsetHeight - window.innerHeight;
        var target = heroSection.offsetTop + scrollable;
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    }
  } else {
    document.documentElement.style.setProperty('--hero-progress', '1');
    document.documentElement.style.setProperty('--header-solid', '1');
    body.classList.add('is-story-active', 'is-nav-ready');
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });

    if (header) {
      window.addEventListener('scroll', function () {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
      }, { passive: true });
    }

    function updateScrollProgress() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? clamp(window.scrollY / docHeight, 0, 1) : 0;
      if (scrollProgressBar) scrollProgressBar.style.width = (progress * 100) + '%';
      if (tocProgressBar) tocProgressBar.style.width = (progress * 100) + '%';
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();
  }

  /* Hero spotlight */
  if (heroSpotlight && heroSection && !prefersReducedMotion) {
    heroSection.addEventListener('mousemove', function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSpotlight.style.setProperty('--spot-x', x + '%');
      heroSpotlight.style.setProperty('--spot-y', y + '%');
    }, { passive: true });
  }
})();
