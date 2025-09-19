// js/healthcard.js
// Modal chart orchestration using OverlayChart

import { OverlayChart } from './overlayChart.js'
import { fetchOverlayMetrics } from './metricFetcher.js'

// Shared chart instance
let modalChartInstance

// Default state and metric
let currentRegion = 'PA'
window.currentMetric = 'hospitalizations'

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const regionSelect = document.getElementById('regionSelect')
  const modalCanvas = document.getElementById('modalChart')
  const metricSelect = document.getElementById('modalMetricSelect')

  if (!modalCanvas || !metricSelect || !regionSelect) {
    console.warn('Modal chart setup skipped: missing DOM elements')
  } else {
    // Spinner controls
    function showSpinner () {
      document.getElementById('chartLoading').style.display = 'block'
      modalCanvas.style.display = 'none'
    }
    function hideSpinner () {
      document.getElementById('chartLoading').style.display = 'none'
      modalCanvas.style.display = 'block'
    }

    // Modal controls
    function openModal () {
      document.getElementById('healthModal').style.display = 'block'
      metricSelect.value = window.currentMetric // Sync dropdown
      renderModalChart(window.currentMetric, currentRegion)
    }
    function closeModal () {
      document.getElementById('healthModal').style.display = 'none'
    }

    // Chart rendering
    async function renderModalChart (metric = 'hospitalizations', state = 'PA') {
      showSpinner()

      if (!modalChartInstance) {
        const ctx = modalCanvas.getContext('2d')
        const theme = document.body.dataset.theme || 'light'

        modalChartInstance = new OverlayChart({
          ctx,
          theme,
          state
        })

        const rawMetrics = await fetchOverlayMetrics(
          ['vaccinations', 'hospitalizations', 'icu'],
          { monthsBack: 4 }
        )

        await modalChartInstance.loadData(rawMetrics)
      }

      modalChartInstance.state = state
      modalChartInstance.setMetric(metric)
      modalChartInstance.updateOverlay()

      hideSpinner()
    }

    // Event listeners
    regionSelect.addEventListener('change', e => {
      currentRegion = e.target.value
      renderModalChart(window.currentMetric, currentRegion)
    })

    metricSelect.addEventListener('change', e => {
      window.currentMetric = e.target.value
      renderModalChart(window.currentMetric, currentRegion)
    })

    window.openModal = openModal
    window.closeModal = closeModal
  }
})
