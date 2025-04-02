---
layout: default
---

## Latest Benchmarks

<div id="benchmarks">
  {% for benchmark in site.data.benchmarks %}
  <div class="benchmark-item">
    <h3>
      <a href="{{ benchmark.pr.url }}">PR #{{ benchmark.pr.number }}</a>: 
      {{ benchmark.pr.title }}
    </h3>
    <p>
      <strong>Time Difference:</strong> {{ benchmark.metrics.time_diff }}s ({{ benchmark.metrics.time_pct }})<br>
      <strong>Memory Difference:</strong> {{ benchmark.metrics.mem_diff }}MB ({{ benchmark.metrics.mem_pct }})
    </p>
    <small>{{ benchmark.timestamp | date: "%Y-%m-%d %H:%M" }}</small>
  </div>
  {% endfor %}
</div>
