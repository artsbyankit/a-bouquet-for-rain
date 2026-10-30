/* Everything that falls: the gentle ambient drift, the flower rain, and the
   celebration rain. All of it goes through drop(), which caps how many items
   exist at once and removes each one when its animation ends. */

const MAX_ITEMS = 140;
const PETAL = 'M12 2 C18 8 18 16 12 22 C6 16 6 8 12 2 Z';
const HEART = 'M12 21 C5 15 3 10 3 6.8 C3 4 5.4 2 8.2 2 C10 2 11.2 2.8 12 4.2 C12.8 2.8 14 2 15.8 2 C18.6 2 21 4 21 6.8 C21 10 19 15 12 21 Z';
const LEAF = 'M22 1 C10 4 3 10 2 17 L2 23 C8 22 24 16 30 8 Z';
const SVG_NS = 'http://www.w3.org/2000/svg';

const FLOWERS = ['🌹', '🌷', '🌺', '🥀', '🌼', '🌸', '💐', '🏵️', '🪷', '🍀', '🪻', '🌻', '💮'];
const PARTY = ['🎂', '🍰', '🧁', '🍥', '🍮', '🍩', '🍪', '🥂', '🍾', '🥃', '🍹', '🍸', '🍷', '🧋', '🥤', '☕', '🫖', '🎈', '🎉', '🎊', '🥳', '🎆', '🎇', '✨', '🎁', '🎀', '🪅', '🪩', '📦', '💝', '💖', '💗', '💓', '💕', '💞', '💘', '💌', '🎵', '🎶', '🥰', '😍', '🤩', '😊', '😄', '😃', '😀', '😆', '😁', '🍭', '🍬', '🍫', '🍨', '🍦', '🍓', '🍒', '🍉', '🍇', '🧃', '😋', '🤗', '😘', '🥹', '🙌', '👏', '🕺', '💃', '🎤', '🎺', '🥁', '🕯️', '🔥', '🌟', '⭐', '💫', '🌙', '❤️', '🩷', '🧡', '💛', '💚', '💙', '🩵', '💜', '🤎', '🖤', '🤍', '💟', '❣️', '🧸', '🫶🏻', '🦋', '🐻', '🐼', '🐰', '🐣', '🐥', '🐱', '🐶', '🦄', '🌈', '👑', '💎', '💍', '🏆', '🥇'];
const HEART_COLORS = ['#5b92c1', '#a9cfea', '#ffffff'];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const between = (min, max) => min + Math.random() * (max - min);

let live = 0;

function drop(content, { duration, delay = 0, className = '' }) {
    if (live >= MAX_ITEMS || document.hidden || reducedMotion()) return;
    const el = document.createElement('div');
    el.className = `fall ${className}`.trim();
    el.append(content);
    el.style.left = `${Math.random() * 100}vw`;
    el.style.animationDuration = `${duration}s`;
    el.style.animationDelay = `${delay}s`;
    live++;
    el.addEventListener('animationend', () => {
        el.remove();
        live--;
    }, { once: true });
    document.body.append(el);
}

function emoji(char, size) {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.fontSize = `${size}px`;
    return span;
}

function shape(path, viewBox, width, height, fill, className) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', className);
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', path);
    p.setAttribute('fill', fill);
    svg.append(p);
    return svg;
}

// The odds are documented in ODDS.md; keep the two in sync.
function ambientItem(size) {
    const kind = Math.random();
    if (kind < 0.45) return shape(PETAL, '0 0 24 24', size, size, '#ffffff', 'drift');
    if (kind >= 0.85) return shape(LEAF, '0 0 32 23', size, size * 0.72, '#9dbd9f', 'drift');
    const rare = Math.random();
    if (rare < 0.001) return emoji('💎', size);
    if (rare < 0.011) return emoji(pick(['💖', '💝']), size);
    return shape(HEART, '0 0 24 24', size, size, pick(HEART_COLORS), 'drift');
}

/* Now and then the breeze takes a petal off a flower. It falls from that exact
   flower, in that flower's color, and drifts the way the wind is blowing. */
export function startPetalShed(host, placed) {
    const blooms = placed.filter((b) => b.tier === 'big' || b.tier === 'medium');
    let shedding = 0;
    const shed = () => {
        if (document.hidden || reducedMotion() || host.classList.contains('offscreen') || shedding >= 10) return;
        const bloom = pick(blooms);
        const size = between(7, 13);
        const el = document.createElement('div');
        el.className = 'shed';
        el.append(shape(PETAL, '0 0 24 24', size, size, bloom.color, 'drift'));
        const angle = Math.random() * Math.PI * 2;
        const reach = bloom.size * 0.7 / 360;
        el.style.left = `${(bloom.left + Math.cos(angle) * reach) * 100}%`;
        el.style.top = `${(bloom.top + Math.sin(angle) * reach * 0.82) * 100}%`;
        el.style.setProperty('--dx', `${between(-20, 120)}px`);
        el.style.setProperty('--dy', `${between(260, 480)}px`);
        el.style.setProperty('--spin', `${between(200, 620)}deg`);
        el.style.animationDuration = `${between(6, 10)}s`;
        shedding++;
        el.addEventListener('animationend', () => {
            el.remove();
            shedding--;
        }, { once: true });
        host.append(el);
    };
    const tick = () => {
        shed();
        setTimeout(tick, between(1100, 2800));
    };
    setTimeout(tick, 2000);
}

export function startAmbientFall() {
    const tick = () => {
        drop(ambientItem(between(9, 18)), { duration: between(8, 14), delay: Math.random() * 2 });
        setTimeout(tick, between(600, 1200));
    };
    tick();
}

function shower(list, count, spread, minDuration, maxDuration, minSize, maxSize) {
    for (let i = 0; i < count; i++) {
        drop(emoji(pick(list), between(minSize, maxSize)), {
            duration: between(minDuration, maxDuration),
            delay: Math.random() * spread,
        });
    }
}

export function flowerRain() {
    shower(FLOWERS, 95, 5, 2, 3.6, 16, 32);
}

const celebrationBurst = (count) => shower(PARTY, count, 4, 2, 4, 18, 34);

const isRainDay = () => {
    const d = new Date();
    return d.getMonth() === 4 && d.getDate() === 9;
};

/* Celebration rain runs on May 9, or whenever the cake button says so. A press
   of the button wins for the rest of that day; the next day starts fresh. */
export function setupCelebration(button = null) {
    let timer = null;
    let override = null;
    let today = new Date().toDateString();

    const apply = () => {
        const on = override ?? isRainDay();
        button?.classList.toggle('playing', on);
        button?.setAttribute('aria-pressed', String(on));
        if (on && !timer) {
            celebrationBurst(100);
            timer = setInterval(() => celebrationBurst(60), 5000);
        } else if (!on && timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    button?.addEventListener('click', () => {
        override = !(override ?? isRainDay());
        apply();
    });

    setInterval(() => {
        const now = new Date().toDateString();
        if (now !== today) {
            today = now;
            override = null;
        }
        apply();
    }, 60000);

    apply();
}
