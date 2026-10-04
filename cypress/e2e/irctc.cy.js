let username = Cypress.env('USERNAME')
let password = Cypress.env('PASSWORD')

import {
  PASSENGER_DETAILS,
  SOURCE_STATION,
  DESTINATION_STATION,
  TRAIN_NO,
  TRAIN_COACH,
  TRAVEL_DATE,
  TATKAL,
  PREMIUM_TATKAL,
  BOARDING_STATION,
  UPI_ID_CONFIG
} from '../fixtures/passenger_data.json'


// ============================================================
// GLOBAL CYPRESS ERROR HANDLING
// ============================================================

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})


// ============================================================
// HELPER
//
// Converts:
// 16/10/2026
//
// into:
// 16 Oct
//
// IRCTC availability cards look like:
// Fri, 16 Oct
// Sat, 17 Oct
// ============================================================

function getTargetDateText(dateString) {

  const parts = dateString.split('/')

  if (parts.length !== 3) {
    throw new Error(
      `Invalid TRAVEL_DATE format: ${dateString}. Expected DD/MM/YYYY.`
    )
  }

  const day = parts[0].padStart(2, '0')
  const month = parseInt(parts[1], 10)

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]

  if (month < 1 || month > 12) {
    throw new Error(
      `Invalid month in TRAVEL_DATE: ${dateString}`
    )
  }

  return `${day} ${months[month - 1]}`
}


describe('IRCTC TATKAL BOOKING', () => {

  it('Tatkal Booking Begins......', () => {


    // ============================================================
    // VALIDATE QUOTA CONFIG
    // ============================================================

    if (TATKAL && PREMIUM_TATKAL) {

      expect(
        false,
        'Make sure either TATKAL or PREMIUM_TATKAL is true, not both.'
      ).to.be.true
    }


    // ============================================================
    // VALIDATE CONFIG
    // ============================================================

    expect(
      username,
      'USERNAME secret must be configured'
    ).to.exist

    expect(
      password,
      'PASSWORD secret must be configured'
    ).to.exist

    expect(
      TRAIN_NO,
      'TRAIN_NO must be configured'
    ).to.exist

    expect(
      TRAVEL_DATE,
      'TRAVEL_DATE must be configured'
    ).to.exist


    const targetDateText =
      getTargetDateText(TRAVEL_DATE)


    cy.task(
      'log',
      `TARGET JOURNEY DATE: ${TRAVEL_DATE}`
    )

    cy.task(
      'log',
      `IRCTC DATE CARD TO SELECT: ${targetDateText}`
    )


    // ============================================================
    // OPEN IRCTC
    // ============================================================

    cy.clearCookies()
    cy.clearLocalStorage()

    cy.viewport(1478, 1056)

    cy.visit(
      'https://www.irctc.co.in/nget/train-search',
      {
        failOnStatusCode: false,
        timeout: 90000
      }
    )

    cy.task(
      'log',
      'Website Fetching completed.........'
    )


    // ============================================================
    // WELCOME POPUP
    // ============================================================

    cy.get(
      'body',
      {
        timeout: 30000
      }
    ).then(($body) => {

      const englishButton = $body
        .find('button')
        .filter((i, el) => {

          return (
            Cypress.$(el).text().trim() === 'English' &&
            Cypress.$(el).is(':visible')
          )

        })

      if (englishButton.length) {

        cy.wrap(
          englishButton.first()
        ).click({
          force: true
        })

      }

    })


    // ============================================================
    // LOGIN
    // ============================================================

    cy.get(
      'input[placeholder="User Name"]',
      {
        timeout: 30000
      }
    )
      .should('be.visible')
      .clear()
      .type(username, {
        log: false
      })


    cy.get(
      'input[placeholder="Password"]',
      {
        timeout: 30000
      }
    )
      .should('be.visible')
      .clear()
      .type(password, {
        log: false
      })


    // ============================================================
    // FIRST CAPTCHA + LOGIN
    // ============================================================

    cy.submitCaptcha().then(() => {

      cy.task(
        'log',
        'Login completed.........'
      )


      // ============================================================
      // CLOSE LAST TRANSACTION POPUP IF PRESENT
      // ============================================================

      cy.get('body').then(($body) => {

        if (
          $body.text().includes(
            'Your Last Transaction'
          )
        ) {

          cy.contains(
            'button',
            /OK|Close/i
          )
            .filter(':visible')
            .first()
            .click({
              force: true
            })

        }

      })


      // ============================================================
      // PAGE 1
      // TRAIN SEARCH
      // ============================================================

      cy.task(
        'log',
        `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
      )


      // ============================================================
      // FROM
      // ============================================================

      cy.get(
        '#origin input',
        {
          timeout: 30000
        }
      )
        .should('be.visible')
        .clear()
        .type(
          SOURCE_STATION,
          {
            delay: 100
          }
        )


      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click()


      // ============================================================
      // TO
      // ============================================================

      cy.get(
        '#destination input',
        {
          timeout: 30000
        }
      )
        .should('be.visible')
        .clear()
        .type(
          DESTINATION_STATION,
          {
            delay: 100
          }
        )


      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click()


      // ============================================================
      // JOURNEY DATE
      //
      // TRAVEL_DATE:
      // 16/10/2026
      // ============================================================

      cy.get('body').then(($body) => {

        if (
          $body.find(
            '#journeyDate input:visible'
          ).length
        ) {

          cy.get('#journeyDate input')
            .filter(':visible')
            .first()
            .click()
            .clear()
            .type(TRAVEL_DATE)

        } else {

          cy.get('#jDate input')
            .filter(':visible')
            .first()
            .click()
            .clear()
            .type(TRAVEL_DATE)

        }

      })


      // ============================================================
      // PAGE 1 CLASS
      //
      // MUST REMAIN:
      // ALL CLASSES
      // ============================================================

      cy.get('#journeyClass')
        .should('be.visible')

      cy.task(
        'log',
        'Page 1 class kept as ALL CLASSES'
      )


      // ============================================================
      // QUOTA
      // ============================================================

      if (TATKAL) {

        cy.get('#journeyQuota')
          .should('be.visible')
          .click()

        cy.get('.ui-dropdown-panel')
          .filter(':visible')
          .contains(
            '.ui-dropdown-item',
            'TATKAL'
          )
          .click()

      }


      if (PREMIUM_TATKAL) {

        cy.get('#journeyQuota')
          .should('be.visible')
          .click()

        cy.get('.ui-dropdown-panel')
          .filter(':visible')
          .contains(
            '.ui-dropdown-item',
            'PREMIUM TATKAL'
          )
          .click()

      }


      // ============================================================
      // SEARCH
      // ============================================================

      cy.get(
        'button.train_Search',
        {
          timeout: 30000
        }
      )
        .contains('Search Trains')
        .should('be.visible')
        .click()


      cy.task(
        'log',
        'Train search submitted.........'
      )


      // ============================================================
      // PAGE 2
      // FIND TRAIN
      // ============================================================

      cy.contains(
        '.train-heading strong',
        `GOA EXPRESS (${TRAIN_NO})`,
        {
          timeout: 90000
        }
      )
        .should('be.visible')


      // ============================================================
      // FIND CORRECT TRAIN CONTAINER
      // ============================================================

      cy.get(
        '.bull-back',
        {
          timeout: 30000
        }
      )
        .filter((index, element) => {

          const text = Cypress.$(element)
            .text()
            .replace(/\s+/g, ' ')
            .trim()

          return text.includes(
            `GOA EXPRESS (${TRAIN_NO})`
          )

        })
        .first()
        .as('targetTrain')


      cy.get('@targetTrain')
        .should('exist')


      // ============================================================
      // CLASS PRIORITY
      //
      // 1A
      // ↓
      // 2A
      // ↓
      // 3A
      // ↓
      // 3E
      // ↓
      // SL
      //
      // ONLY THE TARGET TRAVEL DATE IS CONSIDERED.
      // ============================================================

      const classPriority = [

        {
          code: '1A',
          label: 'AC First Class (1A)'
        },

        {
          code: '2A',
          label: 'AC 2 Tier (2A)'
        },

        {
          code: '3A',
          label: 'AC 3 Tier (3A)'
        },

        {
          code: '3E',
          label: 'AC 3 Economy (3E)'
        },

        {
          code: 'SL',
          label: 'Sleeper (SL)'
        }

      ]


      // ============================================================
      // SELECT AVAILABLE CLASS
      //
      // IMPORTANT:
      //
      // DO NOT:
      //
      // .find('.AVAILABLE').first()
      //
      // because IRCTC can show:
      //
      // 15 Oct → AVAILABLE
      // 16 Oct → AVAILABLE
      // 17 Oct → AVAILABLE
      //
      // We ONLY want TRAVEL_DATE.
      // ============================================================

      function selectAvailableClass(index) {

        if (
          index >= classPriority.length
        ) {

          throw new Error(
            `No available class found for ${TRAIN_NO} on ${TRAVEL_DATE}. Checked: 1A, 2A, 3A, 3E and SL.`
          )

        }


        const currentClass =
          classPriority[index]


        cy.task(
          'log',
          `Checking ${currentClass.code} for ${targetDateText}...`
        )


        // ========================================================
        // SELECT CLASS TAB
        // ========================================================

        cy.get('@targetTrain')
          .contains(
            '.ui-tabmenuitem',
            currentClass.label,
            {
              timeout: 30000
            }
          )
          .filter(':visible')
          .first()
          .click({
            force: true
          })


        // Wait for IRCTC to refresh availability.

        cy.wait(1500)


        // ========================================================
        // FIND ONLY THE TARGET DATE CARD
        // ========================================================

        cy.get('@targetTrain')
          .then(($train) => {

            const targetDateCards =
              $train
                .find('.pre-avl:visible')
                .filter((i, element) => {

                  const cardText =
                    Cypress.$(element)
                      .text()
                      .replace(/\s+/g, ' ')
                      .trim()

                  return cardText.includes(
                    targetDateText
                  )

                })


            // ====================================================
            // TARGET DATE NOT FOUND
            // ====================================================

            if (
              targetDateCards.length === 0
            ) {

              cy.task(
                'log',
                `${currentClass.code}: ${targetDateText} card not found`
              )

              selectAvailableClass(
                index + 1
              )

              return
            }


            // ====================================================
            // CHECK AVAILABILITY ON TARGET DATE ONLY
            // ====================================================

            const availableTargetCards =
              targetDateCards.filter(
                (i, element) => {

                  const card =
                    Cypress.$(element)

                  const cardText =
                    card
                      .text()
                      .replace(/\s+/g, ' ')
                      .trim()
                      .toUpperCase()

                  return (
                    card.find(
                      '.AVAILABLE:visible'
                    ).length > 0 &&
                    cardText.includes(
                      'AVAILABLE'
                    )
                  )

                }
              )


            // ====================================================
            // TARGET DATE AVAILABLE
            // ====================================================

            if (
              availableTargetCards.length > 0
            ) {

              cy.task(
                'log',
                `${currentClass.code} AVAILABLE on ${targetDateText}`
              )


              // --------------------------------------------------
              // CLICK ONLY TARGET DATE
              // --------------------------------------------------

              cy.wrap(
                availableTargetCards.first()
              )
                .click({
                  force: true
                })


              // --------------------------------------------------
              // BOOK NOW
              // --------------------------------------------------

              cy.get('@targetTrain')
                .contains(
                  'button',
                  'Book Now',
                  {
                    timeout: 30000
                  }
                )
                .should('be.visible')
                .should('not.be.disabled')
                .click({
                  force: true
                })


              cy.task(
                'log',
                `BOOK NOW clicked for ${currentClass.code} on ${targetDateText}`
              )

            }


            // ====================================================
            // TARGET DATE NOT AVAILABLE
            // ====================================================

            else {

              cy.task(
                'log',
                `${currentClass.code} NOT AVAILABLE on ${targetDateText}`
              )


              selectAvailableClass(
                index + 1
              )

            }

          })

      }


      // ============================================================
      // START CLASS SEARCH
      // ============================================================

      selectAvailableClass(0)


      // ============================================================
      // WAIT FOR PASSENGER PAGE
      // ============================================================

      cy.get(
        '.dull-back.train-Header',
        {
          timeout: 90000
        }
      )
        .should('be.visible')


      cy.task(
        'log',
        'Passenger page opened.........'
      )


      // ============================================================
      // BOARDING STATION
      // ============================================================

      if (BOARDING_STATION) {

        cy.get(
          '.ui-dropdown.ui-widget.ui-corner-all'
        )
          .filter(':visible')
          .first()
          .click()


        cy.contains(
          'li.ui-dropdown-item',
          BOARDING_STATION
        )
          .filter(':visible')
          .first()
          .click()

      }


      // ============================================================
      // PASSENGER DETAILS
      // ============================================================

      for (
        let i = 0;
        i < PASSENGER_DETAILS.length;
        i++
      ) {

        const passenger =
          PASSENGER_DETAILS[i]


        // ========================================================
        // ADD PASSENGER
        // ========================================================

        if (i > 0) {

          cy.get(
            '.pull-left > a > :nth-child(1)'
          )
            .filter(':visible')
            .click({
              force: true
            })

        }


        // ========================================================
        // NAME
        // ========================================================

        cy.get(
          'input[placeholder="Full Name as per Govt. ID"]',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .eq(i)
          .clear()
          .type(passenger.NAME)


        // ========================================================
        // AGE
        // ========================================================

        cy.get(
          'input[formcontrolname="passengerAge"]'
        )
          .filter(':visible')
          .eq(i)
          .clear()
          .type(
            String(passenger.AGE)
          )


        // ========================================================
        // GENDER
        //
        // Female -> F
        // Male   -> M
        // Trans  -> T
        // ========================================================

        let genderValue

        if (
          passenger.GENDER === 'Female' ||
          passenger.GENDER === 'F'
        ) {

          genderValue = 'F'

        } else if (
          passenger.GENDER === 'Male' ||
          passenger.GENDER === 'M'
        ) {

          genderValue = 'M'

        } else {

          genderValue = 'T'

        }


        cy.get(
          'select[formcontrolname="passengerGender"]'
        )
          .filter(':visible')
          .eq(i)
          .select(genderValue)


        // ========================================================
        // BERTH
        // ========================================================

        cy.get(
          'select[formcontrolname="passengerBerthChoice"]'
        )
          .filter(':visible')
          .eq(i)
          .select(passenger.SEAT)

      }


      // ============================================================
      // FOOD
      // ============================================================

      cy.get('body').then(($body) => {

        if (
          $body.find(
            'select[formcontrolname="passengerFoodChoice"]'
          ).length > 0
        ) {

          PASSENGER_DETAILS.forEach(
            (passenger, index) => {

              cy.get(
                'select[formcontrolname="passengerFoodChoice"]'
              )
                .filter(':visible')
                .eq(index)
                .select(passenger.FOOD)

            }
          )

        }

      })


      // ============================================================
      // OPTIONAL BOOKING OPTIONS
      // ============================================================

      cy.get('body').then(($body) => {


        // ----------------------------------------------------------
        // BOOK ONLY IF CONFIRM BERTHS
        // ----------------------------------------------------------

        if (
          $body.find(
            '#confirmberths:visible'
          ).length > 0
        ) {

          cy.get('#confirmberths')
            .filter(':visible')
            .click({
              force: true
            })

        }


        // ----------------------------------------------------------
        // AUTO UPGRADATION
        // ----------------------------------------------------------

        if (
          $body.find(
            '#autoUpgradation:visible'
          ).length > 0
        ) {

          cy.get('#autoUpgradation')
            .filter(':visible')
            .click({
              force: true
            })

        }

      })


      // ============================================================
      // PAYMENT OPTION
      //
      // Pay through BHIM/UPI
      // ============================================================

      cy.get('#\\32 ')
        .find('.ui-radiobutton-box')
        .filter(':visible')
        .click({
          force: true
        })


      // ============================================================
      // CONTINUE
      // ============================================================

      cy.contains(
        'button.train_Search',
        'Continue',
        {
          timeout: 30000
        }
      )
        .should('be.visible')
        .click({
          force: true
        })


      // ============================================================
      // FOOD CONFIRMATION POPUP
      // ============================================================

      cy.get('body').then(($body) => {

        if (
          $body.text().includes(
            'Enhance Your Travel with Taste'
          )
        ) {

          cy.get(
            '[icon="fa fa-close"] > .ui-button-text'
          )
            .filter(':visible')
            .first()
            .click({
              force: true
            })

        }

      })


      // ============================================================
      // SECOND CAPTCHA
      // ============================================================

      cy.task(
        'log',
        'Solving Second Stage Captcha.........'
      )


      cy.solveCaptcha().then(() => {

        cy.task(
          'log',
          'Second Stage Captcha solved.........'
        )


        // ========================================================
        // PAYMENT PAGE
        // ========================================================

        cy.task(
          'log',
          'Payment page opened.........'
        )


        // ========================================================
        // SELECT BHIM / UPI / USSD
        // ========================================================

        cy.contains(
          'span.col-pad',
          'BHIM/ UPI/ USSD',
          {
            timeout: 30000
          }
        )
          .should('be.visible')
          .click({
            force: true
          })


        // ========================================================
        // SELECT IRCTC IPAY NEW
        // ========================================================

        cy.get(
          '#bank-type',
          {
            timeout: 30000
          }
        )
          .should('be.visible')


        cy.get('#bank-type')
          .contains(
            '.bank-text',
            'IRCTC iPay New'
          )
          .should('be.visible')
          .click({
            force: true
          })


        // ========================================================
        // FINAL PAYMENT SCREEN
        //
        // STOP HERE.
        //
        // Pay & Book is intentionally NOT clicked automatically.
        // ========================================================

        cy.contains(
          'button',
          'Pay & Book',
          {
            timeout: 30000
          }
        )
          .should('be.visible')


        cy.task(
          'log',
          'READY: Correct train/class/date selected. Payment is ready for manual confirmation.'
        )

      })

    })

  })

})
