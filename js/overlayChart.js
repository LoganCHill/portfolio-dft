// js/overlayChart.js
/**
 * Manages the Chart.js instance within the health data modal.
 * This class is responsible for creating, updating, and rendering the line chart
 * based on user selections for different metrics and regions.
 */
export class OverlayChart {
  /**
   * @param {string} canvasId - The ID of the canvas element for the chart.
   * @param {string} metricSelectId - The ID of the metric selection dropdown.
   * @param {string} loadingIndicatorId - The ID of the loading spinner element.
   * @param {MetricFetcher} metricFetcher - An instance of the MetricFetcher class for data retrieval.
   */
  constructor (canvasId, metricSelectId, loadingIndicatorId, metricFetcher) {
    this.canvas = document.getElementById(canvasId)
    this.metricSelect = document.getElementById(metricSelectId)
    this.loadingIndicator = document.getElementById(loadingIndicatorId)
    this.ctx = this.canvas.getContext('2d')
    this.chart = null
    this.currentRegion = null
    this.metricFetcher = metricFetcher

    if (!this.metricFetcher) {
      console.error('[OverlayChart] MetricFetcher instance is required.')
    }

    this._init()
  }

  /**
   * Initializes the chart by adding an event listener to the metric select dropdown.
   * @private
   */
  _init () {
    this.metricSelect.addEventListener('change', () => {
      // When the metric changes, call show without a new region
      // to trigger an update instead of a full recreation.
      this.show()
    })
  }

  /**
   * Fetches data and renders or updates the chart.
   * If a new `region` is provided, it destroys the old chart to ensure a clean re-render.
   * If no `region` is provided, it updates the existing chart with data for the newly selected metric.
   * @param {object} [region] - The region object to display. If omitted, the chart updates for the current region.
   */
  async show (region) {
    // If a new region is passed, update the current region and destroy the old chart.
    // This ensures a full re-render for the new region's context.
    if (region) {
      this.currentRegion = region
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
    }
    if (!this.currentRegion) return

    this.loadingIndicator.style.display = 'block'
    this.canvas.style.display = 'none' // Hide canvas while loading

    try {
      const selectedMetric = this.metricSelect.value
      const data = await this.metricFetcher.fetchOverlayMetrics(
        this.currentRegion.id,
        [selectedMetric]
      )

      const metricData = data.find(d => d.id === selectedMetric)
      if (!metricData) {
        throw new Error(`Data for metric ${selectedMetric} not found.`)
      }

      // If a chart instance exists, update it for a smooth transition.
      // Otherwise, create a new one.
      if (this.chart) {
        this.chart.data.datasets = [
          {
            ...this.chart.data.datasets[0], // Preserve styling
            label: metricData.label,
            data: metricData.values
          }
        ]
        this.chart.update() // Animate to the new data
      } else {
        this._createChart(metricData)
      }
    } catch (error) {
      console.error('[OverlayChart] Failed to fetch or render chart:', error)
      // In a real app, you might want to display an error message in the UI.
      if (this.chart) {
        this.chart.destroy()
        this.chart = null
      }
    } finally {
      this.loadingIndicator.style.display = 'none'
      this.canvas.style.display = 'block' // Show canvas again
    }
  }

  /**
   * Creates a new Chart.js instance. This method defines the chart's configuration,
   * including its type, styling, and tooltip behavior.
   * @param {object} metricData - The data for the first dataset.
   * @private
   */
  _createChart (metricData) {
    this.chart = new Chart(this.ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: metricData.label,
            data: metricData.values,
            borderColor: 'var(--default-theme--accent-colour)',
            backgroundColor: 'rgba(0, 123, 127, 0.2)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'month' },
            title: {
              display: true,
              text: 'Date',
            },
            grid: { color: 'var(--default-theme--border-colour)' },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Value' },
            grid: { color: 'var(--default-theme--border-colour)' }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function (tooltipItems) {
                const date = new Date(tooltipItems[0].parsed.x);
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
              }
            }
          }
        }
      }
    })
  }
}