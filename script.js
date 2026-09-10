/* ---------- alphabet of flowers (SVG) ---------- */
function flowerSVG(stemH, petalFill, centerFill, centerHi, id) {
    const rot = (a) => `transform="rotate(${a} 32 40)"`;
    return `<svg width="64" height="${stemH + 84}" viewBox="0 0 64 ${stemH + 84}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="sh${id}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#ffffff" stop-opacity="0.6"/>
                <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <g class="bloom">
            <g fill="${petalFill}">
                <ellipse cx="32" cy="18" rx="10" ry="19"/>
                <ellipse cx="32" cy="18" rx="10" ry="19" ${rot(60)}/>
                <ellipse cx="32" cy="18" rx="10" ry="19" ${rot(120)}/>
                <ellipse cx="32" cy="18" rx="10" ry="19" ${rot(180)}/>
                <ellipse cx="32" cy="18" rx="10" ry="19" ${rot(240)}/>
                <ellipse cx="32" cy="18" rx="10" ry="19" ${rot(300)}/>
            </g>
            <g fill="url(#sh${id})">
                <ellipse cx="32" cy="15" rx="6.5" ry="14"/>
                <ellipse cx="32" cy="15" rx="6.5" ry="14" ${rot(60)}/>
                <ellipse cx="32" cy="15" rx="6.5" ry="14" ${rot(120)}/>
                <ellipse cx="32" cy="15" rx="6.5" ry="14" ${rot(180)}/>
                <ellipse cx="32" cy="15" rx="6.5" ry="14" ${rot(240)}/>
                <ellipse cx="32" cy="15" rx="6.5" ry="14" ${rot(300)}/>
            </g>
            <circle cx="32" cy="40" r="9.5" fill="${centerFill}"/>
            <circle cx="32" cy="40" r="6" fill="${centerHi}"/>
            <circle cx="30.2" cy="37.8" r="2.2" fill="#ffffff" opacity="0.9"/>
        </g>
        <path class="stem" d="M32 78 V${stemH + 42}"/>
        <ellipse class="leaf" cx="30" cy="${stemH * 0.5 + 42}" rx="10" ry="4.4" transform="rotate(-32 30 ${stemH * 0.5 + 42})"/>
        <ellipse class="leaf" cx="36" cy="${stemH * 0.72 + 42}" rx="10" ry="4.4" transform="rotate(32 36 ${stemH * 0.72 + 42})"/>
    </svg>`;
}

function buildBouquet() {
    const wrap = document.getElementById('bouquet');
    const layout = [
        { left: '50%', h: 150, petal: '#dcf0fb', c1: '#f4e6bd', c2: '#e7c98c', sway: 6.2, breathe: 4.8, z: 1 },
        { left: '40%', h: 185, petal: '#c6e0f2', c1: '#f4e6bd', c2: '#e7c98c', sway: 7.1, breathe: 5.4, z: 2 },
        { left: '60%', h: 180, petal: '#b3d5ec', c1: '#f3d7e3', c2: '#e2a8c4', sway: 6.6, breathe: 5.8, z: 2 },
        { left: '45%', h: 215, petal: '#d7ebfa', c1: '#f4e6bd', c2: '#e7c98c', sway: 5.4, breathe: 4.4, z: 3 },
        { left: '55%', h: 210, petal: '#bdd9ef', c1: '#f3d7e3', c2: '#e2a8c4', sway: 5.8, breathe: 5.0, z: 3 },
        { left: '50%', h: 235, petal: '#dcecf7', c1: '#f4e6bd', c2: '#e7c98c', sway: 6.0, breathe: 4.6, z: 4 },
        { left: '31%', h: 130, petal: '#e4f2fb', c1: '#f3d7e3', c2: '#e2a8c4', sway: 7.6, breathe: 6.2, z: 1 },
        { left: '69%', h: 140, petal: '#e4f2fb', c1: '#f4e6bd', c2: '#e7c98c', sway: 7.8, breathe: 6.4, z: 1 },
    ];

    layout.forEach((f, i) => {
        const el = document.createElement('div');
        el.className = 'flower';
        el.innerHTML = flowerSVG(f.h, f.petal, f.c1, f.c2, i);
        el.style.left = f.left;
        el.style.zIndex = f.z;
        el.style.setProperty('--sway', f.sway + 's');
        el.style.setProperty('--breathe', f.breathe + 's');
        el.style.transform = `translateX(-50%) rotate(${i % 2 ? 2 : -1.5}deg)`;
        wrap.appendChild(el);
    });

    wrap.insertAdjacentHTML('beforeend', `<div class="bouquet-wrap">
        <svg width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M34 70 L90 112 L86 76 L34 42 Z" fill="#8fb8d4"/>
            <path d="M146 70 L90 112 L94 76 L146 42 Z" fill="#8fb8d4"/>
            <path d="M44 140 C44 126 64 118 90 118 C116 118 136 126 136 140 L136 142 L44 142 Z" fill="#a7c8de"/>
            <path d="M54 134 C54 125 68 120 90 120 C112 120 126 125 126 134" stroke="#8fb8d4" stroke-width="2" fill="none"/>
            <path d="M52 128 L90 112 L128 128" stroke="#efd8a7" stroke-width="7" fill="none" stroke-linecap="round"/>
            <g fill="#efd8a7">
                <ellipse cx="74" cy="120" rx="16" ry="9" transform="rotate(-20 74 120)"/>
                <ellipse cx="106" cy="120" rx="16" ry="9" transform="rotate(20 106 120)"/>
            </g>
            <circle cx="90" cy="120" r="6" fill="#e7c98c"/>
        </svg>
    </div>`);

    const sparks = [
        { x: '26%', y: '4%', s: 11, d: 0 },
        { x: '68%', y: '8%', s: 8, d: 1.1 },
        { x: '50%', y: '-2%', s: 9, d: 2.2 },
        { x: '35%', y: '26%', s: 7, d: 0.6 },
        { x: '64%', y: '24%', s: 7, d: 1.7 },
    ];
    sparks.forEach(s => {
        wrap.insertAdjacentHTML('beforeend', `<svg class="spark" style="left:${s.x};top:${s.y};animation-delay:${s.d}s" width="${s.s}" height="${s.s}" viewBox="0 0 24 24" fill="#ffffff"><path d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z"/></svg>`);
    });
}

/* ---------- floating petals & hearts ---------- */
function spawnOneFall() {
    const r = Math.random();
    const kind = r < 0.45 ? 'petal' : (r < 0.85 ? 'heart' : 'leaf');
    const el = document.createElement('div');
    el.className = 'fall';
    const size = 10 + Math.random() * 14;
    if (kind === 'petal') {
        el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#ffffff" opacity="0.85"><path d="M12 2 C18 8 18 16 12 22 C6 16 6 8 12 2 Z"/></svg>`;
    } else if (kind === 'leaf') {
        el.innerHTML = `<svg width="${size}" height="${size * 0.72}" viewBox="0 0 32 23" fill="#9dbd9f" opacity="0.85"><path d="M22 1 C10 4 3 10 2 17 L2 23 C8 22 24 16 30 8 Z"/><path d="M6 12 L30 12" stroke="#7d9b84" stroke-width="1.4"/></svg>`;
    } else {
        const hearts = ['💙', '🩵', '🤍', '💙', '🩵', '🤍'];
        if (Math.random() < 0.001) {
            el.innerHTML = `<span style="font-size:${size}px;opacity:.95;">💎</span>`;
            el.style.animationDelay = '1s';
        } else if (Math.random() < 0.01) {
            const s = ['💖', '💝'][Math.floor(Math.random() * 2)];
            el.innerHTML = `<span style="font-size:${size}px;opacity:.9;">${s}</span>`;
        } else {
            const h = hearts[Math.floor(Math.random() * hearts.length)];
            el.innerHTML = `<span style="font-size:${size}px;opacity:.85;">${h}</span>`;
        }
    }
    el.style.left = Math.random() * 100 + 'vw';
    el.style.animationDuration = (6 + Math.random() * 6) + 's';
    el.style.animationDelay = Math.random() * 4 + 's';
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), (6 + 6 + 4) * 1000 + 2000);
}

function spawnFall() {
    const tick = () => {
        spawnOneFall();
        setTimeout(tick, 380 + Math.random() * 420);
    };
    tick();
}

/* ---------- flower rain on double-click of the name ---------- */
function flowerRain() {
    const emojis = ['🌹', '🌷', '🌺', '🥀', '🌼', '🌸', '💐', '🏵️', '🪷', '🍀', '🪻', '🌻', '💮'];
    for (let i = 0; i < 95; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'fall frain';
            const size = 16 + Math.random() * 16;
            el.innerHTML = `<span style="font-size:${size}px;">${emojis[Math.floor(Math.random() * emojis.length)]}</span>`;
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (2 + Math.random() * 1.6) + 's';
            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove(), { once: true });
            setTimeout(() => el.remove(), 5000);
        }, Math.random() * 5000);
    }
}

document.addEventListener('dblclick', (e) => {
    const hit = e.target.closest('.title, .foot p, .photo-caption');
    if (hit && /rain/i.test(hit.textContent)) flowerRain();
});

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

function spawnDemoDiamond() {
    const el = document.createElement('div');
    el.className = 'fall';
    el.innerHTML = `<span style="font-size:26px;opacity:.95;">💎</span>`;
    el.style.left = (30 + Math.random() * 40) + 'vw';
    el.style.animationDuration = (6 + Math.random() * 3) + 's';
    el.style.animationDelay = '0.4s';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 15000);
}

function spawnCelebrationRain(count) {
    const party = ['🎂', '🍰', '🧁', '🍥', '🍮', '🍩', '🍪', '🥂', '🍾', '🥃', '🍹', '🍸', '🍷', '🧋', '🥤', '☕', '🫖', '🎈', '🎉', '🎊', '🥳', '🎆', '🎇', '✨', '🎁', '🎀', '🪅', '🪩', '📦', '💝', '💖', '💗', '💓', '💕', '💞', '💘', '💌', '🎵', '🎶', '🥰', '😍', '🤩', '😊', '😄', '😃', '😀', '😆', '😁', '🍭', '🍬', '🍫', '🍨', '🍦', '🍓', '🍒', '🍉', '🍇', '🧃', '😋', '🤗', '😘', '🥹', '🙌', '👏', '🕺', '💃', '🎤', '🎺', '🥁', '🕯️', '🔥', '🌟', '⭐', '💫', '🌙', '❤️', '🩷', '🧡', '💛', '💚', '💙', '🩵', '💜', '🤎', '🖤', '🤍', '💟', '❣️', '🧸', '🫶🏻', '🦋', '🐻', '🐼', '🐰', '🐣', '🐥', '🐱', '🐶', '🦄', '🌈', '👑', '💎', '💍', '🏆', '🥇'];
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'fall frain';
            const size = 18 + Math.random() * 16;
            el.innerHTML = `<span style="font-size:${size}px;">${party[Math.floor(Math.random() * party.length)]}</span>`;
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (2 + Math.random() * 2) + 's';
            document.body.appendChild(el);
            el.addEventListener('animationend', () => el.remove(), { once: true });
            setTimeout(() => el.remove(), 8000);
        }, Math.random() * 4000);
    }
}

const toggle = document.getElementById('music-toggle');
toggle.addEventListener('click', () => {
    if (toggle.classList.toggle('playing')) Music.start();
    else Music.stop();
    spawnDemoDiamond();
});

function spawnDemoCake() {
    spawnCelebrationRain(130);
}

document.getElementById('cake-toggle').addEventListener('click', spawnDemoCake);

function isRainDay() {
    const d = new Date();
    return d.getMonth() === 4 && d.getDate() === 9;
}

if (isRainDay()) {
    spawnCelebrationRain(180);
    setInterval(() => spawnCelebrationRain(130), 6000);
}

// flower sway reacts to hover politely
document.querySelectorAll('.flower').forEach(f => {
    f.addEventListener('mouseenter', () => f.style.animationDuration = '2.5s');
    f.addEventListener('mouseleave', () => {
        f.style.animationDuration = f.style.getPropertyValue('--sway');
    });
});