/* The bouquet, painted in code: watercolor washes with inked outlines, and a
   new arrangement on every load. Fixed slots keep the composition balanced; each
   slot draws a random flower and color. Every stem meets where the ribbon ties
   them. Each swaying flower is its own <svg> layer, so the costly paint filter
   runs once and the GPU just rotates the result. */

const VIEW = { width: 360, height: 438, top: -8 };
const TIE = { x: 180, y: 316 };
const INK = '#26415a';

const PALETTES = {
    white: { tip: '#ffffff', base: '#cfe0ee', deep: '#9dbdd6', core: '#26415a', stamen: '#d9a94f' },
    powder: { tip: '#eef7fc', base: '#bcd8ea', deep: '#8fb8d4', core: '#26415a', stamen: '#efd9a3' },
    sky: { tip: '#d8ecf9', base: '#8dbcdf', deep: '#5f96c4', core: '#1f3550', stamen: '#efd9a3' },
    blue: { tip: '#a9cfea', base: '#5b92c1', deep: '#2f6a9f', core: '#f4e2b4', stamen: '#d9a94f' },
    pink: { tip: '#fdf0f4', base: '#eeb9cf', deep: '#cf7fa3', core: '#e7a93c', stamen: '#7d4a63' },
    yellow: { tip: '#fff9dc', base: '#f7e08f', deep: '#e3b64a', core: '#a8701c', stamen: '#6e4a12' },
    red: { tip: '#f39a93', base: '#d9534f', deep: '#a82d33', core: '#2a1a24', stamen: '#efd9a3' },
    cream: { tip: '#fffbf2', base: '#f3e2bb', deep: '#dcbc7d', core: '#d98f2b', stamen: '#8a5a1c' },
};

// How often each color is drawn: mostly blues and white, with warm accents.
const COLOR_WEIGHTS = { sky: 3, powder: 3, white: 3, blue: 1.5, pink: 2, yellow: 1, red: 1, cream: 1 };
const MAX_OF_ONE_COLOR = 3;

const random = (min, max) => min + Math.random() * (max - min);

function shuffled(list) {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function pickColors(count, limit = MAX_OF_ONE_COLOR) {
    const used = {};
    const colors = [];
    while (colors.length < count) {
        const names = Object.keys(COLOR_WEIGHTS).filter((n) => (used[n] || 0) < limit);
        let roll = Math.random() * names.reduce((sum, n) => sum + COLOR_WEIGHTS[n], 0);
        const name = names.find((n) => (roll -= COLOR_WEIGHTS[n]) < 0) || names[0];
        used[name] = (used[name] || 0) + 1;
        colors.push(name);
    }
    return colors;
}

// Where flowers sit, spaced so they touch without piling up. Big ones are at the
// back, then medium, small and tiny toward the viewer. x, y: centre. size: radius.
// open slots aren't covered by anything, which a slim side-on tulip needs.
const BLOOM_SLOTS = [
    { x: 180, y: 62, size: 42, open: true },
    { x: 104, y: 100, size: 38, open: true },
    { x: 256, y: 98, size: 38, open: true },
    { x: 96, y: 178, size: 36 },
    { x: 264, y: 178, size: 36 },
    { x: 180, y: 146, size: 48, hero: true },
];

const MEDIUM_SLOTS = [
    { x: 48, y: 130, size: 24 },
    { x: 312, y: 128, size: 24 },
    { x: 116, y: 38, size: 22 },
    { x: 244, y: 36, size: 22 },
    { x: 140, y: 218, size: 22 },
    { x: 222, y: 218, size: 22 },
];

const SMALL_SLOTS = [
    { x: 56, y: 80, size: 14 },
    { x: 304, y: 78, size: 14 },
    { x: 38, y: 180, size: 14 },
    { x: 322, y: 180, size: 14 },
    { x: 181, y: 212, size: 15 },
    { x: 64, y: 216, size: 13 },
    { x: 296, y: 216, size: 13 },
];

const TINY_SLOTS = [
    { x: 142, y: 112 },
    { x: 218, y: 110 },
    { x: 180, y: 11 },
    { x: 150, y: 14 },
    { x: 211, y: 12 },
    { x: 24, y: 106 },
    { x: 336, y: 104 },
    { x: 86, y: 54 },
];

const MEDIUM_KINDS = ['anemone', 'daisy', 'cosmos', 'ranunculus', 'poppy', 'rose', 'lily', 'peony'];
const SMALL_KINDS = ['daisy', 'cosmos', 'blossom', 'ranunculus', 'anemone'];

// Greenery and fillers, tucked in behind the blooms. lift arches a low stem upward
// so it leaves through the wrap's opening rather than behind its side.
const SPRIG_SLOTS = [
    { x: 22, y: 88 },
    { x: 338, y: 84 },
    { x: 138, y: 2 },
    { x: 228, y: 0 },
    { x: 56, y: 44 },
    { x: 308, y: 38 },
    { x: 16, y: 200, lift: 52 },
    { x: 344, y: 204, lift: 52 },
];

const SPRIG_KINDS = ['leaves', 'breath', 'lavender', 'berries'];

const round = (n) => Math.round(n * 100) / 100;

// A petal with a slightly uneven outline, and a few veins drawn from the base.
function petal(length, width, fill, name, veins) {
    const l = round(length);
    const w = round(width);
    const shape = `M0 0 C${w} ${round(-l * 0.25)} ${round(w * 1.08)} ${round(-l * 0.9)} ${round(w * 0.12)} ${-l} C${round(-w * 0.3)} ${round(-l * 1.03)} ${-w} ${round(-l * 0.86)} ${round(-w * 0.94)} ${round(-l * 0.3)} Q${round(-w * 0.5)} ${round(-l * 0.06)} 0 0Z`;
    let lines = '';
    for (let i = 0; i < veins; i++) {
        const spread = (i - (veins - 1) / 2) * w * 0.34;
        lines += `<path d="M0 ${round(-l * 0.14)} Q${round(spread * 0.5)} ${round(-l * 0.4)} ${round(spread)} ${round(-l * 0.66)}" fill="none" stroke="${PALETTES[name].deep}" stroke-width="0.55" stroke-linecap="round" opacity="0.7"/>`;
    }
    return `<path d="${shape}" fill="${fill}" stroke="${INK}" stroke-width="0.85" stroke-linejoin="round"/>${lines}`;
}

function ring(count, length, width, offset, fill, name, veins = 0) {
    let out = '';
    for (let i = 0; i < count; i++) {
        // Small fixed variation per petal keeps the ring from looking stamped out.
        const wobble = ((i * 7) % 5) - 2;
        const scale = 1 + ((i * 3) % 4 - 1.5) * 0.035;
        out += `<g transform="rotate(${round(offset + (360 / count) * i + wobble * 1.6)}) scale(${round(scale)})">${petal(length, width, fill, name, veins)}</g>`;
    }
    return out;
}

function stamens(count, radius, size, fill) {
    let out = '';
    for (let i = 0; i < count; i++) {
        const a = (Math.PI * 2 * i) / count;
        const x = round(Math.cos(a) * radius);
        const y = round(Math.sin(a) * radius);
        out += `<path d="M0 0 L${x} ${y}" stroke="${INK}" stroke-width="0.4" opacity="0.7"/><circle cx="${x}" cy="${y}" r="${size}" fill="${fill}" stroke="${INK}" stroke-width="0.35"/>`;
    }
    return out;
}

const wash = (name) => `url(#wash-${name})`;
const heart = (name) => `url(#heart-${name})`;

// A narrow petal that tapers to a point, with a center line.
function pointedRing(count, length, width, offset, fill, name) {
    let out = '';
    for (let i = 0; i < count; i++) {
        const l = round(length);
        const w = round(width);
        out += `<g transform="rotate(${round(offset + (360 / count) * i)})"><path d="M0 0 C${w} ${round(-l * 0.3)} ${w} ${round(-l * 0.7)} 0 ${-l} C${-w} ${round(-l * 0.7)} ${-w} ${round(-l * 0.3)} 0 0Z" fill="${fill}" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/><path d="M0 ${round(-l * 0.12)} L0 ${round(-l * 0.8)}" stroke="${PALETTES[name].deep}" stroke-width="0.6" opacity="0.8"/></g>`;
    }
    return out;
}

const DRAW = {
    peony(r, name) {
        const p = PALETTES[name];
        return ring(11, r, r * 0.42, 0, wash(name), name, 3)
            + ring(10, r * 0.8, r * 0.36, 17, wash(name), name, 2)
            + ring(8, r * 0.6, r * 0.3, 7, heart(name), name, 1)
            + ring(6, r * 0.4, r * 0.22, 31, heart(name), name)
            + ring(4, r * 0.22, r * 0.14, 12, heart(name), name)
            + `<circle r="${round(r * 0.07)}" fill="${p.deep}" stroke="${INK}" stroke-width="0.5"/>`;
    },
    anemone(r, name) {
        const p = PALETTES[name];
        return ring(7, r, r * 0.52, 0, wash(name), name, 3)
            + ring(6, r * 0.78, r * 0.44, 28, wash(name), name, 3)
            + stamens(20, r * 0.33, 1.15, p.stamen)
            + `<circle r="${round(r * 0.19)}" fill="${p.core}" stroke="${INK}" stroke-width="0.6"/>`;
    },
    daisy(r, name) {
        const p = PALETTES[name];
        return ring(15, r, r * 0.17, 0, wash(name), name, 1)
            + `<circle r="${round(r * 0.27)}" fill="${p.core}" stroke="${INK}" stroke-width="0.6"/>`
            + stamens(10, r * 0.15, 0.8, p.stamen);
    },
    blossom(r, name) {
        // A simple five-petal flower, clear even at tiny sizes.
        const p = PALETTES[name];
        return ring(5, r, r * 0.46, 0, wash(name), name)
            + `<circle r="${round(r * 0.24)}" fill="${p.stamen}" stroke="${INK}" stroke-width="0.4"/>`;
    },
    rose(r, name) {
        const p = PALETTES[name];
        let spiral = '';
        for (const [ring_, size, rot] of [[0.62, 0.3, 12], [0.44, 0.24, 40], [0.28, 0.17, 70]]) {
            spiral += ring(3, r * ring_, r * size, rot, heart(name), name);
        }
        return ring(6, r, r * 0.6, 0, wash(name), name, 2)
            + ring(5, r * 0.8, r * 0.46, 30, wash(name), name)
            + spiral
            + `<path d="M${round(-r * 0.07)} 0 A${round(r * 0.07)} ${round(r * 0.07)} 0 1 1 ${round(r * 0.05)} ${round(r * 0.05)}" fill="none" stroke="${INK}" stroke-width="0.8" stroke-linecap="round"/><circle r="${round(r * 0.02)}" fill="${p.deep}"/>`;
    },
    poppy(r, name) {
        const p = PALETTES[name];
        return ring(3, r, r * 0.72, 0, wash(name), name, 3)
            + ring(3, r * 0.84, r * 0.66, 60, wash(name), name, 3)
            + stamens(24, r * 0.3, 0.9, p.core)
            + `<circle r="${round(r * 0.17)}" fill="${p.stamen}" stroke="${INK}" stroke-width="0.6"/><path d="M${round(-r * 0.12)} 0 H${round(r * 0.12)} M0 ${round(-r * 0.12)} V${round(r * 0.12)}" stroke="${INK}" stroke-width="0.5"/>`;
    },
    cosmos(r, name) {
        const p = PALETTES[name];
        return ring(8, r, r * 0.34, 0, wash(name), name, 3)
            + stamens(14, r * 0.14, 0.9, '#e7a93c')
            + `<circle r="${round(r * 0.1)}" fill="${p.deep}" stroke="${INK}" stroke-width="0.5"/>`;
    },
    ranunculus(r, name) {
        let out = '';
        const rings = [[12, 1, 0.34], [11, 0.84, 0.3], [10, 0.68, 0.27], [8, 0.52, 0.22], [7, 0.37, 0.17], [5, 0.23, 0.12]];
        rings.forEach(([count, length, width], i) => {
            out += ring(count, r * length, r * width, i * 13, i < 3 ? wash(name) : heart(name), name);
        });
        return out + `<circle r="${round(r * 0.06)}" fill="#a0bda4" stroke="${INK}" stroke-width="0.5"/>`;
    },
    hydrangea(r, name) {
        // Many small four-petal florets packed into a dome.
        const p = PALETTES[name];
        let out = `<circle r="${round(r * 0.8)}" fill="${p.deep}" opacity="0.5"/>`;
        const floret = (x, y, size, turn) => `<g transform="translate(${round(x)} ${round(y)}) rotate(${turn})">${ring(4, size, size * 0.62, 0, wash(name), name)}<circle r="${round(size * 0.15)}" fill="${p.stamen}" stroke="${INK}" stroke-width="0.3"/></g>`;
        for (const [count, dist] of [[11, 0.74], [8, 0.42], [1, 0]]) {
            for (let i = 0; i < count; i++) {
                const a = (Math.PI * 2 * i) / count + dist;
                out += floret(Math.cos(a) * r * dist, Math.sin(a) * r * dist, r * 0.27, (i * 37) % 90);
            }
        }
        return out;
    },
    lily(r, name) {
        const p = PALETTES[name];
        return pointedRing(3, r, r * 0.27, 60, wash(name), name)
            + pointedRing(3, r * 1.04, r * 0.24, 0, wash(name), name)
            + stamens(6, r * 0.36, 1.5, p.core)
            + `<circle r="${round(r * 0.08)}" fill="#a0bda4" stroke="${INK}" stroke-width="0.5"/>`;
    },
    tulip(r, name) {
        // Drawn from the side, so it's rotated to continue its stem.
        const w = round(r * 0.56);
        const h = round(r * 1.1);
        const base = round(r * 0.5);
        const side = (flip) => `<path d="M0 ${base} C${flip * w * 1.2} ${base} ${flip * w * 1.1} ${round(-h * 0.45)} ${flip * w * 0.82} ${-h} C${flip * w * 0.4} ${round(-h * 0.76)} ${flip * w * 0.2} ${round(-h * 0.5)} 0 ${round(-h * 0.2)}Z" fill="${wash(name)}" stroke="${INK}" stroke-width="0.85" stroke-linejoin="round"/>`;
        return `<path d="M0 ${base} C${round(-w * 0.8)} ${round(r * 0.2)} ${round(-w * 0.62)} ${round(-h * 0.7)} 0 ${round(-h * 1.08)} C${round(w * 0.62)} ${round(-h * 0.7)} ${round(w * 0.8)} ${round(r * 0.2)} 0 ${base}Z" fill="${heart(name)}" stroke="${INK}" stroke-width="0.85" stroke-linejoin="round"/>` + side(-1) + side(1);
    },
};

function curve(x, y, lift = 0) {
    return { cx: TIE.x + (x - TIE.x) * 0.25, cy: (y + TIE.y) / 2 + 26 - lift };
}

function stem(x, y, width, lift) {
    const { cx, cy } = curve(x, y, lift);
    return `<path d="M${TIE.x} ${TIE.y} Q${round(cx)} ${round(cy)} ${x} ${y}" stroke="#7f9e88" stroke-width="${width}" fill="none" stroke-linecap="round"/>
        <path d="M${TIE.x + 0.8} ${TIE.y} Q${round(cx + 0.8)} ${round(cy)} ${x + 0.8} ${y}" stroke="${INK}" stroke-width="0.45" fill="none" opacity="0.6"/>`;
}

const LEAF = 'M0 0 C8 -6 10 -18 0 -28 C-10 -18 -8 -6 0 0Z';

function leaf(x, y, angle, scale) {
    return `<g transform="translate(${round(x)} ${round(y)}) rotate(${round(angle)}) scale(${round(scale)})">
        <path d="${LEAF}" fill="url(#leaf)" stroke="${INK}" stroke-width="0.7"/>
        <path d="M0 -2 L0 -23" stroke="${INK}" stroke-width="0.4" opacity="0.6"/>
    </g>`;
}

// Leaf pairs along the curve the stem follows, from its tip back toward the tie.
function foliage({ x, y, lift }) {
    const { cx, cy } = curve(x, y, lift);
    const tipAngle = Math.atan2(x - cx, cy - y) * 180 / Math.PI;
    let out = leaf(x, y, tipAngle, 1);
    for (const t of [0.12, 0.26, 0.4, 0.54]) {
        const u = 1 - t;
        const px = u * u * x + 2 * u * t * cx + t * t * TIE.x;
        const py = u * u * y + 2 * u * t * cy + t * t * TIE.y;
        const angle = Math.atan2(px - (u * cx + t * TIE.x), (u * cy + t * TIE.y) - py) * 180 / Math.PI;
        out += leaf(px, py, angle - 44, 1 - t * 0.55) + leaf(px, py, angle + 44, 1 - t * 0.55);
    }
    return out;
}

// A spray of tiny flowers on fine twigs, growing from the stem's tip along its direction.
function breath({ x, y, lift }) {
    const { cx, cy } = curve(x, y, lift);
    const angle = Math.atan2(x - cx, cy - y) * 180 / Math.PI;
    const dots = [[0, -22, 3.4], [-9, -15, 2.8], [8, -14, 3], [-3, -30, 2.6], [11, -26, 2.4], [-12, -26, 2.2], [3, -9, 2.4], [-5, -7, 2], [15, -18, 1.9], [-16, -18, 1.8]];
    const art = dots.map(([dx, dy, r]) => `<path d="M0 0 L${dx} ${dy}" stroke="#7f9e88" stroke-width="0.5"/><circle cx="${dx}" cy="${dy}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="0.5"/>`).join('');
    return `<g transform="translate(${x} ${y}) rotate(${round(angle)})">${art}</g>`;
}

function tipAngle({ x, y, lift }) {
    const { cx, cy } = curve(x, y, lift);
    return round(Math.atan2(x - cx, cy - y) * 180 / Math.PI);
}

// A spike of tiny buds that narrows toward its tip.
function lavender(slot) {
    let buds = '';
    for (let i = 0; i < 9; i++) {
        const spread = 4.2 - i * 0.34;
        for (const side of [-1, 1]) {
            buds += `<ellipse cx="${round(side * spread)}" cy="${-3 - i * 3.4}" rx="2.3" ry="3" transform="rotate(${side * 22} ${round(side * spread)} ${-3 - i * 3.4})" fill="#b7a7dc" stroke="${INK}" stroke-width="0.4"/>`;
        }
    }
    return `<g transform="translate(${slot.x} ${slot.y}) rotate(${tipAngle(slot)})"><path d="M0 0 L0 -34" stroke="#7f9e88" stroke-width="1"/>${buds}</g>`;
}

// A little branch of round berries.
function berries(slot) {
    const spots = [[0, -22, 3.6], [-8, -16, 3.2], [8, -15, 3.4], [-3, -10, 2.8], [12, -24, 2.8], [-12, -25, 2.8]];
    const art = spots.map(([dx, dy, r]) => `<path d="M0 0 L${dx} ${dy}" stroke="#7f9e88" stroke-width="0.6"/><circle cx="${dx}" cy="${dy}" r="${r}" fill="#5f8fb8" stroke="${INK}" stroke-width="0.5"/><circle cx="${round(dx - r * 0.3)}" cy="${round(dy - r * 0.3)}" r="${round(r * 0.25)}" fill="#ffffff" opacity="0.7"/>`).join('');
    return `<g transform="translate(${slot.x} ${slot.y}) rotate(${tipAngle(slot)})">${art}</g>`;
}

const SPRIG_ART = { leaves: foliage, breath, lavender, berries };

// Shared paint: gradients, and two filters that wobble the line like a hand-drawn
// pen and mottle the colour like pigment settling in wet paper.
function paintDefs() {
    const stops = (a, b, c) => `<stop offset="0" stop-color="${a}"/><stop offset="0.55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>`;
    const palettes = Object.entries(PALETTES).map(([name, p]) => `
        <linearGradient id="wash-${name}" x1="0" y1="1" x2="0" y2="0">${stops(p.deep, p.base, p.tip)}</linearGradient>
        <linearGradient id="heart-${name}" x1="0" y1="1" x2="0" y2="0">${stops(p.deep, p.deep, p.base)}</linearGradient>`).join('');
    return `<svg class="paint-defs" width="0" height="0" aria-hidden="true"><defs>${palettes}
        <linearGradient id="leaf" x1="0" y1="1" x2="0" y2="0">${stops('#6f9180', '#a0bda4', '#c9dbc6')}</linearGradient>
        <linearGradient id="paper-left" x1="0" y1="0" x2="1" y2="1">${stops('#fbfdfe', '#e4eff6', '#bcd5e6')}</linearGradient>
        <linearGradient id="paper-right" x1="1" y1="0" x2="0" y2="1">${stops('#f0f6fa', '#cfe2ef', '#a7c8de')}</linearGradient>
        <linearGradient id="paper-back" x1="0" y1="0" x2="0" y2="1">${stops('#d7e7f2', '#a7c8de', '#8fb8d4')}</linearGradient>
        <linearGradient id="ribbon" x1="0" y1="0" x2="0" y2="1">${stops('#fbf1d9', '#f0dcae', '#dcbc7d')}</linearGradient>
        <filter id="painted" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="${Math.floor(random(1, 999))}" result="warp"/>
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="drawn"/>
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="4" seed="21" result="grain"/>
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1.6 0 0 0 -0.55" result="pigment"/>
            <feComposite in="pigment" in2="drawn" operator="in" result="mottle"/>
            <feBlend in="mottle" in2="drawn" mode="soft-light"/>
        </filter>
    </defs></svg>`;
}

const layer = (className, content, label = '') => `<svg class="${className}" viewBox="0 ${VIEW.top} ${VIEW.width} ${VIEW.height}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><g filter="url(#painted)">${content}</g></svg>`;

const WRAP_BACK = `<path d="M82 234 Q106 202 134 226 Q158 198 180 222 Q204 198 228 226 Q256 202 278 234 L198 332 L162 332Z" fill="url(#paper-back)" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>`;

const WRAP_FRONT = `
    <path d="M282 226 Q226 270 148 252 L172 412 Q180 426 188 412Z" fill="url(#paper-right)" stroke="${INK}" stroke-width="0.85" stroke-linejoin="round"/>
    <path d="M78 226 Q134 278 218 256 L190 412 Q180 426 170 412Z" fill="url(#paper-left)" stroke="${INK}" stroke-width="0.85" stroke-linejoin="round"/>
    <path d="M120 266 L170 396 M238 268 L194 392" stroke="${INK}" stroke-width="0.4" opacity="0.28" fill="none"/>`;

const RIBBON = `
    <path d="M176 326 C164 352 158 372 144 394 L159 389 L165 403 C176 378 182 352 184 328Z" fill="url(#ribbon)" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round"/>
    <path d="M184 326 C196 352 202 372 216 394 L201 389 L195 403 C184 378 178 352 176 328Z" fill="url(#ribbon)" stroke="${INK}" stroke-width="0.7" stroke-linejoin="round"/>
    <path d="M178 318 C156 296 122 298 124 320 C126 340 158 336 178 322Z" fill="url(#ribbon)" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M182 318 C204 296 238 298 236 320 C234 340 202 336 182 322Z" fill="url(#ribbon)" stroke="${INK}" stroke-width="0.8" stroke-linejoin="round"/>
    <path d="M141 319 C152 313 164 315 174 320 M219 319 C208 313 196 315 186 320" stroke="${INK}" stroke-width="0.5" fill="none" stroke-linecap="round" opacity="0.6"/>
    <rect x="170" y="311" width="20" height="17" rx="6" fill="#f0dcae" stroke="${INK}" stroke-width="0.8"/>`;

const SHADOW = '<ellipse cx="180" cy="420" rx="62" ry="7" fill="rgba(38, 65, 90, 0.16)"/>';

// The hero is the big front flower, so it needs a full, round face.
const HERO_KINDS = ['peony', 'rose', 'ranunculus', 'hydrangea', 'anemone', 'poppy'];
const KIND_SCALE = { tulip: 0.86, daisy: 0.92, lily: 1.1 };

function pickKinds(slots) {
    const kinds = shuffled(Object.keys(DRAW).filter((k) => k !== 'blossom'));
    const hero = shuffled(HERO_KINDS)[0];
    const rest = kinds.filter((k) => k !== hero);
    let next = 0;
    const picks = slots.map((slot) => (slot.hero ? hero : rest[next++ % rest.length]));
    const tulip = picks.indexOf('tulip');
    if (tulip >= 0 && !slots[tulip].open) {
        const open = shuffled(slots.map((slot, i) => (slot.open ? i : -1)).filter((i) => i >= 0))[0];
        [picks[tulip], picks[open]] = [picks[open], picks[tulip]];
    }
    return picks;
}

const GUST_COUNT = 5;
const TIER_ORDER = ['filler', 'big', 'medium', 'small', 'tiny'];

export function buildBouquet(host) {
    // Every plant follows one of a few gusts of wind. A gust owns one layer of stems,
    // beneath everything, and one layer of heads per tier, so a stem can never cross
    // a flower and still sways exactly with its own head.
    const gusts = Array.from({ length: GUST_COUNT }, (_, i) => ({
        sway: random(5.6, 8.2),
        delay: round(-i * 1.7),
        stems: '',
        heads: {},
    }));
    const plant = (tier, gust, stemArt, headArt) => {
        const g = gusts[gust % GUST_COUNT];
        g.stems += stemArt;
        g.heads[tier] = (g.heads[tier] || '') + headArt;
    };

    const placed = [];
    const addBloom = (tier, gust, slot, kind, color, stemWidth) => {
        const x = Math.round(slot.x + random(-2, 2));
        const y = Math.round(slot.y + random(-2, 2));
        const size = slot.size * (KIND_SCALE[kind] || 1);
        const turn = kind === 'tulip' ? tipAngle({ x, y }) : Math.round(random(-30, 30));
        plant(tier, gust, stem(x, y, stemWidth), `<g transform="translate(${x} ${y}) rotate(${turn})">${DRAW[kind](size, color)}</g>`);
        placed.push({
            tier,
            x,
            y,
            size,
            color: PALETTES[color].base,
            left: x / VIEW.width,
            top: (y - VIEW.top) / VIEW.height,
        });
    };

    const sprigKinds = shuffled([...SPRIG_KINDS, ...SPRIG_KINDS]);
    SPRIG_SLOTS.forEach((slot, i) => {
        plant('filler', i, stem(slot.x, slot.y, 1.2, slot.lift), SPRIG_ART[sprigKinds[i]](slot));
    });

    const kinds = pickKinds(BLOOM_SLOTS);
    const colors = pickColors(BLOOM_SLOTS.length, 2);
    BLOOM_SLOTS.forEach((slot, i) => addBloom('big', i, slot, kinds[i], colors[i], 2.4));

    const mediumKinds = shuffled(MEDIUM_KINDS);
    const mediumColors = pickColors(MEDIUM_SLOTS.length, 2);
    MEDIUM_SLOTS.forEach((slot, i) => addBloom('medium', i + 2, slot, mediumKinds[i], mediumColors[i], 1.8));

    const smallKinds = shuffled(SMALL_KINDS);
    const smallColors = pickColors(SMALL_SLOTS.length);
    SMALL_SLOTS.forEach((slot, i) => addBloom('small', i * 2, slot, smallKinds[i % smallKinds.length], smallColors[i], 1.3));

    const tinyColors = pickColors(TINY_SLOTS.length, 3);
    TINY_SLOTS.forEach((slot, i) => addBloom('tiny', i * 2 + 1, { ...slot, size: random(7, 9) }, 'blossom', tinyColors[i], 0.9));

    const flowers = [
        ...gusts.map((g) => ({ ...g, art: g.stems })),
        ...TIER_ORDER.flatMap((tier) => gusts.filter((g) => g.heads[tier]).map((g) => ({ ...g, art: g.heads[tier] }))),
    ];

    host.innerHTML = `${paintDefs()}
        ${layer('layer', SHADOW + WRAP_BACK)}
        ${flowers.map((f) => layer('layer flower', f.art)).join('')}
        ${layer('layer', WRAP_FRONT + RIBBON, 'A hand-tied bouquet of mixed flowers, wrapped in pale paper and tied with a cream ribbon')}`;

    // Timing goes through CSSOM so the Content-Security-Policy can forbid inline styles.
    host.querySelectorAll('.flower').forEach((el, i) => {
        el.style.animationDuration = `${flowers[i].sway}s`;
        el.style.animationDelay = `${flowers[i].delay}s`;
    });

    return placed;
}
