<script>
  import { goto } from '$app/navigation';

  function startBattle() {
    goto('/select');
  }
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    background: #1c1c1c;
    color: #ffffff;
    font-family: 'Segoe UI', sans-serif;
    overflow: hidden;
    position: relative;
  }

  h1 {
    font-family: 'Bitcount', sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    font-variation-settings:
      "slnt" 0,
      "CRSV" 0.5,
      "ELSH" 0,
      "ELXP" 0;
    font-size: 10rem;
    margin-bottom: 8rem;
  }

  p {
    max-width: 900px;
    font-size: 0.7rem;
    margin-bottom: 2rem;
    opacity: 0.85;
    text-align: center;
  }

  button {
    background: linear-gradient(90deg, #00f2fe, #4facfe);
    color: white;
    border: none;
    padding: 1rem 4rem;
    font-size: 1.1rem;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.6), 0 0 40px rgba(79, 172, 254, 0.6);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    z-index: 10;
  }

  button:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.8), 0 0 50px rgba(79, 172, 254, 0.8);
  }

  .bottom-image {
    position: absolute;
    bottom: 0;
    left: 0;
    width: auto;
    height: 300px;
    opacity: 0.9;
    pointer-events: none;
    z-index: 1;
  }
</style>

<main>
  <h1>Data Arena</h1>
  <button on:click={startBattle}>Fight</button>

  <!-- Image from static folder -->
  <img src="/img.png" alt="Arena" class="bottom-image" />
</main>
