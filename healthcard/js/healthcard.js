// js/healthcard.js

function openModal () {
  document.getElementById('healthModal').style.display = 'block'
  renderModalChart() // Optional: render chart inside modal
}

function closeModal () {
  document.getElementById('healthModal').style.display = 'none'
}

function toggleCard() {
  const card = document.getElementById('cardDetails');
  card.classList.toggle('open');
}

function renderInlineChart() {
  const ctx = document.getElementById('respChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Hospitalizations',
        data: [120, 150, 180, 130],
        borderColor: '#3898ec',
        backgroundColor: 'rgba(56,152,236,0.2)',
        fill: true,
        tension: 0.3
      }]
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
  });
}

let chartInstance;
let currentMetric = 'hospitalizations';

function updateMetric(metric) {
  currentMetric = metric;
  renderModalChart();
}

function renderModalChart() {
  const ctx = document.getElementById('modalChart').getContext('2d');
  if (chartInstance) chartInstance.destroy();

  let chartData;
  let chartLabel;
  let chartColor;

  if (currentMetric === 'hospitalizations') {
    chartLabel = 'Hospitalizations';
    chartData = [120, 150, 180, 130];
    chartColor = '#3898ec';
  } else if (currentMetric === 'vaccinations') {
    chartLabel = 'Vaccination Rate (%)';
    chartData = [68.2, 70.1, 72.3, 74.0];
    chartColor = '#4caf50';
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: chartLabel,
        data: chartData,
        backgroundColor: chartColor
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `Weekly ${chartLabel}`
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.openModal = openModal;
  window.closeModal = closeModal;
});