import { buildBouquet } from './bouquet.js';
import { flowerRain, setupCelebration, startAmbientFall, startPetalShed } from './falling.js';
import { initLiquidGlass } from './liquidGlass.js';
import { createMusic } from './music.js';

const bouquet = document.getElementById('bouquet');
const placed = buildBouquet(bouquet);
initLiquidGlass();
startAmbientFall();
startPetalShed(bouquet, placed);
setupCelebration(); // May 9 only for now; pass a button to bring back the toggle

new IntersectionObserver(([entry]) => {
    bouquet.classList.toggle('offscreen', !entry.isIntersecting);
}).observe(bouquet);

// Flower rain: double-click (or double-tap) the title or the footer.
document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.title, .foot p')) flowerRain();
});

const music = createMusic();
const musicToggle = document.getElementById('music-toggle');
musicToggle.addEventListener('click', () => {
    const on = musicToggle.classList.toggle('playing');
    musicToggle.setAttribute('aria-pressed', String(on));
    if (on) music.start(2);
    else music.stop();
});

// Music starts itself once the page has loaded. Browsers hold audio back until
// the first interaction, so that's also when it's released if it was blocked.
const GESTURES = ['pointerup', 'keydown'];
const release = () => {
    music.unlock().then(() => GESTURES.forEach((g) => window.removeEventListener(g, release)));
};
GESTURES.forEach((g) => window.addEventListener(g, release));

const startMusic = () => music.start();
if (document.readyState === 'complete') startMusic();
else window.addEventListener('load', startMusic, { once: true });
