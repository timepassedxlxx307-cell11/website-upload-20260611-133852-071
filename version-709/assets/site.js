(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCatalog() {
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    function filter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        card.hidden = query.length > 0 && haystack.indexOf(query) === -1;
      });
    }

    function sortCards() {
      var mode = select ? select.value : "year-desc";
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }
        if (mode === "title-asc") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    if (select) {
      select.addEventListener("change", sortCards);
    }
    sortCards();
  }

  function setupImages() {
    Array.prototype.forEach.call(document.querySelectorAll("img"), function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-empty");
      });
    });
  }

  function setupPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector("[data-play-button]");
      var message = box.querySelector("[data-player-message]");
      var url = box.getAttribute("data-video");
      var hls = null;

      if (!video || !button || !url) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function loadVideo() {
        if (box.getAttribute("data-ready") === "true") {
          return true;
        }
        box.setAttribute("data-ready", "true");
        setMessage("");

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("视频加载失败，请稍后再试");
            }
          });
          return true;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return true;
        }

        setMessage("当前浏览器暂不支持该视频格式");
        return false;
      }

      function playVideo() {
        if (!loadVideo()) {
          return;
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            setMessage("点击播放按钮开始观看");
          });
        }
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          box.classList.remove("is-playing");
        }
      });

      video.addEventListener("error", function () {
        setMessage("视频加载失败，请稍后再试");
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCatalog();
    setupImages();
    setupPlayers();
  });
})();
