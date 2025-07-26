<script>
  let selectedFile = null;

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      selectedFile = file.name;
    } else {
      selectedFile = 'Invalid file. Please upload a CSV.';
    }
  }

  function startBattle() {
    if (!selectedFile || selectedFile.includes('Invalid')) {
      alert('Please upload a valid CSV file first.');
      return;
    }
    alert(`Arena selected: ${selectedFile}\nLet the battle begin!`);
    // Navigate to next step if needed
  }
</script>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: #1c1c1c;
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
    font-size: 6rem;
    margin-bottom: 2rem;
  }

  .upload-label {
    background: linear-gradient(90deg, #00f2fe, #4facfe);
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(0, 242, 254, 0.6), 0 0 40px rgba(79, 172, 254, 0.6);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 1rem;
  }

  .upload-label:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.8), 0 0 50px rgba(79, 172, 254, 0.8);
  }

  input[type="file"] {
    display: none;
  }

  .file-name {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 2rem;
  }

  .start-btn {
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

  .start-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 242, 254, 0.8), 0 0 50px rgba(79, 172, 254, 0.8);
  }
</style>

<main>
  <h1>Choose Your Arena</h1>

  <label class="upload-label">
    Upload CSV File
    <input type="file" accept=".csv" on:change={handleFileChange} />
  </label>

  <div class="file-name">
    {selectedFile || 'No file selected'}
  </div>

  <button class="start-btn" on:click={startBattle}>Start Battle</button>
</main>
