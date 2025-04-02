document.addEventListener('DOMContentLoaded', function() {
    fetch('{{ site.baseurl }}/data/benchmarks.json')
      .then(response => response.json())
      .then(data => {
        renderTimeChart(data);
        renderMemoryChart(data);
      });
  
    function renderTimeChart(data) {
      new Chart(document.getElementById('timeChart'), {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
          datasets: [{
            label: 'Time Difference (PR - Master)',
            data: data.map(d => d.metrics.time_diff),
            borderColor: '#e74c3c',
            tension: 0.1
          }]
        }
      });
    }
  
    function renderMemoryChart(data) {
      new Chart(document.getElementById('memoryChart'), {
        type: 'bar',
        data: {
          labels: data.map(d => `PR #${d.pr.number}`),
          datasets: [{
            label: 'Memory Difference (MB)',
            data: data.map(d => d.metrics.mem_diff),
            backgroundColor: '#3498db'
          }]
        }
      });
    }
  });
