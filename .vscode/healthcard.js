// js/healthcard.js
// UI orchestration for Health Metrics Card

import { buildChartDatasets, chartOptions } from './chartUtils.js';
import { fetchMetric, fetchOverlayMetrics } from './metricFetcher.js'
import {
  normalizeICU,
  normalizeHospitalizations,
  normalizeVaccinations
} from './normalizeMetrics.js'

import { overlayChart } from './overlayChart.js';

function openModal () {
  document.getElementById('healthModal').style.display = 'block'
  renderOverlayChart()
}

function closeModal () {
  document.getElementById('healthModal').style.display = 'none'
}

function toggleCard () {
  const card = document.getElementById('cardDetails')
  card.classList.toggle('open')
}

function renderInlineChart () {
  const ctx = document.getElementById('respChart').getContext('2d')
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Hospitalizations',
          data: [120, 150, 180, 130],
          borderColor: '#3898ec',
          backgroundColor: 'rgba(56,152,236,0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        title: {
          display: true,
          text: 'Weekly Hospitalization Trends'
        }
      }
    }
  })
}

let chartInstance
let overlayChartInstance

let currentMetric = 'hospitalizations'
const defaultState = 'PA' // You can make this dynamic later

function updateMetric (metric) {
  renderModalChart(metric)
}

async function renderModalChart (metric) {
  const ctx = document.getElementById('modalChart').getContext('2d')
  if (chartInstance) chartInstance.destroy()

  const metricConfig = {
    hospitalizations: {
      label: 'Hospitalizations',
      color: '#3898ec'
    },
    vaccinations: {
      label: 'Vaccination Rate (%)',
      color: '#4caf50'
    },
    icu: {
      label: 'ICU COVID Patients',
      color: '#e63946'
    }
  }

  const config = metricConfig[metric]
  if ( !config ) return

  const metricData = await fetchMetric(metric)

  const stateData = metricData[defaultState] // You can make this dynamic later


  // if (!stateData) return

  if ( !stateData ) {
    document
      .getElementById('modalChart')
      .replaceWith(document.createTextNode('No data available for PA.'))
    return
  }

  const chartLabels = Object.keys(stateData).sort()
  const chartValues = chartLabels.map(date => stateData[date])

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: config.label,
          data: chartValues,
          backgroundColor: config.color
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Weekly ${config.label}`
        }
      }
    }
  })
}

async function renderOverlayChart(metricNames = ['vaccinations', 'hospitalizations', 'icu'], monthsBack = 4) {
  try {
    const rawMetrics = await fetchOverlayMetrics(metricNames, { monthsBack });

    const normalized = rawMetrics.map(({ name, data, chart }) => {
      const normalizeFn = {
        vaccinations: normalizeVaccinations,
        hospitalizations: normalizeHospitalizations,
        icu: normalizeICU
      }[name];

      return {
        label: chart.label,
        color: chart.color,
        yAxisID: chart.yAxisID,
        data: normalizeFn(data)
      };
    });

    console.log('[renderOverlayChart] Normalized data:', normalized);
    const datasets = buildChartDatasets(normalized);

    const ctx = document.getElementById('overlayChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: chartOptions
    });
  } catch (err) {
    console.error('Failed to render overlay chart:', err);
  }
}

async function renderHealthCard() {
  const rawMetrics = await fetchOverlayMetrics(['vaccinations', 'hospitalizations'], { monthsBack: 4 });

  const normalized = {
    vaccinations: normalizeVaccinations(rawMetrics.vaccinations),
    hospitalizations: normalizeHospitalizations(rawMetrics.hospitalizations),
  };

  console.log('[renderHealthCard] Normalized data:', normalized);
  const datasets = buildChartDatasets(normalized);
  renderChart(datasets, chartOptions);
}

document.addEventListener('DOMContentLoaded', () => {
  window.openModal = openModal
  window.closeModal = closeModal
  window.updateMetric = updateMetric // ✅ Add this line
})

document.getElementById('updateOverlayBtn').addEventListener('click', () => {
  const selectedMetrics = Array.from(
    document.querySelectorAll('#metricToggle input[type="checkbox"]:checked')
  ).map(input => input.value);

  renderOverlayChart(selectedMetrics);
});