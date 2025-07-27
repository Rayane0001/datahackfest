// @file src/lib/stores/audioPlayer.ts

let currentMusic: HTMLAudioElement | null = null;
let soundEffects: HTMLAudioElement[] = [];

// Detect if it's music based on file path/name
function isMusic(src: string): boolean {
  const musicExtensions = ['.mp3', '.ogg', '.wav'];
  const musicKeywords = ['music', 'theme', 'background', 'bgm', 'ambient'];
  const musicFiles = ['fight.mp3']; // Add specific music files here

  const srcLower = src.toLowerCase();

  // Check for specific music files
  if (musicFiles.some(file => srcLower.includes(file))) {
    return true;
  }

  // Check for music keywords in path
  if (musicKeywords.some(keyword => srcLower.includes(keyword))) {
    return true;
  }

  // Check for infinite loop (usually music)
  return false;
}

export function playAudio(src: string, infinite = false) {
  try {
    const isMusicFile = isMusic(src) || infinite;

    if (isMusicFile) {
      // Handle music - stop previous music
      if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
      }

      currentMusic = new Audio(src);
      currentMusic.loop = infinite;
      currentMusic.volume = 0.4; // Lower volume for music

      currentMusic.play().catch(err => {
        console.warn('Music failed to play:', err);
      });

      // Clean up when music ends (if not looping)
      if (!infinite) {
        currentMusic.addEventListener('ended', () => {
          if (currentMusic) {
            currentMusic = null;
          }
        });
      }
    } else {
      // Handle sound effects - don't interrupt music
      const soundEffect = new Audio(src);
      soundEffect.volume = 0.6; // Higher volume for sound effects

      soundEffect.play().catch(err => {
        console.warn('Sound effect failed to play:', err);
      });

      // Add to active sound effects array
      soundEffects.push(soundEffect);

      // Clean up when sound effect ends
      soundEffect.addEventListener('ended', () => {
        const index = soundEffects.indexOf(soundEffect);
        if (index > -1) {
          soundEffects.splice(index, 1);
        }
      });

      // Limit concurrent sound effects to prevent audio chaos
      if (soundEffects.length > 5) {
        const oldestEffect = soundEffects.shift();
        if (oldestEffect) {
          oldestEffect.pause();
          oldestEffect.currentTime = 0;
        }
      }
    }
  } catch (e) {
    console.error('Audio error:', e);
  }
}

export function stopAudio() {
  // Stop current music
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }
}

export function stopAllAudio() {
  // Stop music
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
  }

  // Stop all sound effects
  soundEffects.forEach(effect => {
    effect.pause();
    effect.currentTime = 0;
  });
  soundEffects = [];
}

export function setMusicVolume(volume: number) {
  if (currentMusic) {
    currentMusic.volume = Math.max(0, Math.min(1, volume));
  }
}

export function setSoundEffectVolume(volume: number) {
  soundEffects.forEach(effect => {
    effect.volume = Math.max(0, Math.min(1, volume));
  });
}

// Advanced: Play sound with cooldown to prevent spam
const soundCooldowns = new Map<string, number>();

export function playAudioWithCooldown(src: string, cooldownMs = 200, infinite = false) {
  const now = Date.now();
  const lastPlayed = soundCooldowns.get(src) || 0;

  if (now - lastPlayed >= cooldownMs) {
    soundCooldowns.set(src, now);
    playAudio(src, infinite);
  }
}

// Advanced: Fade out current music and fade in new music
export function fadeToMusic(src: string, infinite = true, fadeDurationMs = 1000) {
  if (currentMusic) {
    const oldMusic = currentMusic;
    const originalVolume = oldMusic.volume;
    const fadeSteps = 20;
    const stepDuration = fadeDurationMs / fadeSteps;
    let currentStep = 0;

    const fadeOut = setInterval(() => {
      currentStep++;
      oldMusic.volume = originalVolume * (1 - currentStep / fadeSteps);

      if (currentStep >= fadeSteps) {
        clearInterval(fadeOut);
        oldMusic.pause();
        oldMusic.currentTime = 0;

        // Start new music
        playAudio(src, infinite);

        // Fade in new music
        if (currentMusic) {
          currentMusic.volume = 0;
          let fadeInStep = 0;
          const fadeIn = setInterval(() => {
            if (currentMusic) {
              fadeInStep++;
              currentMusic.volume = 0.4 * (fadeInStep / fadeSteps);

              if (fadeInStep >= fadeSteps) {
                clearInterval(fadeIn);
              }
            } else {
              clearInterval(fadeIn);
            }
          }, stepDuration);
        }
      }
    }, stepDuration);
  } else {
    // No current music, just play new one
    playAudio(src, infinite);
  }
}