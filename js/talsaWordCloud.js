/**
 * @file talsaWordCloud.js
 * @description A custom SurveyJS widget that displays a static word cloud.
 * It is used to visually present a list of possible categories to the user.
 */
const wordCloudData = [
  ['Vegetables', 75],
  ['Tools', 20],
  ['Animals', 25],
  ['Clothes', 50],
  ['Transportation', 30],
  ['Appliances', 30],
  ['Musical Instruments', 25],
  ['Fruits', 30],
  ['Furniture', 25]
]

var widget_talsaWordCloud = {
  // A unique name for the widget.
  name: 'talsawordcloud',
  // The title that will appear in the SurveyJS Creator toolbox.
  title: 'TALSA Word Cloud',
  // A check to see if the required third-party library (wordcloud2.js) is loaded.
  widgetIsLoaded: function () {
    return typeof WordCloud !== 'undefined'
  },
  // Determines if this widget should be used for a given question.
  isFit: function (question) {
    return question.getType() === 'talsawordcloud'
  },
  /**
   * Defines the new 'talsawordcloud' question type.
   * @param {string} activatedBy - How the widget was activated.
   */
  activatedByChanged: function (activatedBy) {
    // Create a new question type 'talsawordcloud' that inherits from 'empty' (a basic question).
    Survey.JsonObject.metaData.addClass('talsawordcloud', [], null, 'empty')
  },
  // The HTML template for the widget.
  htmlTemplate: `
  <div class='survey-intro'>
     <div class='survey-icon'><i class='fas fa-info-circle'></i></div>
     <h2>Instructions</h2>
     <p>Here are some of the possible categories...</p>
     <div style="background-color: transparent" class="wordcloud-wrapper">
       <canvas id="wordcloud-canvas" class="wordcloud-canvas"></canvas>
     </div>
  </div>
  `,
  /**
   * This function is called after the widget's HTML has been rendered.
   * It initializes and renders the word cloud on the canvas element.
   * @param {object} question - The SurveyJS question object.
   * @param {HTMLElement} el - The root HTML element of the widget.
   */
  afterRender: function (question, el) {
    const canvas = el.querySelector('#wordcloud-canvas')

    // Set canvas dimensions to match its container.
    canvas.width = canvas.parentElement.offsetWidth

    // Initialize the word cloud with specific configuration.
    WordCloud(canvas, {
      backgroundColor: 'transparent',
      list: wordCloudData,
      gridSize: 8,
      weightFactor: function (size) {
        return Math.log2(size) * 5
      },
      rotateRatio: 0.5,
      clearCanvas: true, // Clears canvas before drawing
      // Use a color palette that matches the site's theme.
      color: function () {
        const palette = ['#007B7F', '#005F73', '#008891', '#00A8A8']
        return palette[Math.floor(Math.random() * palette.length)]
      }
    })
  },
  willUnmount: function (question, el) {
    // No cleanup needed for this static widget.
  }
}

// Register the custom widget with SurveyJS.
Survey.CustomWidgetCollection.Instance.addCustomWidget(widget_talsaWordCloud, 'customtype')
