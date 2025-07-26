import { writable } from 'svelte/store';

const isPlaying = writable(false);

let audio;

if (typeof window !== 'undefined') {
  audio = new Audio('/sounds/theme.mp3');
  audio.loop = true;

  isPlaying.subscribe((play) => {
    if (!audio) return;

    if (play) {
      audio.play().catch((e) => {
        console.warn('Autoplay failed:', e);
      });
    } else {
      audio.pause();
    }
  });
}

export { isPlaying };
