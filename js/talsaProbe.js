const widget_talsaProbe = {
  //the widget name. It should be unique and written in lowcase.
  name: 'talsaprobe',
  //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
  title: 'TALSA Probe',
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
    return question.getType() === 'talsaprobe'
    //the following code will activate the widget for a text question with inputType equals to date
    //return question.getType() === 'text' && question.inputType === "date";
  },
  activatedByChanged: function (activatedBy) {
    Survey.JsonObject.metaData.addClass('talsaprobe', [], null, 'text')
    Survey.JsonObject.metaData.addProperties('talsaprobe', [
      { name: 'textPrompt' },
      { name: 'textPromptBeep' },
      { name: 'choices' }
    ])
  },
  //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
  isDefaultRender: false,
  //You should use it if your set the isDefaultRender to false
  htmlTemplate: `<div style="text-align: center; background-color: transparent !important;">
                  <span class="font-size-large"></span>
                  <br /><br />
                  <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1rem;">
                  <button type="button" class="talsa-probe-btn talsa-probe-btn-yes">
                    <span class="fa-stack">
                      <i class="fas fa-circle fa-stack-2x"></i>
                      <i class="fas fa-check fa-stack-1x fa-inverse"></i>
                    </span>
                  </button>
                  <button type="button" class="talsa-probe-btn talsa-probe-btn-no">
                    <span class="fa-stack">
                      <i class="fas fa-circle fa-stack-2x"></i>
                      <i class="fas fa-times fa-stack-1x fa-inverse"></i>
                    </span>
                  </button>
                  </div>
                </div>`,

  //The main function, rendering and two-way binding
  afterRender: function (question, el) {
    var hasFailed
    var lastItem

    if (question.textPromptBeep) {
      audio1 = new Audio('./assets/audio/tone-cue.wav')
      audio1.play()
    }

    if (question.pageID) {
      var span_idx = parseInt(question.pageID.substr(0, 2))
      var item_idx = parseInt(question.pageID.substring(2, 4))

      if (span_idx > 0) {
        if (item_idx == 1) {
          survey.setValue('hasFailed', 0)
        }
        hasFailed = survey.getValue('hasFailed')
      }
    }

    if (question.choices) {
      stimuli = JSON.parse(question.choices)

      stimulus = null
      for (i = 0, len = stimuli.length, stimulus = ''; i < len; i++) {
        if (i == 0) {
          stimulus = stimuli[i]
        } else {
          stimulus += ' | ' + stimuli[i]
        }
      }
    }

    //el is our root element in htmlTemplate, is "div" in our case
    //get the text element
    var qPrompt = el.getElementsByTagName('span')[0]
    qPrompt.innerHTML = question.textPrompt

    var btnYes = el.getElementsByTagName('button')[0]
    var btnNo = el.getElementsByTagName('button')[1]

    var timeTaken = 0.0
    var timeLimit = 4.0

    var startTime, running
    function startStop () {
      if (running) {
        timeTaken = (Date.now() - startTime) / 1000
        running = false
        console.log('Time: ' + timeTaken)
      } else {
        running = true
        startTime = Date.now()
      }
    }

    startStop()

    // RESULT VALUES
    INCORRECT = 1
    PARTIAL = 2
    CORRECT = 3

    // FULL CREDIT FOR SPAN TESTS
    if (survey.talsaSpanScore) {
      PARTIAL = 3
    }

    // RESPOSE VALUES
    YES = 1
    NO = 0

    //QUESTION RESPONSE OBJECT
    Q = {
      pageID: question.pageID,
      stimulus: null,
      result: 1,
      answer: null,
      selected: [],
      timer: null
    }

    if (question.choices) {
      Q['stimulus'] = stimulus
    }
    question.survey.setValue(
      question.getValueName() + '_obj',
      JSON.stringify(Q)
    )

    function response (choice) {
      // STORE RESULT (correct/partial correct/incorrect)
      if (timeTaken < timeLimit && Q['answer'] == null) {
        Q['result'] = choice == question.correctAnswer ? CORRECT : INCORRECT
      } else {
        if (timeTaken >= timeLimit) {
          Q['result'] = choice == question.correctAnswer ? PARTIAL : INCORRECT
        } else if (Q['answer'] != CORRECT) {
          Q['result'] = choice == question.correctAnswer ? PARTIAL : INCORRECT
        }
      }

      // RECORD EVERY SELECTION
      Q['selected'].push(choice)

      // RECORD ANSWER
      Q['answer'] = choice
      Q['timer'] = timeTaken

      question.value = Q['answer']
      question.survey.setValue(
        question.getValueName() + '_obj',
        JSON.stringify(Q)
      )

      if (Q['result'] == INCORRECT) {
        if (span_idx > 0) {
          hasFailed = survey.getValue('hasFailed')
          hasFailed++
          survey.setValue('hasFailed', hasFailed)
        }
      }
    }

    //set the changed value into question value
    btnNo.onclick = function () {
      btnNo.classList.add('active')
      btnYes.classList.remove('active')
      startStop()
      response(NO) // "NO"  = 0
    }

    btnYes.onclick = function () {
      btnYes.classList.add('active')
      btnNo.classList.remove('active')
      startStop()
      response(YES) // "YES" = 1
    }

    timerCallback = function () {}

    onValueChangedCallback = function () {}

    onReadOnlyChangedCallback = function () {}

    //if question becomes readonly/enabled add/remove disabled attribute
    question.readOnlyChangedCallback = onReadOnlyChangedCallback
    //if the question value changed in the code, for example you have changed it in JavaScript
    question.valueChangedCallback = onValueChangedCallback
    //set initial value
    onValueChangedCallback()
    //make elements disabled if needed
    onReadOnlyChangedCallback()
  },
  //Use it to destroy the widget. It is typically needed by jQuery widgets
  willUnmount: function (question, el) {
    // IF TEST HASN'T BEEN FLAGGED FOR TERMINATION ALREADY
    if (survey.getValue('cbx') != '-1') {
      var span_idx = parseInt(question.pageID.substr(0, 2)) // Parse span from current pageID
      var spans = []

      var hasFailed = parseInt(survey.getValue('hasFailed')) // Get count of incorrect trials

      var lastItem = ''

      var questions = survey.getAllQuestions() // Get survey questions
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].correctAnswer) {
          // If correct answer is set, this is a trial item
          currItem = questions[i].pageID
          if (isNaN(spans[parseInt(currItem.substr(0, 2))])) {
            // Count number of trials in test
            spans[parseInt(currItem.substr(0, 2))] = 0 // Count number of trials in test
          }
          spans[parseInt(currItem.substr(0, 2))]++ // Count number of trials in test

          if (span_idx > 0 && span_idx == parseInt(currItem.substr(0, 2))) {
            // Ignore a possible span "0", that is a practice item and get current span group
            lastItem = questions[i].pageID // store page id until loop finished, that is the last item for the group
          }
        }
      }

      if (
        (spans[span_idx] - hasFailed) / spans[span_idx] <
        survey.talsaScoringPct
      ) {
        if (spans.length > 2 && question.pageID == lastItem) {
          survey.setValue('cbx', '-1')
          survey.doComplete()
        }
      }
    }
  }
}

//Register our widget in singleton custom widget collection
Survey.CustomWidgetCollection.Instance.addCustomWidget(
  widget_talsaProbe,
  'customtype'
)
