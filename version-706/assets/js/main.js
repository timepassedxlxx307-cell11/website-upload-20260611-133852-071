(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        mobileMenu.classList.toggle("open");
      });
    }

    document.querySelectorAll(".hero-slider").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });

      show(0);

      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5600);
      }
    });

    document.querySelectorAll("[data-scroll-target]").forEach(function (button) {
      button.addEventListener("click", function () {
        var target = document.querySelector(button.getAttribute("data-scroll-target"));
        var direction = button.getAttribute("data-direction") === "left" ? -1 : 1;

        if (target) {
          target.scrollBy({ left: direction * 460, behavior: "smooth" });
        }
      });
    });

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    var urlParams = new URLSearchParams(window.location.search);
    var keywordFromUrl = urlParams.get("keyword") || "";

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-target"));
      var keywordInput = panel.querySelector("[data-filter-keyword]");
      var regionInput = panel.querySelector("[data-filter-region]");
      var typeInput = panel.querySelector("[data-filter-type]");
      var yearInput = panel.querySelector("[data-filter-year]");

      if (keywordInput && keywordFromUrl) {
        keywordInput.value = keywordFromUrl;
      }

      function filterCards() {
        if (!target) {
          return;
        }

        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var region = normalize(regionInput ? regionInput.value : "");
        var type = normalize(typeInput ? typeInput.value : "");
        var year = normalize(yearInput ? yearInput.value : "");
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      [keywordInput, regionInput, typeInput, yearInput].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });

      filterCards();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hlsInstance = null;

      function attachStream() {
        if (!video || !stream || attached) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        attached = true;
      }

      function playVideo() {
        attachStream();
        player.classList.add("is-playing");

        if (video) {
          var playResult = video.play();

          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {});
          }
        }
      }

      if (cover) {
        cover.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
