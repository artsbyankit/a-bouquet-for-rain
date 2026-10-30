import { buildBouquet } from './bouquet.js';
import { flowerRain, setupCelebration, startAmbientFall } from './falling.js';
import { initLiquidGlass } from './liquidGlass.js';
import { createMusic } from './music.js';

buildBouquet(document.getElementById('bouquet'));
initLiquidGlass();
startAmbientFall();
setupCelebration(document.getElementById('cake-toggle'));

// Flower rain: double-click (or double-tap) the title or the footer.
document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.title, .foot p')) flowerRain();
});

const music = createMusic();
const musicToggle = document.getElementById('music-toggle');
musicToggle.addEventListener('click', () => {
    const on = musicToggle.classList.toggle('playing');
    musicToggle.setAttribute('aria-pressed', String(on));
    if (on) music.start();
    else music.stop();
});
