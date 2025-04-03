(function() {
    // Function to load data directly
    window.loadBenchmarkData = async function(useSampleData = true) {
      try {
        const baseUrl = window.BASE_URL || '';
        const dataPath = window.USE_SAMPLE_DATA
          ? `${window.BASE_URL}/assets/data/benchmarks.json`
          // ? `${window.BASE_URL}/assets/data/sample_benchmarks.json` //for demo purposes
          : `${window.BASE_URL}/assets/data/benchmarks.json`;
        
        console.log("Direct data loading from:", dataPath);
        
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error("Direct data loading error:", error);
      }
    };
  })();
