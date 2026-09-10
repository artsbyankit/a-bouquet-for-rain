/* ---------- alphabet of flowers (SVG) ---------- */
function flowerSVG(stemH, petalFill, centerFill) {
    return `<svg width="58" height="${stemH + 70}" viewBox="0 0 58 ${stemH + 70}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="bloom">
            <g fill="${petalFill}">
                <ellipse cx="29" cy="16" rx="9" ry="18"/>
                <ellipse cx="29" cy="16" rx="9" ry="18" transform="rotate(60 29 34)"/>
                <ellipse cx="29" cy="16" rx="9" ry="18" transform="rotate(120 29 34)"/>
                <ellipse cx="29" cy="16" rx="9" ry="18" transform="rotate(180 29 34)"/>
                <ellipse cx="29" cy="16" rx="9" ry="18" transform="rotate(240 29 34)"/>
                <ellipse cx="29" cy="16" rx="9" ry="18" transform="rotate(300 29 34)"/>
            </g>
            <circle cx="29" cy="34" r="7" fill="${centerFill}"/>
        </g>
        <path class="stem" d="M29 66 V${stemH + 40}"/>
        <ellipse class="leaf" cx="27" cy="${stemH * 0.55 + 40}" rx="9" ry="4" transform="rotate(-35 27 ${stemH * 0.55 + 40})"/>
        <ellipse class="leaf" cx="33" cy="${stemH * 0.75 + 40}" rx="9" ry="4" transform="rotate(35 33 ${stemH * 0.75 + 40})"/>
    </svg>`;
}

function buildBouquet() {
    const wrap = document.getElementById('bouquet');
    const layout = [
        { left: '50%', h: 150, petal: '#d9e9f5', center: '#f2e06b', sway: 6.2, breathe: 4.8, z: 1 },
        { left: '40%', h: 185, petal: '#bdd7ea', center: '#e8d15c', sway: 7.1, breathe: 5.4, z: 3 },
        { left: '60%', h: 180, petal: '#a8c9e1', center: '#f2e06b', sway: 6.6, breathe: 5.8, z: 3 },
        { left: '45%', h: 215, petal: '#cfe3f1', center: '#e8d15c', sway: 5.4, breathe: 4.4, z: 4 },
        { left: '55%', h: 210, petal: '#bfdaee', center: '#f2e06b', sway: 5.8, breathe: 5.0, z: 4 },
        { left: '50%', h: 235, petal: '#d9e9f5', center: '#e8d15c', sway: 6.0, breathe: 4.6, z: 5 },
    ];

    layout.forEach((f, i) => {
        const el = document.createElement('div');
        el.className = 'flower';
        el.innerHTML = flowerSVG(f.h, f.petal, f.center);
        el.style.left = f.left;
        el.style.zIndex = f.z;
        el.style.setProperty('--sway', f.sway + 's');
        el.style.setProperty('--breathe', f.breathe + 's');
        el.style.transform = `translateX(-50%) rotate(${i % 2 ? 2 : -1.5}deg)`;
        wrap.appendChild(el);
    });

    wrap.insertAdjacentHTML('beforeend', `<div class="bouquet-wrap">
        <svg width="170" height="130" viewBox="0 0 170 130" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M85 130 V40 M60 118 Q85 96 110 118 M52 90 Q85 60 118 90" stroke="#8fae9a" stroke-width="3" fill="none"/>
            <path d="M30 66 L85 108 L82 72 L30 40 Z" fill="#7d9b84"/>
            <path d="M140 66 L85 108 L88 72 L140 40 Z" fill="#7d9b84"/>
            <path d="M42 130 C42 118 61 112 85 112 C109 112 128 118 128 130 L128 132 L42 132 Z" fill="#a3c7dd"/>
            <path d="M52 124 C52 116 66 112 85 112 C104 112 118 116 118 124" stroke="#8fb8d4" stroke-width="2" fill="none"/>
        </svg>
    </div>`);
}

/* ---------- floating petals & hearts ---------- */
function spawnFall() {
    const kinds = ['petal', 'heart'];
    setInterval(() => {
        const kind = kinds[Math.floor(Math.random() * kinds.length)];
        const el = document.createElement('div');
        el.className = 'fall';
        const size = 10 + Math.random() * 14;
        if (kind === 'petal') {
            el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ffffff" opacity="0.85"><path d="M12 2 C18 8 18 16 12 22 C6 16 6 8 12 2 Z"/></svg>`;
        } else {
            el.innerHTML = `<span style="font-size:${size}px;opacity:.8;">💙</span>`;
        }
        el.style.left = Math.random() * 100 + 'vw';
        el.style.animationDuration = (6 + Math.random() * 6) + 's';
        el.style.animationDelay = Math.random() * 6 + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 16000);
    }, 450);
}

/* ---------- music (music-box style, WebAudio) ---------- */
const Music = (() => {
    let ctx, timer = null, playing = false;
    const A = 220;
    const song = [
        [0, 0, 0.5], [0, 4, 0.5], [0, 7, 0.5], [0, 4, 0.5],
        [0, 9, 0.5], [0, 7, 0.5], [0, 4, 0.5], [0, 0, 0.5],
        [0, 11, 0.5], [0, 9, 0.5], [0, 7, 0.5], [0, 4, 0.5],
        [0, 9, 1], [0, 4, 0.75], [0, 0, 0.25], [0, 2, 1],
    ];
    const scale = [0, 2, 4, 5, 7, 9, 11];

    function note(i) {
        if (i < 0 || i >= 12) return;
        const freq = A * Math.pow(2, (scale[i % 7] + 12 * Math.floor(i / 7)) / 12);
        const t = ctx.currentTime;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + 1.9);
    }

    function step(i) {
        if (!playing) return;
        const [s, i2, d] = song[i % song.length];
        if (s === 0) note(i2);
        timer = setTimeout(() => step(i + 1), d * 600);
    }

    function start() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (playing) return;
        playing = true;
        ctx.resume();
        step(0);
    }

    function stop() {
        playing = false;
        clearTimeout(timer);
    }

    return { start, stop };
})();

/* ---------- init ---------- */
buildBouquet();
spawnFall();

const toggle = document.getElementById('music-toggle');
toggle.addEventListener('click', () => {
    if (toggle.classList.toggle('playing')) Music.start();
    else Music.stop();
});

// flower sway reacts to hover politely
document.querySelectorAll('.flower').forEach(f => {
    f.addEventListener('mouseenter', () => f.style.animationDuration = '2.5s');
    f.addEventListener('mouseleave', () => {
        f.style.animationDuration = f.style.getPropertyValue('--sway');
    });
});