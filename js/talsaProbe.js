/**
 * @file talsaProbe.js
 * @description A custom SurveyJS widget for a "probe" question. It presents a
 * text prompt and two large buttons ("yes" and "no") for the user's response.
 * It records the choice, time taken, and correctness.
 */
const widget_talsaProbe = {
  // A unique name for the widget.
  name: 'talsaprobe',
  // The title that will appear in the SurveyJS Creator toolbox.
  title: 'TALSA Probe',
  iconName: '',
  // A check to see if any third-party libraries are loaded.
  widgetIsLoaded: function () {
    return true
  },
  // Determines if this widget should be used for a given question.
  isFit: function (question) {
    // This widget is used for questions of type 'talsaprobe'.
    return question.getType() === 'talsaprobe'
  },
  /**
   * Defines the new 'talsaprobe' question type and its custom properties.
   * @param {string} activatedBy - How the widget was activated.
   */
  activatedByChanged: function (activatedBy) {
    // Create a new question type 'talsaprobe' that inherits from 'text'.
    Survey.JsonObject.metaData.addClass('talsaprobe', [], null, 'text')
    // Add custom properties to be used in the survey JSON.
    Survey.JsonObject.metaData.addProperties('talsaprobe', [
      { name: 'textPrompt' },     // The main text of the question.
      { name: 'textPromptBeep' }, // Whether to play a sound with the prompt.
      { name: 'choices' }         // The stimuli associated with the question.
    ])
  },
  // We provide our own HTML, so default rendering is not needed.
  isDefaultRender: false,
  //You should use it if your set the isDefaultRender to false
  htmlTemplate: `<div style="text-align: center; background-color: transparent !important;">
                  <div class='survey-intro'>
                  <div class='survey-icon'><i class="fas fa-question-circle fa-3x"></i></div>
                  <p></p>
                  </div>
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

  /**
   * This function is called after the widget's HTML has been rendered.
   * It sets up the event listeners and response logic.
   * @param {object} question - The SurveyJS question object.
   * @param {HTMLElement} el - The root HTML element of the widget.
   */
  afterRender: function (question, el) {
    var hasFailed
    var lastItem

    // Optionally play a sound when the question is displayed.
    if (question.textPromptBeep) {
      const audio1 = new Audio('./assets/audio/tone-cue.wav')
      audio1.play()
    }

    if (question.pageID) {
      var span_idx = parseInt(question.pageID.substr(0, 2))
      var item_idx = parseInt(question.pageID.substring(2, 4))

      if (span_idx > 0) {
        if (item_idx == 1) {
          question.survey.setValue('hasFailed', 0)
        }
        hasFailed = question.survey.getValue('hasFailed')
      }
    }

    let stimulus = null
    if (question.choices) {
      const stimuli = JSON.parse(question.choices)
      stimulus = stimuli.join(' | ')
    }

    // Set the question prompt text.
    var qPrompt = el.getElementsByTagName('p')[0]
    qPrompt.innerHTML = question.textPrompt

    // Get references to the 'yes' and 'no' buttons.
    var btnYes = el.getElementsByTagName('button')[0]
    var btnNo = el.getElementsByTagName('button')[1]

    // --- Response Timer Logic ---
    var timeTaken = 0.0
    var timeLimit = 4.0

    // Starts or stops the timer and calculates the time taken.
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

    // Start the timer as soon as the question is rendered.
    startStop()

    // --- Response Value Constants ---
    const INCORRECT = 1 // Result code for an incorrect answer.
    let PARTIAL = 2
    const CORRECT = 3

    // FULL CREDIT FOR SPAN TESTS
    if (question.survey.talsaSpanScore) {
      PARTIAL = 3
    }

    // Response codes for user choices.
    const YES = 1 // User chose "yes".
    const NO = 0  // User chose "no".

    // A structured object to hold all details about the user's response.
    const Q = {
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

    /**
     * Processes the user's response, calculates correctness, and updates
     * the survey data.
     * @param {number} choice - The user's choice (YES or NO).
     */
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
          hasFailed = question.survey.getValue('hasFailed')
          hasFailed++
          question.survey.setValue('hasFailed', hasFailed)
        }
      }
    }

    // --- Button Event Listeners ---
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

    question.readOnlyChangedCallback = function () {}
    question.valueChangedCallback = function () {}
  },
  /**
   * Called when the widget is being removed from the DOM.
   * This is used to check for test termination conditions after a response.
   * @param {object} question - The SurveyJS question object.
   * @param {HTMLElement} el - The root HTML element of the widget.
   */
  willUnmount: function (question, el) {
    // IF TEST HASN'T BEEN FLAGGED FOR TERMINATION ALREADY
    if (question.survey.getValue('cbx') != '-1') {
      var span_idx = parseInt(question.pageID.substr(0, 2)) // Parse span from current pageID
      var spans = []

      var hasFailed = parseInt(question.survey.getValue('hasFailed')) // Get count of incorrect trials

      var lastItem = ''

      var questions = question.survey.getAllQuestions() // Get survey questions
      for (var i = 0; i < questions.length; i++) {
        if (questions[i].correctAnswer) {
          // If correct answer is set, this is a trial item
          const currItem = questions[i].pageID
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
        question.survey.talsaScoringPct
      ) {
        if (spans.length > 2 && question.pageID == lastItem) {
          question.survey.setValue('cbx', '-1')
          question.survey.doComplete()
        }
      }
    }
  }
}

// Register the custom widget with SurveyJS.
Survey.CustomWidgetCollection.Instance.addCustomWidget(
  widget_talsaProbe,
  'customtype'
)
