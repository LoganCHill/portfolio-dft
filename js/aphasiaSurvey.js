// js/aphasiaSurvey.js

/**
 * The entire survey definition.
 */
export const surveyJSON = {
  widthMode: 'responsive',
  surveyID: 'SURVEY1',
  completedHtml: `
    <div class='survey-intro' style='padding: 1rem; text-align: center;'>
      <div class='survey-icon'><i class='fas fa-redo fa-3x'></i></div>
      <p style='font-size: 1.2rem; margin-bottom: 1.5rem;'>Thank you for completing the assessment.</p>
      <button id='restartSurveyBtn' class='button'>Restart Assessment</button>
    </div>
  `,
  completeText: 'Finish',
  goNextPageAutomatic: 'false',
  pageNextText: 'Tap to continue',
  showPrevButton: 'false',
  showTimerPanel: 'hidden',
  showTitle: 'false',
  title: 'Category Judgements - Pictures (1 second delay)',
  pages: [
    {
      name: 'intro',
      elements: [
        {
          pageID: '00001',
          name: 'intro',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "  <div class='survey-icon'><i class='fas fa-info-circle fa-3x'></i></div>" +
            '  <div> <h2>Welcome!</h2> <p>Thank you for participating in this survey.</p> </div> ' +
            '</div> '
        }
      ]
    },
    {
      name: 'instruct1',
      elements: [
        {
          pageID: '00002',
          name: 'instruct1',
          type: 'html',
          html:
            "<div class='survey-intro'>" +
            "   <div class='survey-icon'><i class='fas fa-info-circle fa-3x'></i></div>" +
            '   <div>' +
            '   <h2>Instructions</h2>' +
            '      <p>For this test, you will see a picture followed by another picture. Please pay close attention to both.</p>' +
            '   </div>' +
            '</div>'
        }
      ]
    },
    {
      name: 'instruct2',
      elements: [
        {
          pageID: '00003',
          name: 'instruct2',
          type: 'html',
          html:
            "<div class='survey-intro'>" +
            "   <div class='survey-icon'><i class='fas fa-info-circle fa-3x'></i></div>" +
            '   <h2>Instructions</h2>' +
            '   <div>' +
            '      <p>Your job is to decide if the second picture you saw was the <u>SAME CATEGORY</u> as the first picture.</p>' +
            '   </div>' +
            '</div>'
        }
      ]
    },
    {
      name: 'instruct3',
      elements: [
        {
          pageID: '00004',
          name: 'instruct3',
          type: 'html',
          html:
            "<div class='survey-intro'>" +
            "   <div class='survey-icon'><i class='fas fa-info-circle'></i></div>" +
            '   <div>' +
            '   <h2>Instructions</h2>' +
            "      <p>If the two pictures were the same category, press the green circle <i class='fa fa-check-circle fa-5x' style='font-size:24px;color:green'></i> " +
            '      for "yes".   If they were different, press the red circle ' +
            "      <i class='fa fa-times-circle' style='font-size:24px;color:red'></i> " +
            '      for "no".</p> </h2> </div>' +
            '   </div>' +
            '</div>'
        }
      ]
    },
    {
      name: 'instruct4',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00005',
          name: 'instruct4',
          type: 'talsawordcloud'
        }
      ]
    },
    {
      name: 'ToneProc1_fixate',
      elements: [
        {
          pageID: '00010',
          name: 'ToneProc1_fixate',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "  <div class='survey-icon'><i class='fas fa-hourglass-start fa-pulse'></i></div>" +
            "  <p class='font-size-large'>Let's get started.</p>" +
            '</div> '
        }
      ]
    },
    {
      name: 'ToneProc1_image',
      timeLimit: '2',
      navigationButtonsVisibility: 'hide',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00011',
          name: 'ToneProc1_image',
          type: 'talsaimage',
          audioDelay: '1',
          imageFile1: 'belt.svg',
          imageFile2: 'skirt.svg'
        }
      ]
    },
    {
      name: 'ToneProc1',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00012',
          name: 'ToneProc1',
          type: 'talsaprobe',
          textPrompt:
            'Is the second picture you saw the SAME CATEGORY as the first picture?',
          correctAnswer: '0',
          choices: '["belt", "skirt"]'
        }
      ]
    },
    {
      name: 'ToneProc1_grade',
      elements: [
        {
          pageID: '00013',
          name: 'ToneProc1_grade',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "   <div style='font-color: {ToneProc1_color} !important'> " +
            "      <div class='survey-icon'>" +
            "         <i class='fa fa-{ToneProc1_icon}-circle fa-3x' style='color:{ToneProc1_color} !important'></i>" +
            '      </div>' +
            '   </div> ' +
            '   <h2>{ToneProc1_msg}</h2> ' +
            '</div> '
        }
      ]
    },
    {
      name: 'ToneProc2_fixate',
      elements: [
        {
          pageID: '00020',
          name: 'ToneProc2_fixate',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "  <div class='survey-icon'><i class='fa fa-bullseye fa-3x'></i></div>" +
            "  <div class='font-size-large'><p>Two more to go!</p> </div> " +
            '</div> '
        }
      ]
    },
    {
      name: 'ToneProc2_image',
      timeLimit: '2',
      navigationButtonsVisibility: 'hide',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00021',
          name: 'ToneProc2_image',
          type: 'talsaimage',
          audioDelay: '1',
          imageFile1: 'jail.svg',
          imageFile2: 'horn.svg'
        }
      ]
    },
    {
      name: 'ToneProc2',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00022',
          name: 'ToneProc2',
          type: 'talsaprobe',
          textPrompt:
            'Is the second picture you saw the SAME CATEGORY as the first picture?',
          correctAnswer: '0',
          choices: '["jail", "horn"]'
        }
      ]
    },
    {
      name: 'ToneProc2_grade',
      elements: [
        {
          pageID: '00023',
          name: 'ToneProc2_grade',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "   <div style='font-color: {ToneProc2_color} !important'> " +
            "      <div class='survey-icon'>" +
            "         <i class='fa fa-{ToneProc2_icon}-circle fa-3x' style='color:{ToneProc2_color} !important'></i>" +
            '      </div>' +
            '   </div> ' +
            '   <h2>{ToneProc2_msg}</h2> ' +
            '</div> '
        }
      ]
    },
    {
      name: 'ToneProc3_fixate',
      elements: [
        {
          pageID: '00030',
          name: 'ToneProc3_fixate',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "  <div class='survey-icon'><i class='fa fa-bullseye fa-3x'></i></div>" +
            "  <div class='font-size-large'><p>Last one...</p> </div> " +
            '</div> '
        }
      ]
    },
    {
      name: 'ToneProc3_image',
      timeLimit: '2',
      navigationButtonsVisibility: 'hide',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00031',
          name: 'ToneProc3_image',
          type: 'talsaimage',
          audioDelay: '1',
          imageFile1: 'nightstand.svg',
          imageFile2: 'broccoli.svg'
        }
      ]
    },
    {
      name: 'ToneProc3',
      questionTitleLocation: 'hidden',
      elements: [
        {
          pageID: '00032',
          name: 'ToneProc3',
          type: 'talsaprobe',
          textPrompt:
            'Is the second picture you saw the SAME CATEGORY as the first picture?',
          correctAnswer: '0',
          choices: '["nightstand", "broccoli"]'
        }
      ]
    },
    {
      name: 'ToneProc3_grade',
      elements: [
        {
          pageID: '00033',
          name: 'ToneProc3_grade',
          type: 'html',
          html:
            "<div class='survey-intro'> " +
            "   <div style='font-color: {ToneProc3_color} !important'> " +
            "      <div class='survey-icon'>" +
            "         <i class='fa fa-{ToneProc3_icon}-circle fa-3x' style='color:{ToneProc3_color} !important'></i>" +
            '      </div>' +
            '   </div> ' +
            '   <h2>{ToneProc3_msg}</h2> ' +
            '</div> '
        }
      ]
    },
    {
      name: 'closing',
      elements: [
        {
          pageID: '99999',
          name: 'closing',
          type: 'html',
          html:
            "<div class='survey-intro' style='padding-top: 1rem;'> " +
            "   <div class='survey-icon'><i class='fas fa-award fa-3x'></i></div> " +
            "   <h2>Task Complete!</h2> " +
            "   <p style='font-size: 1.2rem; max-width: 60ch;'> " +
            "      Thank you for completing this category judgment task. This type of exercise helps researchers understand how the brain organizes information. " +
            "   </p> " +
            "   <div style='margin-top: 1.5rem; font-size: 1.1rem;'> " +
            "      <p>You correctly identified <strong>{correct_answers}</strong> out of <strong>{total_questions}</strong> categories.</p> " +
            "   </div> " +
            "   <p style='margin-top: 2rem; font-size: 1rem; color: var(--survey-text-secondary);'>Your participation is greatly appreciated!</p> " +
            "</div> "
        }
      ]
    }
  ],
  calculatedValues: [
    {
      name: 'ToneProc1_color',
      expression:
        "iif({ToneProc1} empty, 'blue', iif({ToneProc1}='1', 'green', 'red'))"
    },
    {
      name: 'ToneProc1_icon',
      expression:
        "iif({ToneProc1} empty, 'minus', iif({ToneProc1}='1', 'check', 'times'))"
    },
    {
      name: 'ToneProc1_msg',
      expression:
        "iif({ToneProc1} empty, 'No Response', iif({ToneProc1}='1', 'Correct', 'Incorrect'))"
    },
    {
      name: 'ToneProc2_color',
      expression:
        "iif({ToneProc2} empty, 'blue', iif({ToneProc2}='0', 'green', 'red'))"
    },
    {
      name: 'ToneProc2_icon',
      expression:
        "iif({ToneProc2} empty, 'minus', iif({ToneProc2}='0', 'check', 'times'))"
    },
    {
      name: 'ToneProc2_msg',
      expression:
        "iif({ToneProc2} empty, 'No Response', iif({ToneProc2}='0', 'Correct', 'Incorrect'))"
    },
    {
      name: 'ToneProc3_color',
      expression:
        "iif({ToneProc3} empty, 'blue', iif({ToneProc3}='0', 'green', 'red'))"
    },
    {
      name: 'ToneProc3_icon',
      expression:
        "iif({ToneProc3} empty, 'minus', iif({ToneProc3}='0', 'check', 'times'))"
    },
    {
      name: 'ToneProc3_msg',
      expression:
        "iif({ToneProc3} empty, 'No Response', iif({ToneProc3}='0', 'Correct', 'Incorrect'))"
    },
    {
      name: 'correct_answers',
      expression:
        "iif({ToneProc1} = '1', 1, 0) + iif({ToneProc2} = '0', 1, 0) + iif({ToneProc3} = '0', 1, 0)"
    },
    {
      name: 'total_questions',
      expression: "3"
    }
  ]
}

/**
 * Manages the Aphasia Category Judgement Survey.
 * This class handles the entire lifecycle of the SurveyJS-based assessment,
 * including initializing it within a modal, managing its state, handling
 * custom navigation, and processing completion events.
 */
export class AphasiaSurveyManager {
  /**
   * @param {object} config - The configuration object for the survey manager.
   * @param {string} config.modalId - The ID of the modal element that contains the survey.
   * @param {string} config.startBtnId - The ID of the button that launches the survey modal.
   * @param {string} config.closeBtnSelector - The CSS selector for the modal's close button.
   * @param {string} config.surveyContainerId - The ID of the div where the survey will be rendered.
   * @param {string} config.customNavId - The ID of the container for custom navigation controls.
   * @param {string} config.completionContainerId - The ID of the element to display completion results.
   * @param {string} config.cardFooterId - The ID of the card footer containing the start button.
   */
  constructor ({
    modalId,
    startBtnId,
    closeBtnSelector,
    surveyContainerId,
    customNavId,
    completionContainerId,
    cardFooterId
  }) {
    this.modal = document.getElementById(modalId)
    this.startBtn = document.getElementById(startBtnId)
    // The close button is a sibling of the modal content, not a child,
    // so we need to query from the document or a shared parent.
    this.closeBtn = document.querySelector(`#${modalId} ${closeBtnSelector}`)
    this.surveyContainer = document.getElementById(surveyContainerId)
    this.customNavContainer = document.getElementById(customNavId)
    this.completionContainer = document.getElementById(completionContainerId)
    this.cardFooter = document.getElementById(cardFooterId)

    if (
      !this.modal ||
      !this.startBtn ||
      !this.closeBtn ||
      !this.surveyContainer ||
      !this.customNavContainer ||
      !this.completionContainer ||
      !this.cardFooter
    ) {
      console.error(
        '[AphasiaSurveyManager] One or more required DOM elements not found.'
      )
      return
    }

    this.survey = new Survey.Model(surveyJSON)
  }

  /**
   * Initializes the survey manager by applying the theme and setting up event handlers.
   */
  init () {
    Survey.StylesManager.applyTheme('defaultV2')
    this._setupEventHandlers()
    // Render the survey using the jQuery plugin
    $(`#${this.surveyContainer.id}`).Survey({ model: this.survey })
  }

  /**
   * Attaches all necessary event listeners for the survey and modal.
   * @private
   */
  _setupEventHandlers () {
    this.startBtn.addEventListener('click', () => this.startSurvey());
    this.closeBtn.addEventListener('click', () => this.modal.style.display = 'none');
    window.addEventListener('click', event => { if (event.target === this.modal) this.modal.style.display = 'none'; });

    // This event handler is crucial for replacing placeholders like {correct_answers}
    // in the completedHtml.
    this.survey.onTextMarkdown.add((sender, options) => {
      let str = options.text
      str = sender.processText(str, true)
      options.html = str
    })

    // Handle survey completion
    this.survey.onComplete.add(sender => {
      this.modal.style.display = 'none'
      this.customNavContainer.innerHTML = '' // Clear custom nav on complete

      // Add a listener to the new restart button
      this.completionContainer.innerHTML = sender.completedHtml;
      this.cardFooter.style.display = 'none'; // Hide the original footer

      const restartBtn = document.getElementById('restartSurveyBtn')
      if (restartBtn) {
        restartBtn.addEventListener('click', () => {
          // Restore the original content of the survey card
          this.completionContainer.innerHTML = this.originalCardContent;
          this.cardFooter.style.display = 'flex'; // Show the footer again
          
          // Re-select the button and ensure the listener is attached.
          this.startBtn = document.getElementById(this.startBtn.id);
          // We remove any old listeners to prevent duplicates before adding a new one.
          this.startBtn.removeEventListener('click', this.boundStartSurvey);
          this.startBtn.addEventListener('click', this.boundStartSurvey);
        })
      }
    })

    // Update custom navigation on page change
    this.survey.onCurrentPageChanged.add(() => {
      const currentPageName = this.survey.currentPage.name
      const isImagePage = currentPageName.includes('_image')

      this.customNavContainer.style.display = isImagePage ? 'none' : 'block'
      if (!isImagePage) {
        this._renderCustomNav()
      }
    })

    // Stop automatic scrolling
    this.survey.onScrollingElementToTop.add((sender, options) => {
      options.cancel = true
    })

    // Hide default navigation buttons
    this.survey.showNavigationButtons = false
  }
  
  /**
   * Starts or restarts the survey. It clears previous results,
   * renders the survey, and displays the modal.
   */
  startSurvey() {
    this.survey.clear(true, true)
    this.survey.render(this.surveyContainer.id)
    this._renderCustomNav()
    this.modal.style.display = 'flex'

    // Store the initial state of the card content so we can restore it perfectly.
    if (!this.originalCardContent) {
      this.originalCardContent = this.completionContainer.innerHTML;
    }
    this.boundStartSurvey = this.startSurvey.bind(this);
  }

  /**
   * Renders the custom navigation buttons (Next/Finish) based on the
   * current page of the survey.
   * @private
   */
  _renderCustomNav () {
    this.customNavContainer.innerHTML = ''
    let navButton
    if (this.survey.isLastPage) {
      navButton = `<span id="survey-complete-btn" style="cursor: pointer;"><i class="fas fa-chevron-circle-up fa-3x"></i></span>`
      this.customNavContainer.innerHTML = navButton
      document
        .getElementById('survey-complete-btn')
        .addEventListener('click', () => this.survey.completeLastPage())
    } else {
      navButton = `<span id="survey-next-btn" style="cursor: pointer;"><i class="fas fa-chevron-circle-right fa-3x"></i></span>`
      this.customNavContainer.innerHTML = navButton
      document
        .getElementById('survey-next-btn')
        .addEventListener('click', () => this.survey.nextPage())
    }
  }
}