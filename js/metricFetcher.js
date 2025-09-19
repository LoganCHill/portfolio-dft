// js/metricFetcher.js

// This is a mock implementation. In a real application, this would
// fetch data from a remote API.
export class MetricFetcher {
  constructor() {
    console.log('[MetricFetcher] Initialized.');
  }

  async fetchOverlayMetrics(regionId, metrics) {
    console.log(`[MetricFetcher] Fetching overlay metrics for ${regionId}`, metrics);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const metric = metrics[0];
    const data = {
      hospitalizations: {
        id: 'hospitalizations',
        label: 'Hospitalizations',
        values: this._generateTimeSeries(1000, 3000)
      },
      vaccinations: {
        id: 'vaccinations',
        label: 'Vaccinations (per 100k)',
        values: this._generateTimeSeries(50000, 80000)
      },
      icu: {
        id: 'icu',
        label: 'ICU Patients',
        values: this._generateTimeSeries(200, 800)
      }
    };

    return [data[metric]];
  }

  async fetchSummaryMetric(regionId, metric) {
    console.log(`[MetricFetcher] Fetching summary metric for ${regionId}: ${metric}`);
    // Simulate a faster network delay for summary data
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use a downward trend for hospitalizations for a consistent demo
    // This object defines the mock data for the small summary cards.
    // It uses a mix of hard-coded data for predictable trends and
    // dynamically generated data for variety.
    const summaryValues = {
      hospitalizations: [2500, 2400, 2200, 2150], // Simulated downward trend

      // For vaccinations, we generate 4 random data points.
      // `_generateTimeSeries` returns an array of {x, y} objects.
      // The `.map(d => d.y)` part extracts just the 'y' value from each object,
      // resulting in a simple array of numbers (e.g., [55000, 71000, ...]).
      vaccinations: this._generateTimeSeries(50000, 80000, 4).map(d => d.y),

      // This works just like the vaccinations line but for ICU data.
      icu: this._generateTimeSeries(200, 800, 4).map(d => d.y)
    };

    const values = summaryValues[metric];
    const labels = values.map((_, i) => `W${i + 1}`);

    return { labels, values };
  }

  // Helper to generate random time series data for demonstration
  _generateTimeSeries(min, max, count = 12) {
    const data = [];
    // Start from 'count' months ago to make the data always seem current.
    const isWeekly = count <= 4;
    let currentDate = new Date();

    // Set the starting date based on whether we're generating weekly or monthly data.
    if (isWeekly) {
      currentDate.setDate(currentDate.getDate() - (count - 1) * 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() - (count - 1));
    }

    for (let i = 0; i < count; i++) {
      data.push({
        x: currentDate.toISOString(),
        y: Math.floor(Math.random() * (max - min + 1)) + min
      });
      // For summary cards (count=4), we advance by 7 days to simulate weekly data.
      // For the main chart (count=12), we advance by a month.
      if (isWeekly) {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    return data;
  }
}