let currentAudio: HTMLAudioElement | null = null;

export function playAudio(src: string, infinite = false) {
  try {
    // Stop previous audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    // Load and play new audio
    currentAudio = new Audio(src);
    currentAudio.loop = infinite;       // 🔁 play infinitely if true
    currentAudio.volume = 0.6;

    currentAudio.play().catch(err => {
      console.warn('Audio failed to play:', err);
    });
  } catch (e) {
    console.error('Audio error:', e);
  }
}

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}
