document.addEventListener('DOMContentLoaded', function () {
    const loadData = async () => {
      const response = await fetch('{{site.baseurl}}/data/benchmarks.json');
      const data = await response.json();
      
      renderTimeChart(data);
      renderMemoryChart(data);
      updateBenchmarkList(data);
    };
  
    function renderTimeChart(data) {
      new Chart(document.getElementById('timeChart'), {
        type: 'line',
        data: {
          labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
          datasets: [{
            label: 'Time Difference (PR vs Master)',
            data: data.map(d => d.metrics.time_diff),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Compilation Time Comparison',
              font: { size: 18 }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Time Difference (seconds)' }
            }
          }
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
            backgroundColor: data.map(d => 
              d.metrics.mem_diff >= 0 ? '#27ae60' : '#e74c3c'
            ),
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Memory Usage Comparison',
              font: { size: 18 }
            }
          },
          scales: {
            y: {
              title: { display: true, text: 'Memory Difference (MB)' }
            }
          }
        }
      });
    }
  
    function updateBenchmarkList(data) {
      const container = document.getElementById('benchmarks');
      container.innerHTML = data.map(d => `
        <div class="benchmark-card">
          <div class="metric">
            <span>PR #${d.pr.number}</span>
            <a href="${d.pr.url}" class="badge">
              ${d.pr.title}
            </a>
          </div>
          <div class="metric">
            <span>Time Difference</span>
            <span class="badge ${d.metrics.time_diff >= 0 ? 'badge-danger' : 'badge-success'}">
              ${d.metrics.time_diff.toFixed(2)}s (${d.metrics.time_pct})
            </span>
          </div>
          <div class="metric">
            <span>Memory Difference</span>
            <span class="badge ${d.metrics.mem_diff >= 0 ? 'badge-danger' : 'badge-success'}">
              ${d.metrics.mem_diff.toFixed(1)}MB (${d.metrics.mem_pct})
            </span>
          </div>
          <small class="text-muted">
            ${new Date(d.timestamp).toLocaleString()}
          </small>
        </div>
      `).join('');
    }
  
    loadData();
  });
