const data = [
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

var widget = {
  name: 'talsawordcloud',
  title: 'TALSA Word Cloud',
  widgetIsLoaded: function () {
    return typeof WordCloud !== 'undefined'
  },
  isFit: function (question) {
    return question.getType() === 'talsawordcloud'
  },
  activatedByChanged: function (activatedBy) {
    Survey.JsonObject.metaData.addClass('talsawordcloud', [], null, 'empty')
  },
  htmlTemplate: `
  <div class='survey-intro'>
     <div class='survey-icon'><i class='fas fa-info-circle'></i></div>
     <p>Here are some of the possible categories...</p>
     <div style="background-color: transparent" class="wordcloud-wrapper">
       <canvas id="wordcloud-canvas" class="wordcloud-canvas"></canvas>
     </div>
  </div>
  `,
  afterRender: function (question, el) {
    const canvas = el.querySelector('#wordcloud-canvas')

    canvas.width = canvas.parentElement.offsetWidth
    // canvas.height = 300

    WordCloud(canvas, {
      backgroundColor: 'transparent',
      list: data,
      gridSize: 8,
      weightFactor: function (size) {
        return Math.log2(size) * 5
      },
      rotateRatio: 0.5,
      clearCanvas: true, // Clears canvas before drawing
      color: function () {
        const palette = ['#007B7F', '#005F73', '#008891', '#00A8A8']
        return palette[Math.floor(Math.random() * palette.length)]
      }
    })
  },
  willUnmount: function (question, el) {
    // Optional cleanup
  }
}

Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, 'customtype')
