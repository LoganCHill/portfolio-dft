/**
 * @file normalizeMetrics.js
 * @description Provides a set of functions to transform raw health metric data from various
 * sources into a consistent, chart-ready "dual format" structure. This format includes both
 * an array for direct use in Chart.js and a lookup object for efficient data access.
 */

/**
 * A generic utility function that converts a raw data array into a "dual format" object.
 * The dual format consists of:
 * 1. `array`: An array of {x, y, region} objects, optimized for Chart.js time-series data.
 * 2. `lookup`: A nested object of { region: { date: value } }, for fast, direct data retrieval.
 *
 * @param {Array<Object>} data - The raw array of data entries from the API.
 * @param {string} valueKey - The name of the property in each entry that holds the numerical value.
 * @returns {{array: Array<{x: string, y: number, region: string}>, lookup: Object}} The normalized data object.
 */
function buildDualFormat(data, valueKey) {
  const array = []
  const lookup = {}

  data.forEach(entry => {
    // Handle different property names for the region ('location' or 'state').
    const region = entry.location || entry.state
    const parsedDate = new Date(entry.date)
    const rawValue = entry[valueKey]

    // --- Data Validation ---
    // 1. Skip entry if region is missing.
    // 2. Skip entry if the date is invalid. `getTime()` on an "Invalid Date" object returns NaN.
    // 3. Skip entry if the value is null or undefined.
    if (!region || isNaN(parsedDate.getTime()) || rawValue == null) {
      return
    }

    // Convert the valid date to a consistent ISO string format.
    const date = parsedDate.toISOString()
    // Parse the value, defaulting to 0 if it's not a valid number to prevent NaN in the dataset.
    const value = parseFloat(rawValue) || 0

    // Add the structured data point to the chart array.
    array.push({ x: date, y: value, region })

    // Build the nested lookup object for quick access.
    if (!lookup[region]) lookup[region] = {}
    lookup[region][date] = value
  })

  return { array, lookup }
}

/**
 * Normalizes vaccination data.
 * @param {Array<Object>} data - Raw vaccination data array.
 * @param {boolean} [debug=false] - If true, logs the number of entries being processed.
 * @returns {{array: Array, lookup: Object}} The normalized data.
 */
export function normalizeVaccinations(data, debug = false) {
  if (debug) console.log('[normalizeMetrics] Vaccinations entries:', data.length)
  return buildDualFormat(data, 'series_complete_pop_pct')
}

/**
 * Normalizes hospitalization data.
 * @param {Array<Object>} data - Raw hospitalization data array.
 * @param {boolean} [debug=false] - If true, logs the number of entries being processed.
 * @returns {{array: Array, lookup: Object}} The normalized data.
 */
export function normalizeHospitalizations(data, debug = false) {
  if (debug) console.log('[normalizeMetrics] Hospitalizations entries:', data.length)
  return buildDualFormat(data, 'total_adult_patients_hospitalized_confirmed_covid')
}

/**
 * Normalizes ICU patient data.
 * @param {Array<Object>} data - Raw ICU data array.
 * @param {boolean} [debug=false] - If true, logs the number of entries being processed.
 * @returns {{array: Array, lookup: Object}} The normalized data.
 */
export function normalizeICU(data, debug = false) {
  if (debug) console.log('[normalizeMetrics] ICU entries:', data.length)
  return buildDualFormat(data, 'staffed_icu_adult_patients_confirmed_covid')
}