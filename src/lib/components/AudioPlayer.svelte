<script>
  import { isPlaying } from '$lib/stores/audio';

  function togglePlay() {
    isPlaying.update(p => !p);
  }
</script>

<style>
  .audio-toggle {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid #4facfe;
    border-radius: 10px;
    padding: 0.5rem 1rem;
    backdrop-filter: blur(5px);
    cursor: pointer;
    font-size: 0.9rem;
    z-index: 1000;
    box-shadow: 0 0 10px #4facfe;
    transition: transform 0.2s ease;
  }

  .audio-toggle:hover {
    transform: scale(1.05);
  }
</style>

<button class="audio-toggle" on:click={togglePlay}>
  {$isPlaying ? '🔊 Stop Music' : '🎵 Play Music'}
</button>
