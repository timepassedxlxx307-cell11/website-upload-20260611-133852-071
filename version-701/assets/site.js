(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupCardTools() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll("[data-card-tools]"));
    toolbars.forEach(function (bar) {
      var input = bar.querySelector("[data-card-filter]");
      var select = bar.querySelector("[data-card-sort]");
      var grid = bar.parentElement.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.children);
      function apply() {
        var query = textOf(input && input.value);
        cards.forEach(function (card) {
          var haystack = textOf(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year"));
          card.classList.toggle("card-hidden", query && haystack.indexOf(query) === -1);
        });
        var mode = select ? select.value : "year";
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === "title") {
            return textOf(a.getAttribute("data-title")).localeCompare(textOf(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          var key = mode === "rating" ? "data-rating" : mode === "heat" ? "data-heat" : "data-year";
          return Number(b.getAttribute(key) || 0) - Number(a.getAttribute(key) || 0);
        });
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  function setupPlayer() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video[data-play-url]");
      var startButton = player.querySelector("[data-player-start]");
      if (!video || !startButton) {
        return;
      }
      var playUrl = video.getAttribute("data-play-url");
      var started = false;
      var hlsInstance = null;
      function bindStream() {
        if (started) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
          hlsInstance = new Hls({
            maxBufferLength: 30
          });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playUrl;
        }
      }
      function begin() {
        bindStream();
        startButton.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            startButton.classList.remove("is-hidden");
          });
        }
      }
      startButton.addEventListener("click", begin);
      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        startButton.classList.add("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupSearch() {
    var results = document.querySelector("[data-search-results]");
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    if (!results || typeof CATALOG_MOVIES === "undefined") {
      return;
    }
    var params = new URLSearchParams(location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    function card(movie) {
      return "<article class=\"movie-card card-hover\" data-title=\"" + escapeHtml(movie.title) + "\" data-tags=\"" + escapeHtml(movie.searchText) + "\" data-year=\"" + movie.yearNum + "\" data-rating=\"" + movie.rating + "\" data-heat=\"" + movie.heat + "\">" +
        "<a class=\"poster-wrap\" href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"play-badge\">▶</span><span class=\"poster-tag\">" + escapeHtml(movie.category) + "</span></a>" +
        "<div class=\"card-body\"><div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
        "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3><p>" + escapeHtml(movie.line) + "</p><div class=\"card-stats\"><span>评分 " + movie.rating + "</span><span>热度 " + movie.heatScore + "</span></div></div></article>";
    }
    function render(query) {
      var q = textOf(query);
      var list = CATALOG_MOVIES.filter(function (movie) {
        return !q || textOf(movie.searchText).indexOf(q) !== -1;
      }).sort(function (a, b) {
        return b.heat - a.heat;
      }).slice(0, 96);
      results.innerHTML = list.map(card).join("");
    }
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = input ? input.value : "";
        var next = location.pathname + (value ? "?q=" + encodeURIComponent(value) : "");
        history.replaceState(null, "", next);
        render(value);
      });
    }
    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(initial);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardTools();
    setupPlayer();
    setupSearch();
  });
})();
