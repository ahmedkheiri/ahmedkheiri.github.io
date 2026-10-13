
(() => {
    'use strict';

    const cfg = window.SLIDE_CONFIG;
    const TOTAL = cfg.total;

    const canvas = document.getElementById('slide');
    const ctx = canvas.getContext('2d');

    const counter = document.getElementById('counter');
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');
    const notice = document.getElementById('notice');
    const stage = document.getElementById('stage');
    const fullButton = document.getElementById('full');

    let current = 1;
    let token = 0;

    const pad = n => String(n).padStart(2, '0');

    /* Watermarks */
    function watermark() {
        const w = document.getElementById('watermarks');

        for (const [s, cls] of [
            [cfg.watermark, 'wm'],
            [cfg.notice, 'wm small']
        ]) {
            if (!s) continue;

            const d = document.createElement('div');
            d.className = cls;
            d.textContent = s;

            w.appendChild(d);
        }
    }

    /* Show notice */
    function showNotice() {
        notice.classList.add('show');

        clearTimeout(showNotice.t);

        showNotice.t = setTimeout(() => {
            notice.classList.remove('show');
        }, 2200);
    }

    function render(n, push = true) {
        if (n < 1 || n > TOTAL) return;

        const id = ++token;
        const img = new Image();

        img.decoding = 'async';

        img.onload = () => {
            if (id !== token) return;

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.drawImage(img, 0, 0);

            current = n;

            counter.textContent = `${n} / ${TOTAL}`;

            prev.disabled = n === 1;
            next.disabled = n === TOTAL;

            if (push) {
                history.replaceState(null, '', `#${n}`);
            }
        };

        img.onerror = () => {
            if (id === token) showNotice();
        };

        img.src = `slides/slide-${pad(n)}.jpg`;
    }

    prev.onclick = () => render(current - 1);
    next.onclick = () => render(current + 1);

    fullButton.onclick = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen failed:', err);
            showNotice();
        }
    };

    document.addEventListener('fullscreenchange', () => {
        fullButton.textContent = document.fullscreenElement
            ? 'Exit full screen'
            : 'Full screen';
    });

    document.addEventListener('keydown', e => {
        const k = e.key.toLowerCase();

        if (
            (e.ctrlKey || e.metaKey) &&
            ['s', 'p', 'u', 'c', 'a'].includes(k)
        ) {
            e.preventDefault();
            showNotice();
            return;
        }

        if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
            e.preventDefault();
            render(current + 1);
        }

        if (['ArrowLeft', 'PageUp'].includes(e.key)) {
            e.preventDefault();
            render(current - 1);
        }

        if (e.key === 'Home') {
            render(1);
        }

        if (e.key === 'End') {
            render(TOTAL);
        }
    });

    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        showNotice();
    });

    document.addEventListener('dragstart', e => {
        e.preventDefault();
    });

    document.addEventListener('copy', e => {
        e.preventDefault();
        showNotice();
    });

    window.addEventListener('beforeprint', e => {
        e.preventDefault();
        showNotice();
    });

    watermark();

    render(
        Math.min(
            TOTAL,
            Math.max(
                1,
                parseInt(location.hash.slice(1), 10) || 1
            )
        ),
        false
    );
})();
