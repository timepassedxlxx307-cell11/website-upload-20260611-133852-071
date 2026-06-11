(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('.nav-toggle');
    var menu = qs('.mobile-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    qsa('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-hidden');
        });
    });

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var index = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 6200);
    }

    qsa('[data-filter-input]').forEach(function (input) {
        var targetName = input.getAttribute('data-filter-input');
        var list = qs('[data-card-list="' + targetName + '"]');

        if (!list) {
            return;
        }

        var cards = qsa('[data-movie-card]', list);
        var empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = '没有找到匹配的影片';
        list.appendChild(empty);

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' ').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                visible += matched ? 1 : 0;
            });

            empty.style.display = visible ? 'none' : 'block';
        });
    });
})();
