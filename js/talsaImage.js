/**
 * @file talsaImage.js
 * @description A custom SurveyJS widget that displays a sequence of two images
 * with a timed delay in between. It's designed to present visual stimuli for
 * cognitive assessment tasks.
 */
var widget_talsaImage = {
  // A unique name for the widget, used to identify it in the survey JSON.
  name: 'talsaImage',
  // The title that will appear in the SurveyJS Creator toolbox.
  title: 'TALSA Images',
  iconName: '',
  // A check to see if any third-party libraries are loaded. None are needed here.
  widgetIsLoaded: function () {
    return true
  },
  // Determines if this widget should be used for a given question.
  isFit: function (question) {
    // This widget is used for questions of type 'talsaimage'.
    return question.getType() === 'talsaimage'
  },
  /**
   * This function is called when the widget is activated. It defines the new
   * 'talsaimage' question type and adds custom properties to it.
   * @param {string} activatedBy - Indicates how the widget was activated ('property', 'type', or 'customType').
   */
  activatedByChanged: function (activatedBy) {
    // Create a new question type 'talsaimage' that inherits from the 'text' question type.
    Survey.JsonObject.metaData.addClass('talsaimage', [], null, 'text')
    // Add custom properties that can be set in the survey JSON for this widget.
    Survey.JsonObject.metaData.addProperties('talsaimage', [
      { name: 'imageFile1' }, // The filename of the first image.
      { name: 'imageFile2' }, // The filename of the second image.
      { name: 'audioDelay' }  // The delay (in seconds) between images.
    ])
  },
  // We provide our own HTML, so default rendering is not needed.
  isDefaultRender: false,
  // The HTML template for the widget.
  htmlTemplate: `
  <div class='survey-intro'>
    <div class='survey-icon'><i class="far fa-eye fa-3x"></i></div>
    <p> <div id="stimuli" style="text-align: center; position: relative;"></div> </p>
  </div>
`,
  /**
   * This function is called after the widget's HTML has been rendered.
   * It contains the core logic for fetching and displaying the images.
   * @param {object} question - The SurveyJS question object.
   * @param {HTMLElement} el - The root HTML element of the widget.
   */
  afterRender: function (question, el) {
    const container = el.querySelector('#stimuli')
    const delay = question.audioDelay
      ? parseInt(question.audioDelay, 10) * 1000
      : 1000

    container.style.opacity = 0
    // container.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    container.style.transition =
      'opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease'
    container.style.transform = 'translateY(20px)'

    /**
     * Fetches an SVG file, injects it into the container, and applies styling.
     * @param {string} filename - The name of the SVG file to load from '/assets/images/'.
     * @param {function} callback - A function to execute after the SVG is successfully loaded.
     */
    function injectSVG (filename, callback) {
      fetch(`/assets/images/${filename}`)
        .then(response => {
          if (!response.ok) throw new Error(`SVG not found: ${response.status}`)
          return response.text()
        })
        .then(svgText => {
          // Standardize SVG colors to inherit from the current theme.
          const updatedSvg = svgText
            .replace(/fill="[^"]+"/g, 'fill="currentColor"')
            .replace(/stroke="[^"]+"/g, 'stroke="currentColor"')

          container.innerHTML = updatedSvg
          const svgElement = container.querySelector('svg')
          if (svgElement) {
            // Apply consistent sizing to the injected SVG.
            svgElement.style.width = '50%'
            svgElement.style.height = 'auto'
            svgElement.style.maxHeight = '300px'
          }

          container.style.opacity = 1
          container.style.transform = 'translateY(0)'

          if (typeof callback === 'function') callback()
        })
        .catch(err => {
          console.error(`Failed to load SVG: ${filename}`, err)
          container.innerHTML = `<div class="svg-error" style="color: red;">⚠️ SVG not found</div>`
          container.style.opacity = 1
        })
    }

    // Stop the survey's page timer while the image sequence is playing.
    question.survey.stopTimer()

    if (question.imageFile1) {
      // --- Sequence Start: Display Image 1 ---
      injectSVG(question.imageFile1, () => {
        // Fade out image 1 after a short display
        setTimeout(() => {
          // container.style.opacity = 0
          // container.style.transform = 'translateY(20px)'

          container.style.opacity = 0
          container.style.transform = 'scale(0.95) translateY(20px)'
          container.style.filter = 'blur(2px)'

          // Wait for fade-out to complete before starting delay
          setTimeout(() => {
            // --- Inter-stimulus Interval ---
            setTimeout(() => {
              container.style.filter = 'blur(0)';
              if (question.imageFile2) {
                injectSVG(question.imageFile2, () => {
                  container.style.opacity = 1
                  container.style.transform = 'translateY(0)'
                  question.survey.startTimer()
                })
              } else {
                // If there's no second image, just restart the timer.
                question.survey.startTimer()
              }
            }, delay)
          }, 600) // match fade-out duration
        }, 600) // optional display time for image 1
      })
    } else if (question.imageFile2) {
      injectSVG(question.imageFile2, () => {
        // container.style.opacity = 1
        // container.style.transform = 'translateY(0)'
        container.style.opacity = 1
        container.style.transform = 'scale(1) translateY(0)'
        container.style.filter = 'blur(0)'
        question.survey.startTimer()
      })
    }

    question.readOnlyChangedCallback = function () {}
    question.valueChangedCallback = function () {}
  },
  // Called when the widget is being removed from the DOM.
  willUnmount: function (question, el) {}
}

//Register our widget in singleton custom widget collection
Survey.CustomWidgetCollection.Instance.addCustomWidget(
  widget_talsaImage,
  'customtype'
)
