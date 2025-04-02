---
layout: default
---

<div class="header">
  <div class="container">
    <h1>D Compiler Benchmarks</h1>
    <p>Performance metrics and comparison for D compiler pull requests</p>
  </div>
</div>

<div class="container">
  {% include charts.html %}
  
  <div class="benchmarks-section">
    <div class="section-header">
      <h2>Recent Benchmarks</h2>
      <div class="view-options">
        <button class="view-btn active" data-view="grid" title="Grid View">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z"/>
          </svg>
        </button>
        <button class="view-btn" data-view="list" title="List View">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4h18v4H3V4zm0 6h18v4H3v-4zm0 6h18v4H3v-4z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="benchmark-wrapper" id="benchmarks">
      <!-- Benchmark cards will be inserted here by JavaScript -->
    </div>
  </div>
</div>

<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-links">
        <a href="https://dlang.org" class="footer-link">D Language</a>
        <a href="https://github.com/dlang/dmd" class="footer-link">DMD Repository</a>
        <a href="https://github.com/dlang/dmd/pulls" class="footer-link">Pull Requests</a>
      </div>
      <div class="copyright">
        © 2025 D Language Foundation
      </div>
    </div>
  </div>
</footer>
