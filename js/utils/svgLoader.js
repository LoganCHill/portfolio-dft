export function injectSVG (filename, container, callback) {
  fetch(`./assets/images/${filename}`)
    .then(response => {
      if (!response.ok) throw new Error('SVG not found')
      return response.text()
    })
    .then(svgText => {
      container.innerHTML = svgText
      if (typeof callback === 'function') callback()
    })
    .catch(err => {
      console.error(`Failed to load SVG: ${filename}`, err)
      container.innerHTML = `<div class="svg-error">⚠️ SVG not found</div>`
    })
}