(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = one('.menu-toggle');
    var menu = one('.mobile-nav');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!opened));
      menu.hidden = opened;
    });
  }

  function initHero() {
    var slides = all('.hero-slide');
    if (slides.length < 2) {
      return;
    }
    var dots = all('[data-hero-dot]');
    var prev = one('[data-hero-prev]');
    var next = one('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    var hero = one('.hero-carousel');
    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }

    start();
  }

  function initSearch() {
    var inputs = all('.movie-search');
    var grids = all('.searchable-grid');
    var cards = all('.js-movie-card');
    if (!inputs.length || !cards.length) {
      return;
    }
    var activeFilter = '';
    var activeQuery = '';

    grids.forEach(function (grid) {
      if (!grid.nextElementSibling || !grid.nextElementSibling.classList.contains('empty-state')) {
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配的影片';
        grid.insertAdjacentElement('afterend', empty);
      }
    });

    function textOf(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-category')
      ].join(' '));
    }

    function apply() {
      var query = normalize(activeQuery);
      var filter = normalize(activeFilter);
      cards.forEach(function (card) {
        var text = textOf(card);
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = !filter || text.indexOf(filter) !== -1;
        card.hidden = !(matchedQuery && matchedFilter);
      });
      grids.forEach(function (grid) {
        var visible = all('.js-movie-card', grid).some(function (card) {
          return !card.hidden;
        });
        var empty = grid.nextElementSibling;
        if (empty && empty.classList.contains('empty-state')) {
          empty.classList.toggle('show', !visible);
        }
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        activeQuery = input.value;
        inputs.forEach(function (other) {
          if (other !== input) {
            other.value = input.value;
          }
        });
        apply();
      });
    });

    all('.filter-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        all('.filter-chip').forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || '';
        apply();
      });
    });
  }

  window.bindMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var button = document.getElementById('movie-play');
    if (!video || !button || !source) {
      return;
    }
    var ready = false;
    var hls = null;

    function load() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }

    function play() {
      load();
      button.classList.add('is-hidden');
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
