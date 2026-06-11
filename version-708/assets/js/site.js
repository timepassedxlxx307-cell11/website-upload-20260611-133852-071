(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        if (!query) {
          event.preventDefault();
          window.location.href = 'search.html';
          return;
        }
        event.preventDefault();
        window.location.href = 'search.html?q=' + encodeURIComponent(query);
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  }

  function setupBackTop() {
    var button = qs('[data-back-top]');
    if (!button) {
      return;
    }
    function update() {
      button.classList.toggle('show', window.scrollY > 360);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function getUrlQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var cards = qsa('[data-movie-card]');
    if (!panel || !cards.length) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', panel);
    var year = qs('[data-filter-year]', panel);
    var type = qs('[data-filter-type]', panel);
    var region = qs('[data-filter-region]', panel);
    var empty = qs('[data-search-empty]');
    var urlQuery = getUrlQuery();
    if (keyword && urlQuery) {
      keyword.value = urlQuery;
    }

    function match(card) {
      var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.category].map(normalText).join(' ');
      var keywordValue = keyword ? normalText(keyword.value) : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      var regionValue = region ? normalText(region.value) : '';
      var keywordOk = !keywordValue || text.indexOf(keywordValue) !== -1;
      var yearOk = !yearValue || String(card.dataset.year) === yearValue;
      var typeOk = !typeValue || String(card.dataset.type) === typeValue;
      var regionOk = !regionValue || normalText(card.dataset.region).indexOf(regionValue) !== -1;
      return keywordOk && yearOk && typeOk && regionOk;
    }

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          shown += 1;
        }
      });
      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    qsa('input, select', panel).forEach(function (control) {
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupBackTop();
    setupFilters();
  });
}());
