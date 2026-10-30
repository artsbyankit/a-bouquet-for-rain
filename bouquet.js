/* The bouquet, painted in code: watercolor washes with inked outlines. Every
   stem meets at the point where the ribbon ties them. Each swaying flower is its
   own <svg> layer, so the costly paint filter runs once and the GPU just rotates
   the result. Layouts are fixed, so it looks the same on every visit; rearrange
   it with the BLOOMS and SPRIGS tables. */

const VIEW = { width: 360, height: 438, top: -8 };
const TIE = { x: 180, y: 316 };
const INK = '#26415a';

const PALETTES = {
    white: { tip: '#ffffff', base: '#cfe0ee', deep: '#9dbdd6', core: '#26415a', stamen: '#d9a94f' },
    sky: { tip: '#d8ecf9', base: '#8dbcdf', deep: '#5f96c4', core: '#1f3550', stamen: '#efd9a3' },
    blue: { tip: '#a9cfea', base: '#5b92c1', deep: '#2f6a9f', core: '#f4e2b4', stamen: '#d9a94f' },
    rose: { tip: '#fdf0f4', base: '#eeb9cf', deep: '#cf7fa3', core: '#e7a93c', stamen: '#7d4a63' },
    cream: { tip: '#fffbf2', base: '#f3e2bb', deep: '#dcbc7d', core: '#d98f2b', stamen: '#8a5a1c' },
};

// x, y: bloom centre. size: radius. Listed back to front.
const BLOOMS = [
    { kind: 'daisy', palette: 'cream', x: 58, y: 166, size: 30, turn: 10, sway: 7.6 },
    { kind: 'daisy', palette: 'cream', x: 302, y: 158, size: 30, turn: -8, sway: 7.8 },
    { kind: 'anemone', palette: 'sky', x: 106, y: 86, size: 42, turn: -14, sway: 7.1 },
    { kind: 'peony', palette: 'white', x: 254, y: 82, size: 46, turn: 12, sway: 6.6 },
    { kind: 'peony', palette: 'blue', x: 178, y: 48, size: 44, turn: 0, sway: 6.0 },
    { kind: 'anemone', palette: 'white', x: 98, y: 180, size: 42, turn: 16, sway: 5.8 },
    { kind: 'anemone', palette: 'sky', x: 262, y: 176, size: 42, turn: -12, sway: 6.2 },
    { kind: 'peony', palette: 'rose', x: 180, y: 136, size: 56, turn: 6, sway: 5.4 },
];

// Greenery and baby's breath, tucked in behind the blooms.
const SPRIGS = [
    { kind: 'leaves', x: 22, y: 88, sway: 8.2 },
    { kind: 'leaves', x: 338, y: 84, sway: 8.4 },
    { kind: 'leaves', x: 138, y: 2, sway: 7.4 },
    { kind: 'leaves', x: 228, y: 0, sway: 7.2 },
    { kind: 'breath', x: 56, y: 44, sway: 6.9 },
    { kind: 'breath', x: 308, y: 38, sway: 7.0 },
    { kind: 'breath', x: 18, y: 208, sway: 6.4 },
    { kind: 'breath', x: 342, y: 212, sway: 6.5 },
];

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
};

function curve(x, y) {
    return { cx: TIE.x + (x - TIE.x) * 0.25, cy: (y + TIE.y) / 2 + 26 };
}

function stem(x, y, width) {
    const { cx, cy } = curve(x, y);
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
function foliage({ x, y }) {
    const { cx, cy } = curve(x, y);
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

function breath({ x, y }) {
    const dots = [[0, 0, 3.4], [-9, 6, 2.8], [8, 7, 3], [-3, -9, 2.6], [11, -6, 2.4], [-12, -5, 2.2], [3, 13, 2.4], [-6, 15, 2], [14, 4, 1.9], [-15, 2, 1.8]];
    return dots.map(([dx, dy, r]) => `<path d="M${x} ${y + 20} L${x + dx} ${y + dy}" stroke="#7f9e88" stroke-width="0.5"/><circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#ffffff" stroke="${INK}" stroke-width="0.5"/>`).join('');
}

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
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="warp"/>
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

export function buildBouquet(host) {
    const sprigs = SPRIGS.map((s) => ({
        sway: s.sway,
        art: s.kind === 'leaves' ? stem(s.x, s.y, 1.5) + foliage(s) : stem(s.x, s.y, 1) + breath(s),
    }));
    const blooms = BLOOMS.map((b) => ({
        sway: b.sway,
        art: `${stem(b.x, b.y, 2.4)}<g transform="translate(${b.x} ${b.y}) rotate(${b.turn})">${DRAW[b.kind](b.size, b.palette)}</g>`,
    }));
    const flowers = [...sprigs, ...blooms];

    host.innerHTML = `${paintDefs()}
        ${layer('layer', SHADOW + WRAP_BACK)}
        ${flowers.map((f) => layer('layer flower', f.art)).join('')}
        ${layer('layer', WRAP_FRONT + RIBBON, 'A hand-tied bouquet of blue, white and rose flowers, wrapped in pale paper and tied with a cream ribbon')}`;

    // Timing goes through CSSOM so the Content-Security-Policy can forbid inline styles.
    host.querySelectorAll('.flower').forEach((el, i) => {
        el.style.animationDuration = `${flowers[i].sway}s`;
        el.style.animationDelay = `${round(-i * 0.9)}s`;
    });
}
