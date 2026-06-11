(function () {
    function initPlayer(box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-cover]');
        var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-play-button]'));

        if (!video) {
            return;
        }

        var playUrl = video.getAttribute('data-play-url');
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached || !playUrl) {
                return;
            }

            attached = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = playUrl;
        }

        function start() {
            attach();
            box.classList.add('is-playing');
            video.setAttribute('controls', 'controls');
            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                start();
            });
        });

        video.addEventListener('click', function () {
            if (!attached) {
                start();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
})();
