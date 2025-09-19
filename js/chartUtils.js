/**
 * @file chartUtils.js
 * @description A collection of utility functions for preparing and transforming data for use with Chart.js.
 */

/**
 * Builds Chart.js-compatible datasets from normalized metric arrays.
 * This function applies consistent styling and structure to each dataset.
 *
 * @param {Array<Object>} datasets - An array of dataset objects to be processed.
 * @param {string} datasets[].label - The label for the dataset (e.g., 'Vaccinations').
 * @param {string} datasets[].color - The border color for the line chart.
 * @param {string} datasets[].yAxisID - The ID of the Y-axis to associate with this dataset.
 * @param {Array<{x: Date, y: number}>} datasets[].data - The array of data points for the chart.
 * @returns {Array<Object>} An array of fully configured Chart.js dataset objects.
 */
export function buildChartDatasets (datasets) {
  // Ensure the input is a valid array before processing.
  if (!Array.isArray(datasets)) {
    console.warn('[chartUtils] Expected an array of datasets')
    return []
  }

  return datasets
    // Filter out any datasets that are missing data or have an empty data array.
    .filter(d => Array.isArray(d.data) && d.data.length > 0)
    // Map the input data to a Chart.js-compatible format with default styles.
    .map(d => ({
      label: d.label || 'Untitled Metric',
      data: d.data,
      borderColor: d.color || '#999',
      backgroundColor: 'rgba(0,0,0,0)', // Transparent background for line charts.
      yAxisID: d.yAxisID || 'y',
      tension: 0.3, // Slightly curves the line.
      fill: false, // Do not fill the area under the line.
      pointRadius: 2, // Small radius for data points.
      pointHoverRadius: 4 // Larger radius on hover for better interaction.
    }))
}

/**
 * Flattens a nested metric data object into a flat array of objects suitable for charting.
 * The input format is expected to be: { state: { date: value } }.
 * The output format will be: [{ state, date, metric, x, y, ... }, ...].
 *
 * @param {Object} metricDict - The nested dictionary of metric data.
 * @param {string} metricName - The name of the metric being processed (e.g., 'vaccinations').
 * @returns {Array<Object>} A flat array of data points.
 */
export function flattenMetricData (metricDict, metricName) {
  const flatArray = []

  // Maps metric names to the specific field name used in the source data.
  const fieldMap = {
    vaccinations: 'series_complete_pop_pct',
    hospitalizations: 'total_adult_patients_hospitalized_confirmed_covid',
    icu: 'staffed_icu_adult_patients_confirmed_covid'
  }

  // Determine the correct field to extract the value from.
  const valueField = fieldMap[metricName]
  if (!valueField) {
    console.warn(`[flattenMetricData] Unknown metric: ${metricName}`)
    return []
  }

  // Iterate over each state in the top-level object.
  Object.entries(metricDict).forEach(([state, dateMap]) => {
    // Iterate over each date entry for the current state.
    Object.entries(dateMap).forEach(([date, value]) => {
      const parsedDate = new Date(date);
      // BUG FIX: Robustly check for invalid dates and skip them to prevent errors.
      // .getTime() on an "Invalid Date" object returns NaN.
      if (isNaN(parsedDate.getTime())) {
        // console.warn(`[flattenMetricData] Skipping invalid date: ${date} for ${state}`);
        return
      }

      const isoDate = parsedDate.toISOString();

      // Push a new, flattened object into the results array.
      flatArray.push({
        metric: metricName,
        state,
        date: isoDate,
        [valueField]: value,
        x: isoDate, // 'x' is used by Chart.js for the time-series axis.
        y: parseFloat(value) || 0 // 'y' is the numerical value; fallback to 0 if parsing fails.
      })
    })
  })

  return flatArray
}
