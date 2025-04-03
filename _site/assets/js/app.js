document.addEventListener("DOMContentLoaded", function () {
    // Fix date-fns adapter setup
    if (typeof dateFns === 'undefined') {
      window.dateFns = window.dateFns || {};
      window.dateFns.format = function (date, format) {
        return new Date(date).toLocaleDateString();
      };
    }
  
    // Fix Chart.js registration - removed the problematic date-fns adapter registration
    if (typeof Chart !== 'undefined') {
      try {
        // Fixed by removing the problematic adapter registration
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = "#64748b";
        Chart.defaults.elements.line.tension = 0.3;
        Chart.defaults.elements.point.radius = 3;
        Chart.defaults.elements.point.hoverRadius = 5;
      } catch (error) {
        document.getElementById("chartError").innerHTML =
          `<div class="error-message">Failed to initialize charts: ${error.message}</div>`;
        document.getElementById("chartError").style.display = "block";
      }
    } else {
      document.getElementById("chartError").innerHTML =
        '<div class="error-message">Chart.js library failed to load. Please refresh the page or check your connection.</div>';
      document.getElementById("chartError").style.display = "block";
    }
  
    const timeChartEl = document.getElementById("timeChart");
    const memoryChartEl = document.getElementById("memoryChart");
    const benchmarksEl = document.getElementById("benchmarks");
    const timeChartLoader = document.getElementById("timeChartLoader");
    const memoryChartLoader = document.getElementById("memoryChartLoader");
    const rangeButtons = document.querySelectorAll(".range-btn");
    let allData = [];
    let timeChart, memoryChart;
    let currentRange = 7;
  
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
        const dataPath = window.USE_SAMPLE_DATA
          ? `${window.BASE_URL}/assets/data/benchmarks.json`
          // ? `${window.BASE_URL}/assets/data/sample_benchmarks.json` //for demo purposes
          : `${window.BASE_URL}/assets/data/benchmarks.json`;
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }
        const rawData = await response.text();
        allData = JSON.parse(rawData);
        if (!Array.isArray(allData)) {
          throw new Error("Data is not an array");
        }
        allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (timeChart) timeChart.destroy();
        if (memoryChart) memoryChart.destroy();
        createCharts();
        updateBenchmarkList();
        hideLoaders();
      } catch (error) {
        hideLoaders();
        handleError(error);
      }
    }
  
    function setupEventListeners() {
      rangeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          rangeButtons.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const range = btn.dataset.range;
          currentRange = range === "all" ? null : parseInt(range);
          updateCharts();
        });
      });
    }
  
    function createCharts() {
      // Create Time Chart
      timeChart = new Chart(timeChartEl, {
        type: "line",
        data: getTimeChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  const date = new Date(tooltipItems[0].raw.timestamp);
                  return `PR #${tooltipItems[0].raw.pr.number} - ${date.toLocaleDateString()}`;
                },
                label: function (context) {
                  const value = context.raw.time_diff;
                  return `Time Diff: ${value.toFixed(2)}s (${context.raw.time_pct})`;
                },
                afterLabel: function (context) {
                  return `"${context.raw.pr.title}"`;
                },
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
                tooltipFormat: "MMM d, yyyy",
              },
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Time Difference (seconds)",
              },
              grid: {
                color: "#e2e8f0",
              },
            },
          },
        },
      });
  
      // Create Memory Chart
      memoryChart = new Chart(memoryChartEl, {
        type: "bar",
        data: getMemoryChartData(),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function (tooltipItems) {
                  const date = new Date(tooltipItems[0].raw.timestamp);
                  return `PR #${tooltipItems[0].raw.pr.number} - ${date.toLocaleDateString()}`;
                },
                label: function (context) {
                  const value = context.raw.mem_diff;
                  const sign = value >= 0 ? "+" : "";
                  return `Memory Diff: ${sign}${value.toFixed(1)}MB (${context.raw.mem_pct})`;
                },
                afterLabel: function (context) {
                  return `"${context.raw.pr.title}"`;
                },
              },
            },
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
              },
              title: {
                display: true,
                text: "Date",
              },
              grid: {
                color: "#e2e8f0",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Memory Difference (MB)",
              },
              grid: {
                color: "#e2e8f0",
              },
            },
          },
        },
      });
  
      timeChart.update();
      memoryChart.update();
    }
  
    function updateCharts() {
      const filteredData = getFilteredData();
      timeChart.data = getTimeChartData(filteredData);
      timeChart.update();
      memoryChart.data = getMemoryChartData(filteredData);
      memoryChart.update();
    }
  
    function getFilteredData() {
      if (!currentRange) {
        return [...allData];
      }
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - currentRange);
      return allData.filter((item) => new Date(item.timestamp) >= cutoffDate);
    }
  
    function getTimeChartData(data = getFilteredData()) {
      const sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );
      return {
        datasets: [
          {
            label: "Time Difference",
            data: sortedData.map((d) => ({
              x: new Date(d.timestamp),
              y: d.metrics.time_diff,
              timestamp: d.timestamp,
              pr: d.pr,
              time_diff: d.metrics.time_diff,
              time_pct: d.metrics.time_pct,
            })),
            borderColor: "#0ea5e9",
            backgroundColor: "rgba(14, 165, 233, 0.1)",
            borderWidth: 2,
            fill: true,
          },
        ],
      };
    }
  
    function getMemoryChartData(data = getFilteredData()) {
      const sortedData = [...data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );
      return {
        datasets: [
          {
            label: "Memory Difference",
            data: sortedData.map((d) => ({
              x: new Date(d.timestamp),
              y: d.metrics.mem_diff,
              timestamp: d.timestamp,
              pr: d.pr,
              mem_diff: d.metrics.mem_diff,
              mem_pct: d.metrics.mem_pct,
            })),
            backgroundColor: sortedData.map((d) =>
              d.metrics.mem_diff >= 0 ? "#ef4444" : "#10b981",
            ),
          },
        ],
      };
    }
  
    function updateBenchmarkList() {
      if (!benchmarksEl) return;
      benchmarksEl.innerHTML = allData
        .map((d) => {
          if (!d.pr || !d.metrics) return "";
          const timeDiff = d.metrics.time_diff.toFixed(2);
          const memDiff = d.metrics.mem_diff.toFixed(1);
          return `
          <div class="benchmark-card">
            <div class="benchmark-header">
              <span class="pr-number">PR #${d.pr.number}</span>
              <a href="${d.pr.url}" class="pr-link" target="_blank" rel="noopener">
                ${d.pr.title}
              </a>
            </div>
            <div class="metric">
              <span class="metric-name">Compilation Time</span>
              <span class="badge ${d.metrics.time_diff <= 0 ? "badge-success" : "badge-danger"}">
                ${timeDiff}s (${d.metrics.time_pct})
              </span>
            </div>
            <div class="metric">
              <span class="metric-name">Memory Usage</span>
              <span class="badge ${d.metrics.mem_diff <= 0 ? "badge-success" : "badge-danger"}">
                ${memDiff}MB (${d.metrics.mem_pct})
              </span>
            </div>
            <span class="timestamp">
              ${new Date(d.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        `;
        })
        .join("");
    }
  
    function showLoaders() {
      if (timeChartLoader) timeChartLoader.style.display = "flex";
      if (memoryChartLoader) memoryChartLoader.style.display = "flex";
    }
  
    function hideLoaders() {
      if (timeChartLoader) timeChartLoader.style.display = "none";
      if (memoryChartLoader) memoryChartLoader.style.display = "none";
    }
  
    function handleError(error) {
      console.error("Error loading data:", error);
      const errorHTML = `
        <div class="error-message">
          <p>Failed to load data: ${error.message}</p>
          <small>Check console for details</small>
        </div>
      `;
      const chartErrorElem = document.getElementById("chartError");
      if (chartErrorElem) {
        chartErrorElem.innerHTML = errorHTML;
        chartErrorElem.style.display = "block";
      }
      if (timeChartLoader) {
        timeChartLoader.innerHTML = `<p>Failed to load: ${error.message}</p>`;
        timeChartLoader.classList.add("failed");
      }
      if (memoryChartLoader) {
        memoryChartLoader.innerHTML = `<p>Failed to load: ${error.message}</p>`;
        memoryChartLoader.classList.add("failed");
      }
      if (benchmarksEl) {
        benchmarksEl.innerHTML = `
          <div class="empty-state">
            <h3>Data Load Failed</h3>
            <p>${error.message}</p>
            <button onclick="window.location.reload()">Refresh Page</button>
          </div>
        `;
      }
    }
  });
