var widget_talsaImage = {
  //the widget name. It should be unique and written in lowcase.
  name: 'talsaImage',
  //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
  title: 'TALSA Images',
  //the name of the icon on the toolbox. We will leave it empty to use the standard one
  iconName: '',
  //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
  widgetIsLoaded: function () {
    //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
    return true //we do not require anything so we just return true.
  },
  //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
  isFit: function (question) {
    //we return true if the type of question is textwithbutton
    return question.getType() === 'talsaimage'
    //the following code will activate the widget for a text question with inputType equals to date
    //return question.getType() === 'text' && question.inputType === "date";
  },
  //Use this function to create a new class or add new properties or remove unneeded properties from your widget
  //activatedBy tells how your widget has been activated by: property, type or customType
  //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date"
  //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
  //customType - you are creating a new type, like in our example "textwithbutton"
  activatedByChanged: function (activatedBy) {
    //we do not need to check acticatedBy parameter, since we will use our widget for customType only
    //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
    Survey.JsonObject.metaData.addClass('talsaimage', [], null, 'text')
    //signaturepad is derived from "empty" class - basic question class
    //Survey.JsonObject.metaData.addClass("signaturepad", [], null, "empty");

    //Add new property(s)
    //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs
    Survey.JsonObject.metaData.addProperties('talsaimage', [
      { name: 'imageFile1' },
      { name: 'imageFile2' },
      { name: 'audioDelay' }
    ])
  },
  //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
  isDefaultRender: false,
  //You should use it if your set the isDefaultRender to false

  htmlTemplate: `
  <div style="display: flex; justify-content: center; align-items: center; width: 100%; min-height: 350px;">
    <div id="stimuli" style="text-align: center; position: relative;"></div>
  </div>
`,
  //The main function, rendering and two-way binding
  afterRender: function (question, el) {
    const container = el.querySelector('#stimuli')
    const delay = question.audioDelay
      ? parseInt(question.audioDelay, 10) * 1000
      : 1000

    container.style.opacity = 0
    // container.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
    container.style.transition = 'opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease';
    container.style.transform = 'translateY(20px)'

    function injectSVG (filename, callback) {
      fetch(`/assets/images/${filename}`)
        .then(response => {
          if (!response.ok) throw new Error(`SVG not found: ${response.status}`)
          return response.text()
        })
        .then(svgText => {
          const updatedSvg = svgText
            .replace(/fill="[^"]+"/g, 'fill="currentColor"')
            .replace(/stroke="[^"]+"/g, 'stroke="currentColor"')

          container.innerHTML = updatedSvg
          const svgElement = container.querySelector('svg')
          if (svgElement) {
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

    survey.stopTimer()

    if (question.imageFile1) {
      injectSVG(question.imageFile1, () => {
        // Fade out image 1 after a short display
        setTimeout(() => {
          // container.style.opacity = 0
          // container.style.transform = 'translateY(20px)'

          container.style.opacity = 0;
          container.style.transform = 'scale(0.95) translateY(20px)';
          container.style.filter = 'blur(2px)';

          // Wait for fade-out to complete before starting delay
          setTimeout(() => {
            // Now begin the 1-second delay
            setTimeout(() => {
              container.style.filter = 'blur(0)';
              if (question.imageFile2) {
                injectSVG(question.imageFile2, () => {
                  container.style.opacity = 1
                  container.style.transform = 'translateY(0)'
                  survey.startTimer()
                })
              } else {
                survey.startTimer()
              }
            }, delay)
          }, 600) // match fade-out duration
        }, 600) // optional display time for image 1
      })
    } else if (question.imageFile2) {
      injectSVG(question.imageFile2, () => {
        // container.style.opacity = 1
        // container.style.transform = 'translateY(0)'
        container.style.opacity = 1;
        container.style.transform = 'scale(1) translateY(0)';
        container.style.filter = 'blur(0)';
        survey.startTimer()
      })
    }

    question.readOnlyChangedCallback = function () {}
    question.valueChangedCallback = function () {}
  },
  //Use it to destroy the widget. It is typically needed by jQuery widgets
  willUnmount: function (question, el) {}
}

//Register our widget in singleton custom widget collection
Survey.CustomWidgetCollection.Instance.addCustomWidget(
  widget_talsaImage,
  'customtype'
)
