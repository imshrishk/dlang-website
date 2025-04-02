document.addEventListener('DOMContentLoaded', function() {
    // Chart.js global defaults
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = "#64748b";
    Chart.defaults.elements.line.tension = 0.3;
    Chart.defaults.elements.point.radius = 3;
    Chart.defaults.elements.point.hoverRadius = 5;
    
    // DOM Elements
    const timeChartEl = document.getElementById('timeChart');
    const memoryChartEl = document.getElementById('memoryChart');
    const benchmarksEl = document.getElementById('benchmarks');
    const timeChartLoader = document.getElementById('timeChartLoader');
    const memoryChartLoader = document.getElementById('memoryChartLoader');
    const rangeButtons = document.querySelectorAll('.range-btn');
    
    // State
    let allData = [];
    let timeChart, memoryChart;
    let currentRange = 7; // Default to 7 days
    
    // Initialize
    init();
    
    async function init() {
      try {
        await loadData();
        setupEventListeners();
      } catch (error) {
        handleError(error);
      }
    }
    
    async function loadData() {
      try {
        showLoaders();
        
        // Fix: Use a direct path to the data file instead of dynamically constructing it
        const response = await fetch('/assets/data/benchmarks.json');
        
        if (!response.ok) {
          // If the direct path fails, try a fallback
          const fallbackResponse = await fetch('_data/benchmarks.json');
          
          if (!fallbackResponse.ok) {
            throw new Error(`Failed to load data: ${response.status} ${response.statusText}`);
          }
          
          allData = await fallbackResponse.json();
        } else {
          allData = await response.json();
        }
        
        // If no data available, use the hardcoded sample data
        if (!allData || !Array.isArray(allData) || allData.length === 0) {
          console.log('No data available, using sample data');
          allData = getSampleData();
        }
        
        // Extract relevant data from the structure
        allData = allData.filter(item => item && typeof item === 'object' && item.timestamp);
        
        // Sort data by timestamp (newest first for the list view)
        allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Create visualizations
        createCharts();
        updateBenchmarkList();
        
        hideLoaders();
      } catch (error) {
        console.error('Data loading error:', error);
        // Use sample data as fallback
        allData = getSampleData();
        createCharts();
        updateBenchmarkList();
        hideLoaders();
      }
    }
    
    function getSampleData() {
      // Provide sample data in case of loading failures
      return [
        {
          "timestamp": "2025-04-02T19:29:08.283Z",
          "pr": {
            "number": 27,
            "title": "Check 27.1",
            "url": "https://github.com/imshrishk/dmd/pull/27",
            "commit": "b72c2d19158c5970f09509864dd7075cdd4c60d6"
          },
          "metrics": {
            "pr_time": 122.741,
            "master_time": 122.906,
            "pr_memory": 15192.5,
            "master_memory": 15156.5,
            "time_diff": -0.165,
            "time_pct": "-0.13%",
            "mem_diff": 36,
            "mem_pct": "0.24%"
          }
        },
        {
          "timestamp": "2025-03-30T14:15:22.283Z",
          "pr": {
            "number": 26,
            "title": "Improve GC algorithm",
            "url": "https://github.com/imshrishk/dmd/pull/26",
            "commit": "a54e2b18c4d8a960d34509864dd7075cdd4c60b2"
          },
          "metrics": {
            "pr_time": 118.542,
            "master_time": 122.906,
            "pr_memory": 14890.2,
            "master_memory": 15156.5,
            "time_diff": -4.364,
            "time_pct": "-3.55%",
            "mem_diff": -266.3,
            "mem_pct": "-1.76%"
          }
        },
        {
          "timestamp": "2025-03-25T09:47:12.283Z",
          "pr": {
            "number": 25,
            "title": "Fix memory leak in parser",
            "url": "https://github.com/imshrishk/dmd/pull/25",
            "commit": "c93b7a45a1204bd883457c14dd9b32aef8dd62a1"
          },
          "metrics": {
            "pr_time": 124.123,
            "master_time": 122.906,
            "pr_memory": 14950.8,
            "master_memory": 15156.5,
            "time_diff": 1.217,
            "time_pct": "0.99%",
            "mem_diff": -205.7,
            "mem_pct": "-1.36%"
          }
        }
      ];
    }
    
    function setupEventListeners() {
      // Time range selector buttons
      rangeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Remove active class from all buttons
          rangeButtons.forEach(b => b.classList.remove('active'));
          // Add active class to clicked button
          btn.classList.add('active');
          
          // Update range and refresh charts
          const range = btn.dataset.range;
          currentRange = range === 'all' ? null : parseInt(range);
          updateCharts();
        });
      });
      
      // View toggle buttons
      const viewButtons = document.querySelectorAll('.view-btn');
      if (viewButtons.length > 0) {
        viewButtons.forEach(btn => {
          btn.addEventListener('click', () => {
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            const benchmarkWrapper = document.querySelector('.benchmark-wrapper');
            if (benchmarkWrapper) {
              benchmarkWrapper.className = `benchmark-wrapper ${view}-view`;
            }
          });
        });
      }
    }
    
    function createCharts() {
      // Create Time Chart
      timeChart = new Chart(timeChartEl, {
        type: 'line',
        data: getTimeChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  const date = new Date(tooltipItems[0].raw.timestamp);
                  return `PR #${tooltipItems[0].raw.pr.number} - ${date.toLocaleDateString()}`;
                },
                label: function(context) {
                  const value = context.raw.time_diff;
                  return `Time Diff: ${value.toFixed(2)}s (${context.raw.time_pct})`;
                },
                afterLabel: function(context) {
                  return `"${context.raw.pr.title}"`;
                }
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'MMM d, yyyy'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Time Difference (seconds)'
              },
              grid: {
                color: '#e2e8f0'
              }
            }
          }
        }
      });
      
      // Create Memory Chart
      memoryChart = new Chart(memoryChartEl, {
        type: 'bar',
        data: getMemoryChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  const date = new Date(tooltipItems[0].raw.timestamp);
                  return `PR #${tooltipItems[0].raw.pr.number} - ${date.toLocaleDateString()}`;
                },
                label: function(context) {
                  const value = context.raw.mem_diff;
                  const sign = value >= 0 ? '+' : '';
                  return `Memory Diff: ${sign}${value.toFixed(1)}MB (${context.raw.mem_pct})`;
                },
                afterLabel: function(context) {
                  return `"${context.raw.pr.title}"`;
                }
              }
            },
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'MMM d, yyyy'
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Memory Difference (MB)'
              },
              grid: {
                color: '#e2e8f0'
              }
            }
          }
        }
      });
    }
    
    function updateCharts() {
      // Get filtered data based on time range
      const filteredData = getFilteredData();
      
      // Update Time Chart
      timeChart.data = getTimeChartData(filteredData);
      timeChart.update();
      
      // Update Memory Chart
      memoryChart.data = getMemoryChartData(filteredData);
      memoryChart.update();
    }
    
    function getFilteredData() {
      if (!currentRange) {
        return [...allData]; // Return all data
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - currentRange);
      
      return allData.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= cutoffDate;
      });
    }
    
    function getTimeChartData(data = getFilteredData()) {
      // Sort data by timestamp (oldest first for the charts)
      const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      return {
        datasets: [
          {
            label: 'Time Difference',
            data: sortedData.map(d => ({
              x: new Date(d.timestamp),
              y: d.metrics.time_diff,
              timestamp: d.timestamp,
              pr: d.pr,
              time_diff: d.metrics.time_diff,
              time_pct: d.metrics.time_pct
            })),
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
            borderWidth: 2,
            fill: true
          }
        ]
      };
    }
    
    function getMemoryChartData(data = getFilteredData()) {
      // Sort data by timestamp (oldest first for the charts)
      const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      return {
        datasets: [
          {
            label: 'Memory Difference',
            data: sortedData.map(d => ({
              x: new Date(d.timestamp),
              y: d.metrics.mem_diff,
              timestamp: d.timestamp,
              pr: d.pr,
              mem_diff: d.metrics.mem_diff,
              mem_pct: d.metrics.mem_pct
            })),
            backgroundColor: sortedData.map(d => 
              d.metrics.mem_diff >= 0 ? '#ef4444' : '#10b981'
            )
          }
        ]
      };
    }
    
    function updateBenchmarkList() {
      if (!benchmarksEl) return;
      
      // Always show all benchmarks in the list view, sorted by date (newest first)
      if (allData.length === 0) {
        benchmarksEl.innerHTML = `
          <div class="empty-state">
            <h3>No benchmark data available</h3>
            <p>There are currently no benchmark results to display. Check back later or contact the administrator.</p>
          </div>
        `;
        return;
      }
      
      benchmarksEl.innerHTML = allData.map(d => {
        // Determine badge classes based on metrics
        const timeBadgeClass = d.metrics.time_diff <= 0 ? 'badge-success' : 'badge-danger';
        const memBadgeClass = d.metrics.mem_diff <= 0 ? 'badge-success' : 'badge-danger';
        
        // Create trend indicators
        const timeIcon = d.metrics.time_diff > 0 
          ? '<span class="trend-icon trend-up"></span>' 
          : '<span class="trend-icon trend-down"></span>';
        
        const memIcon = d.metrics.mem_diff > 0 
          ? '<span class="trend-icon trend-up"></span>' 
          : '<span class="trend-icon trend-down"></span>';
        
        // Format timestamp
        const date = new Date(d.timestamp);
        const formattedDate = date.toLocaleString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        return `
          <div class="benchmark-card">
            <div class="benchmark-header">
              <span class="pr-number">PR #${d.pr.number}</span>
              <a href="${d.pr.url}" class="pr-link" target="_blank">${d.pr.title}</a>
            </div>
            
            <div class="metric">
              <span class="metric-name">Compilation Time</span>
              <span class="badge ${timeBadgeClass}">
                ${timeIcon} ${d.metrics.time_diff.toFixed(2)}s (${d.metrics.time_pct})
              </span>
            </div>
            
            <div class="metric">
              <span class="metric-name">Memory Usage</span>
              <span class="badge ${memBadgeClass}">
                ${memIcon} ${d.metrics.mem_diff.toFixed(1)}MB (${d.metrics.mem_pct})
              </span>
            </div>
            
            <span class="timestamp">${formattedDate}</span>
          </div>
        `;
      }).join('');
    }
    
    function showLoaders() {
      if (timeChartLoader) timeChartLoader.style.display = 'flex';
      if (memoryChartLoader) memoryChartLoader.style.display = 'flex';
    }
    
    function hideLoaders() {
      if (timeChartLoader) timeChartLoader.style.display = 'none';
      if (memoryChartLoader) memoryChartLoader.style.display = 'none';
    }
    
    function handleError(error) {
      console.error('Error:', error);
      
      // Display error message in charts
      if (timeChartEl) {
        timeChartEl.style.display = 'none';
        if (timeChartEl.parentNode) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.innerHTML = `
            <p>Failed to load chart data</p>
            <small>${error.message}</small>
          `;
          timeChartEl.parentNode.appendChild(errorMsg);
        }
      }
      
      if (memoryChartEl) {
        memoryChartEl.style.display = 'none';
        if (memoryChartEl.parentNode) {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'error-message';
          errorMsg.innerHTML = `
            <p>Failed to load chart data</p>
            <small>${error.message}</small>
          `;
          memoryChartEl.parentNode.appendChild(errorMsg);
        }
      }
      
      // Display error in benchmark list
      if (benchmarksEl) {
        benchmarksEl.innerHTML = `
          <div class="empty-state">
            <h3>Error Loading Data</h3>
            <p>${error.message}</p>
            <p>Please try refreshing the page or contact the administrator if the problem persists.</p>
          </div>
        `;
      }
    }
  });
