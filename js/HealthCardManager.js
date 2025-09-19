// js/HealthCardManager.js
import { ModalManager } from './ModalManager.js';
import { OverlayChart } from './overlayChart.js';
import { HealthCardComponent } from './healthCardComponent.js';
import { MetricFetcher } from './metricFetcher.js';

/**
 * Orchestrates the "Public Health Tracker" widget. This class is the main
 * controller for the health card demo. It is responsible for:
 * - Initializing event listeners for user interaction.
 * - Coordinating with `MetricFetcher` to load data on demand.
 * - Managing the modal's state (open/close) via `ModalManager`.
 * - Instructing `OverlayChart` to render data for the selected region.
 */
export class HealthCardManager {
  /**
   * @param {object} config - Configuration for the HealthCardManager.
   * @param {string} config.modalId - The ID of the modal element.
   * @param {string} config.startBtnId - The ID of the button that opens the modal.
   * @param {string} config.selectId - The ID of the region select dropdown inside the modal.
   * @param {string} config.defaultRegion - The default region to display when the modal opens.
   */
  constructor({ modalId, startBtnId, selectId, defaultRegion }) {
    this.startBtn = document.getElementById(startBtnId);
    this.regionSelect = document.getElementById(selectId);
    this.defaultRegion = defaultRegion;

    this.metricFetcher = new MetricFetcher();
    this.modalManager = new ModalManager('healthModal', '.health-modal-close');
    this.overlayChart = new OverlayChart('modalChart', 'modalMetricSelect', 'chartLoading', this.metricFetcher);
    
    this.regionsData = [];
  }

  /**
   * Initializes the manager by setting up event listeners for the "View Details"
   * button and the region selection dropdown.
   */
  async init() {
    console.log('[HealthCardManager] Initializing...');
    // The region select is now inside the modal, so we don't need to populate it on page load.
    // await this._fetchAndSetRegions(); 

    // The button now just opens the modal.
    this.startBtn.addEventListener('click', () => {
      this.showDetailedChart({ id: this.defaultRegion, name: 'Pennsylvania' }); // Open with default
    });

    // Add the change event listener for the region dropdown
    this.regionSelect.addEventListener('change', (e) => {
      const selectedRegionId = e.target.value;
      const region = this.regionsData.find(r => r.id === selectedRegionId);
      if (region) {
        this.modalManager.setTitle(`Health Metrics for ${region.name}`);
        this.overlayChart.show(region);
      }
    });
  }

  /**
   * Fetches and processes data for all configured regions.
   * This method fetches summary data for each region concurrently and generates
   * a descriptive text summary based on the data trend.
   * @private
   */
  async _fetchAndSetRegions() {
    // In a real app, this would be an API call to get the list of regions
    // and their primary summary metric.
    const regionConfigs = [
      { 
        id: 'PA', 
        name: 'Pennsylvania', 
        summaryMetric: 'hospitalizations',
        metricName: 'Hospitalizations',
      },
      { 
        id: 'NJ', 
        name: 'New Jersey', 
        summaryMetric: 'icu',
        metricName: 'ICU admissions',
      },
      { 
        id: 'NY', 
        name: 'New York', 
        summaryMetric: 'vaccinations',
        metricName: 'Vaccinations',
      },
    ];

    // Use Promise.all to fetch summary data for all regions concurrently
    const processedRegions = await Promise.all(regionConfigs.map(async (region) => {
      // Fetch the summary data for the chart
      const summaryData = await this.metricFetcher.fetchSummaryMetric(region.id, region.summaryMetric);
      
      // Generate the descriptive text based on the fetched data
      const summaryText = this._generateSummaryText(summaryData.values, region.metricName);

      return {
        ...region,
        summaryData: summaryData, // { labels: [...], values: [...] }
        summary: summaryText,
      };
    }));

    this.regionsData = processedRegions;

    console.log('[HealthCardManager] Dynamic region data loaded and processed.');
  }

  /**
   * Generates a brief summary text based on a simple trend analysis of data values.
   * @param {number[]} values - An array of numerical data points.
   * @param {string} metricName - The name of the metric for the summary text.
   * @returns {string} A descriptive summary of the trend.
   */
  _generateSummaryText(values, metricName = 'Values') {
    if (!values || values.length < 2) {
      return `${metricName} data is currently unavailable.`;
    }

    const startValue = values[0];
    const endValue = values[values.length - 1];

    // Avoid division by zero if the start value is 0
    if (startValue === 0) {
      return endValue > 0 
        ? `${metricName} have increased from zero.` 
        : `${metricName} have remained at zero.`;
    }

    const changePercent = ((endValue - startValue) / startValue) * 100;

    if (changePercent < -5) {
      return `${metricName} are showing a downward trend.`;
    } else if (changePercent > 5) {
      return `${metricName} are showing an upward trend.`;
    } else {
      return `${metricName} have stabilized recently.`;
    }
  }

  /**
   * Populates the region selection dropdown element inside the modal with
   * the regions that have been fetched and processed.
   * @private
   */
  _populateSelect() {
    this.regionsData.forEach(region => {
      const option = document.createElement('option');
      option.value = region.id;
      option.textContent = region.name;
      if (region.id === this.defaultRegion) {
        option.selected = true;
      }
      this.regionSelect.appendChild(option);
    });
  }

  /**
   * Opens the details modal. If it's the first time opening, it fetches all
   * necessary region data. It then instructs the chart to display data for the
   * specified region.
   * @param {object} region - The region object to display.
   */
  async showDetailedChart(region) {
    // If region data hasn't been loaded yet, fetch and populate the dropdown.
    if (this.regionsData.length === 0) {
      await this._fetchAndSetRegions();
      this._populateSelect();
    }
    this.modalManager.open(`Health Metrics for ${region.name}`);
    this.overlayChart.show(region);
  }
}