export const SLOWEST_MUSIC_RATE = 0.01;
export const SLOWDOWN_MUSIC_DURATION = 1000;
export const DEFAULT_VOLUME = 0.5;

export function playTrack(scene, soundUrl, track) {

    if (!scene.cache.audio.get(soundUrl)) {
        scene.load.audio(soundUrl, soundUrl);
        const args = arguments;
        scene.load.once('filecomplete', () => playTrack(...args));
        scene.load.start();
    } else {
        const player = (sound, idx, notes) => {
            sound.play({
                volume: track.volume,
                detune: (NOTES[notes[idx]] - 1) * 100
            })

            scene.time.addEvent({
                delay: track.speed,
                callback: () => player(sound, (idx + 1) % notes.length, notes),
            });
        }

        player(scene.sound.add(soundUrl), 0, track.notes.split(' '));
    }
}

const NOTES = {
    'c': 1,
    'c#': 2,
    'd': 3,
    'd#': 4,
    'e': 5,
    'f': 6,
    'f#': 7,
    'g': 8,
    'g#': 9,
    'a': 10,
    'a#': 11,
    'b': 12,
}

export const BACKGROUND_TRACK = {
    speed: 1600,
    minSpeed: 1600,
    volume: 0.05,
    notes: 'g c d# c',
};
