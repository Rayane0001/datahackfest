<script>
  import { goto } from '$app/navigation';
  const models = [
    { name: 'Random Forest', image: '/images/random-forest.png' },
    { name: 'Neural Network', image: '/images/neural-network.png' },
    { name: 'K-Nearest Neighbors', image: '/images/knn.png' },
    { name: 'SVM', image: '/images/svm.png' },
    { name: 'Naive Bayes', image: '/images/naive-bayes.png' }
  ];

  let fighterOne = models[0].name;
  let fighterTwo = models[1].name;

  const getImage = (name) => {
    const found = models.find((m) => m.name === name);
    return found ? found.image : '';
  };


  function nextStep() {
    alert(`Fighter 1: ${fighterOne}, Fighter 2: ${fighterTwo}`);
    goto('/arena');
    // You can use goto('/arena') if using SvelteKit's routing
  }
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #1c1c1c;
    height: 100vh;
    color: white;
    font-family: 'Segoe UI', sans-serif;
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
    font-size: 5rem;
    margin-bottom: 2rem;
  }

  .selector-container {
    display: flex;
    gap: 5rem;
    margin-bottom: 3rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .fighter {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  select {
    background: #2b2b2b;
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 1rem;
    margin-top: 1rem;
  }

  .fighter img {
    height:250px;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;
  }

  .fighter img:hover {
    transform: scale(1.05);
  }

  .next-btn {
    position: absolute;
    bottom: 30px;
    background: linear-gradient(90deg, #00f2fe, #4facfe);
    color: white;
    border: none;
    padding: 1rem 2.5rem;
    font-size: 1rem;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.6), 0 0 40px rgba(79, 172, 254, 0.6);
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .next-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.8), 0 0 50px rgba(79, 172, 254, 0.8);
  }
</style>

<main>
  <h1>Select Your Fighters</h1>

  <div class="selector-container">
    <div class="fighter">
      <img src={getImage(fighterOne)} alt="Fighter One" />
      <select bind:value={fighterOne}>
        {#each models as model}
          <option>{model.name}</option>
        {/each}
      </select>
    </div>

    <div class="fighter">
      <img src={getImage(fighterTwo)} alt="Fighter Two" />
      <select bind:value={fighterTwo}>
        {#each models as model}
          <option>{model.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <button class="next-btn" on:click={nextStep}>Next →</button>
</main>
