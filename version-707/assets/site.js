(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs(".menu-toggle");
  var mobilePanel = qs(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.hasAttribute("hidden");
      if (isOpen) {
        mobilePanel.removeAttribute("hidden");
      } else {
        mobilePanel.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  qsa("[data-hero]").forEach(function (hero) {
    var slides = qsa(".hero-slide", hero);
    var dots = qsa(".hero-dot", hero);
    var prev = qs(".hero-prev", hero);
    var next = qs(".hero-next", hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        autoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        autoplay();
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        autoplay();
      });
    });

    show(0);
    autoplay();
  });

  qsa(".catalog-tools").forEach(function (form) {
    var input = qs(".page-search", form);
    var year = qs(".year-filter", form);
    var type = qs(".type-filter", form);
    var scopeSelector = form.getAttribute("data-filter-scope") || ".movie-grid";
    var grid = qs(scopeSelector, form.parentElement) || qs(scopeSelector);
    var empty = qs(".empty-state", form.parentElement || document);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function applyFilter() {
      if (!grid) {
        return;
      }
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedYear = year ? year.value : "";
      var selectedType = type ? type.value : "";
      var cards = qsa(".movie-card", grid);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (selectedYear && cardYear !== selectedYear) {
          matched = false;
        }
        if (selectedType && cardType !== selectedType) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    form.addEventListener("reset", function () {
      window.setTimeout(applyFilter, 0);
    });

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  });
})();
