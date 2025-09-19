// js/healthCardComponent.js

/**
 * Represents a single summary card in the "Public Health Tracker".
 */
export class HealthCardComponent {
  constructor(container, regionData, onCardClick) {
    this.container = container;
    this.region = regionData;
    this.onCardClick = onCardClick;
    this.element = null;
    this.chart = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'health-card';
    this.element.innerHTML = `
      <h5 class="health-card-title">${this.region.name}</h5>
      <p class="health-card-summary">${this.region.summary}</p>
      <div class="health-card-chart-container">
        <canvas></canvas>
      </div>
      <div class="health-card-footer">Click for details</div>
    `;

    this.element.addEventListener('click', () => {
      this.onCardClick(this.region);
    });

    const canvas = this.element.querySelector('canvas');
    this._renderSummaryChart(canvas);
    
    this.container.appendChild(this.element);
  }

  _renderSummaryChart(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const summaryData = this.region.summaryData;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: summaryData.labels,
        datasets: [{
          label: 'Trend',
          data: summaryData.values,
          borderColor: 'rgba(0, 123, 127, 0.5)',
          pointRadius: 0,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: false },
          y: { display: false }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        animation: false
      }
    });
  }
}