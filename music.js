/* Music box, synthesised with WebAudio. Notes are scheduled ahead on the audio
   clock, so the melody keeps steady time even when the tab is in the background. */

const ROOT = 220; // A3
const SCALE = [0, 2, 4, 5, 7, 9, 11];
const BEAT = 0.6; // seconds
const LOOKAHEAD = 2; // seconds of notes queued in advance

// [scale degree, beats]
const SONG = [
    [0, 0.5], [4, 0.5], [7, 0.5], [4, 0.5],
    [9, 0.5], [7, 0.5], [4, 0.5], [0, 0.5],
    [11, 0.5], [9, 0.5], [7, 0.5], [4, 0.5],
    [9, 1], [4, 0.75], [0, 0.25], [2, 1],
];

function frequency(degree) {
    return ROOT * 2 ** ((SCALE[degree % 7] + 12 * Math.floor(degree / 7)) / 12);
}

export function createMusic() {
    let ctx = null;
    let master = null;
    let timer = null;
    let index = 0;
    let nextTime = 0;

    function note(degree, time) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = frequency(degree);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.16, time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.8);
        osc.connect(gain).connect(master);
        osc.start(time);
        osc.stop(time + 1.9);
    }

    function schedule() {
        while (nextTime < ctx.currentTime + LOOKAHEAD) {
            const [degree, beats] = SONG[index % SONG.length];
            note(degree, nextTime);
            nextTime += beats * BEAT;
            index++;
        }
    }

    return {
        start() {
            ctx ||= new (window.AudioContext || window.webkitAudioContext)();
            ctx.resume();
            master = ctx.createGain();
            master.connect(ctx.destination);
            index = 0;
            nextTime = ctx.currentTime + 0.05;
            schedule();
            timer = setInterval(schedule, 500);
        },
        stop() {
            clearInterval(timer);
            // Queued notes can't be recalled, so fade out the bus they play through.
            master.gain.setTargetAtTime(0, ctx.currentTime, 0.08);
            const old = master;
            setTimeout(() => old.disconnect(), 600);
        },
    };
}
