document.addEventListener('DOMContentLoaded', function () {
    initialiseMobileNavigation();
    initialiseHeroCarousel();
    initialiseFilters();
    initialisePlayers();
    initialiseImageFallbacks();
});

function initialiseMobileNavigation() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', function () {
        nav.classList.toggle('is-open');
    });
}

function initialiseHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    function startTimer() {
        stopTimer();
        timer = window.setInterval(function () {
            showSlide(index + 1);
        }, 5000);
    }

    function stopTimer() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(index - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(index + 1);
            startTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var dotIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(dotIndex);
            startTimer();
        });
    });

    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);

    if (slides.length > 1) {
        startTimer();
    }
}

function initialiseFilters() {
    var inputList = Array.prototype.slice.call(document.querySelectorAll('.js-search-input'));
    var chipList = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var filterContainers = Array.prototype.slice.call(document.querySelectorAll('[data-filterable]'));

    if (!filterContainers.length) {
        return;
    }

    var state = {
        query: new URLSearchParams(window.location.search).get('q') || '',
        channel: '',
        year: ''
    };

    inputList.forEach(function (input) {
        input.value = state.query;
        input.addEventListener('input', function () {
            state.query = input.value.trim().toLowerCase();
            syncInputs(inputList, input, input.value);
            applyFilters();
        });
    });

    chipList.forEach(function (chip) {
        chip.addEventListener('click', function () {
            if (chip.hasAttribute('data-filter-channel')) {
                state.channel = chip.getAttribute('data-filter-channel') || '';
                setActiveChip(chipList, 'data-filter-channel', state.channel);
            }

            if (chip.hasAttribute('data-filter-year')) {
                state.year = chip.getAttribute('data-filter-year') || '';
                setActiveChip(chipList, 'data-filter-year', state.year);
            }

            applyFilters();
        });
    });

    applyFilters();

    function applyFilters() {
        var totalVisible = 0;

        filterContainers.forEach(function (container) {
            var cards = Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]'));
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-keywords') || '',
                    card.getAttribute('data-channel') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();

                var matchQuery = !state.query || haystack.indexOf(state.query) !== -1;
                var matchChannel = !state.channel || card.getAttribute('data-channel') === state.channel;
                var matchYear = !state.year || card.getAttribute('data-year') === state.year;
                var shouldShow = matchQuery && matchChannel && matchYear;

                card.classList.toggle('is-hidden-by-filter', !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            totalVisible += visible;
        });

        Array.prototype.slice.call(document.querySelectorAll('[data-result-count]')).forEach(function (node) {
            node.textContent = totalVisible + ' 部';
        });
    }
}

function syncInputs(inputs, source, value) {
    inputs.forEach(function (input) {
        if (input !== source) {
            input.value = value;
        }
    });
}

function setActiveChip(chips, attribute, value) {
    chips.forEach(function (chip) {
        if (chip.hasAttribute(attribute)) {
            chip.classList.toggle('is-active', (chip.getAttribute(attribute) || '') === value);
        }
    });
}

function initialisePlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var startButton = shell.querySelector('[data-player-start]');
        var status = shell.querySelector('[data-player-status]');
        var hlsInstance = null;
        var hasLoaded = false;

        if (!video || !startButton) {
            return;
        }

        function updateStatus(text) {
            if (status) {
                status.textContent = text;
            }
        }

        function loadSource() {
            if (hasLoaded) {
                return Promise.resolve();
            }

            hasLoaded = true;

            var m3u8 = video.getAttribute('data-m3u8') || '';
            var mp4 = video.getAttribute('data-mp4') || '';
            var canUseNativeHls = video.canPlayType('application/vnd.apple.mpegurl');

            updateStatus('正在初始化播放源…');

            if (m3u8 && m3u8.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(m3u8);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    updateStatus('播放源已就绪');
                });

                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && mp4) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = mp4;
                        updateStatus('HLS 播放源异常，已切换备用 MP4 源');
                    }
                });
            } else if (m3u8 && m3u8.indexOf('.m3u8') !== -1 && canUseNativeHls) {
                video.src = m3u8;
                updateStatus('已使用浏览器原生 HLS 播放能力');
            } else if (mp4) {
                video.src = mp4;
                updateStatus('已加载备用 MP4 播放源');
            } else if (m3u8) {
                video.src = m3u8;
                updateStatus('已加载播放源');
            } else {
                updateStatus('当前影片暂无可用播放源');
            }

            video.setAttribute('controls', 'controls');
            return Promise.resolve();
        }

        function playVideo() {
            loadSource().then(function () {
                shell.classList.add('is-playing');

                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        shell.classList.remove('is-playing');
                        updateStatus('浏览器阻止了自动播放，请再次点击视频播放');
                    });
                }
            });
        }

        startButton.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                shell.classList.remove('is-playing');
            }
        });
        video.addEventListener('ended', function () {
            shell.classList.remove('is-playing');
        });
    });
}

function initialiseImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-fallback-title]'));

    images.forEach(function (image) {
        image.addEventListener('error', function () {
            var parent = image.parentElement;
            var title = image.getAttribute('data-fallback-title') || image.getAttribute('alt') || '影片封面';
            var overlayContainers = [
                'movie-poster-link',
                'category-tile',
                'category-card-cover',
                'hero-slide',
                'category-hero',
                'player-cover'
            ];
            var shouldUseOverlay = parent && overlayContainers.some(function (className) {
                return parent.classList.contains(className);
            });

            if (shouldUseOverlay) {
                var label = document.createElement('span');
                image.classList.add('poster-missing');
                label.className = 'poster-fallback-label';
                label.textContent = title;

                if (!parent.querySelector('.poster-fallback-label')) {
                    parent.style.position = parent.style.position || 'relative';
                    parent.insertBefore(label, image.nextSibling);
                }
            } else {
                var replacement = document.createElement('span');
                replacement.className = image.classList.contains('detail-poster')
                    ? 'inline-image-fallback detail-poster-fallback'
                    : 'inline-image-fallback';
                replacement.textContent = title;
                image.replaceWith(replacement);
            }
        }, { once: true });
    });
}
