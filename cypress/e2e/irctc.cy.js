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
  BOARDING_STATION
} from '../fixtures/passenger_data.json'


// ============================================================
// IGNORE IRCTC FRONTEND EXCEPTIONS
// ============================================================

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})


// ============================================================
// HELPERS
// ============================================================

function getTargetDateVariants(dateString) {

  const parts = dateString.split('/')

  if (parts.length !== 3) {
    throw new Error(
      `Invalid TRAVEL_DATE "${dateString}". Expected DD/MM/YYYY.`
    )
  }

  const day = parseInt(parts[0], 10)
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

  if (Number.isNaN(day) || Number.isNaN(month)) {
    throw new Error(
      `Invalid TRAVEL_DATE "${dateString}".`
    )
  }

  if (month < 1 || month > 12) {
    throw new Error(
      `Invalid month in TRAVEL_DATE "${dateString}".`
    )
  }

  return [
    `${day} ${months[month - 1]}`,
    `${String(day).padStart(2, '0')} ${months[month - 1]}`
  ]
}


function normalizeText(text) {

  return text
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()

}


function getTargetDateRegex(dateString) {

  const variants = getTargetDateVariants(dateString)

  const escaped = variants.map((value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })

  return new RegExp(
    `(?:${escaped.join('|')})`,
    'i'
  )

}


// ============================================================
// TEST
// ============================================================

describe('IRCTC TATKAL BOOKING', () => {

  it('Tatkal Booking Begins......', () => {


    // ==========================================================
    // VALIDATE QUOTA
    // ==========================================================

    if (TATKAL && PREMIUM_TATKAL) {

      throw new Error(
        'Make sure either TATKAL or PREMIUM_TATKAL is true, not both.'
      )

    }


    if (!TATKAL && !PREMIUM_TATKAL) {

      throw new Error(
        'Either TATKAL or PREMIUM_TATKAL must be true.'
      )

    }


    // ==========================================================
    // LOG CONFIG
    // ==========================================================

    const targetDateVariants =
      getTargetDateVariants(TRAVEL_DATE)

    const targetDateRegex =
      getTargetDateRegex(TRAVEL_DATE)

    cy.task(
      'log',
      `TARGET JOURNEY DATE: ${TRAVEL_DATE}`
    )

    cy.task(
      'log',
      `IRCTC DATE CARD TO SELECT: ${targetDateVariants.join(' / ')}`
    )


    // ==========================================================
    // OPEN IRCTC
    // ==========================================================

    cy.clearCookies()

    cy.clearLocalStorage()

    // Keep viewport compatible with CI.
    // This intentionally allows IRCTC's responsive header.
    cy.viewport(1280, 720)

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


    // ==========================================================
    // WELCOME POPUP
    // ==========================================================

    cy.get('body', {
      timeout: 30000
    })
      .then(($body) => {

        const englishButton = $body
          .find('button')
          .filter((i, el) => {

            const text =
              Cypress.$(el)
                .text()
                .trim()

            return (
              text === 'English' &&
              Cypress.$(el).is(':visible')
            )

          })

        if (englishButton.length > 0) {

          cy.task(
            'log',
            'English language popup detected.'
          )

          cy.wrap(
            englishButton.first()
          )
            .click({
              force: true
            })

        } else {

          cy.task(
            'log',
            'English already selected.........'
          )

        }

      })


    // ==========================================================
    // LOGIN / REGISTER
    //
    // Supports:
    //
    // 1. Desktop:
    //    LOGIN / REGISTER directly visible
    //
    // 2. Responsive:
    //    Hamburger menu
    //        ↓
    //    LOGIN / REGISTER
    // ==========================================================

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )


    cy.get('body', {
      timeout: 30000
    })
      .then(($body) => {

        const desktopLogin =
          $body.find(
            'a[aria-label="Click here to Login in application"]:visible'
          )

        if (desktopLogin.length > 0) {

          // ----------------------------------------------------
          // DESKTOP HEADER
          // ----------------------------------------------------

          cy.task(
            'log',
            'Desktop LOGIN / REGISTER detected.'
          )

          cy.wrap(
            desktopLogin.first()
          )
            .click({
              force: true
            })

        } else {

          // ----------------------------------------------------
          // RESPONSIVE HEADER
          // ----------------------------------------------------

          cy.task(
            'log',
            'Responsive header detected. Opening hamburger menu.........'
          )

          cy.get(
            '.h_menu_drop_button.moblogo',
            {
              timeout: 30000
            }
          )
            .filter(':visible')
            .should('exist')
            .find('a')
            .first()
            .click({
              force: true
            })


          cy.task(
            'log',
            'Hamburger menu opened.........'
          )


          // ----------------------------------------------------
          // LOGIN / REGISTER INSIDE RESPONSIVE MENU
          // ----------------------------------------------------

          cy.contains(
            'LOGIN / REGISTER',
            {
              timeout: 30000
            }
          )
            .filter(':visible')
            .first()
            .should('be.visible')
            .click({
              force: true
            })

        }

      })


    // ==========================================================
    // LOGIN FORM
    // ==========================================================

    cy.task(
      'log',
      'Waiting for login form.........'
    )


    // ----------------------------------------------------------
    // USERNAME
    // ----------------------------------------------------------

    cy.get(
      'input[formcontrolname="userid"], input[placeholder="User Name"]',
      {
        timeout: 30000
      }
    )
      .filter(':visible')
      .first()
      .should('be.visible')
      .clear()
      .type(
        username,
        {
          log: false
        }
      )


    // ----------------------------------------------------------
    // PASSWORD
    // ----------------------------------------------------------

    cy.get(
      'input[formcontrolname="password"], input[placeholder="Password"]',
      {
        timeout: 30000
      }
    )
      .filter(':visible')
      .first()
      .should('be.visible')
      .clear()
      .type(
        password,
        {
          log: false
        }
      )


    cy.task(
      'log',
      'Username and password entered.........'
    )


    // ==========================================================
    // FIRST CAPTCHA + LOGIN
    // ==========================================================

    cy.submitCaptcha()
      .then(() => {

        cy.task(
          'log',
          'Login completed.........'
        )


        // ======================================================
        // CLOSE LAST TRANSACTION POPUP
        // ======================================================

        cy.get('body')
          .then(($body) => {

            if (
              $body.text()
                .includes('Your Last Transaction')
            ) {

              cy.task(
                'log',
                'Last Transaction popup detected.........'
              )

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


        // ======================================================
        // PAGE 1
        // TRAIN SEARCH
        // ======================================================

        cy.task(
          'log',
          `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
        )


        // ======================================================
        // FROM
        // ======================================================

        cy.get(
          '#origin input',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .first()
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
          .click({
            force: true
          })


        // ======================================================
        // TO
        // ======================================================

        cy.get(
          '#destination input',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .first()
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
          .click({
            force: true
          })


        // ======================================================
        // JOURNEY DATE
        // ======================================================

        cy.get('body')
          .then(($body) => {

            if (
              $body.find(
                '#journeyDate input:visible'
              ).length > 0
            ) {

              cy.get(
                '#journeyDate input'
              )
                .filter(':visible')
                .first()
                .click()
                .clear()
                .type(TRAVEL_DATE)

            } else {

              cy.get(
                '#jDate input'
              )
                .filter(':visible')
                .first()
                .click()
                .clear()
                .type(TRAVEL_DATE)

            }

          })


        cy.task(
          'log',
          `Journey date set to ${TRAVEL_DATE}`
        )


        // ======================================================
        // PAGE 1 CLASS
        //
        // MUST REMAIN ALL CLASSES
        // ======================================================

        cy.get(
          '#journeyClass',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .should('exist')


        cy.task(
          'log',
          'Page 1 class kept as ALL CLASSES'
        )


        // ======================================================
        // QUOTA
        // ======================================================

        if (TATKAL) {

          cy.get(
            '#journeyQuota',
            {
              timeout: 30000
            }
          )
            .filter(':visible')
            .should('be.visible')
            .click({
              force: true
            })


          cy.get(
            '.ui-dropdown-panel'
          )
            .filter(':visible')
            .contains(
              '.ui-dropdown-item',
              'TATKAL'
            )
            .click({
              force: true
            })


          cy.task(
            'log',
            'Quota selected: TATKAL'
          )

        }


        if (PREMIUM_TATKAL) {

          cy.get(
            '#journeyQuota',
            {
              timeout: 30000
            }
          )
            .filter(':visible')
            .should('be.visible')
            .click({
              force: true
            })


          cy.get(
            '.ui-dropdown-panel'
          )
            .filter(':visible')
            .contains(
              '.ui-dropdown-item',
              'PREMIUM TATKAL'
            )
            .click({
              force: true
            })


          cy.task(
            'log',
            'Quota selected: PREMIUM TATKAL'
          )

        }


        // ======================================================
        // SEARCH TRAINS
        // ======================================================

        cy.get(
          'button.train_Search',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .contains('Search Trains')
          .should('be.visible')
          .click({
            force: true
          })


        cy.task(
          'log',
          'Train search submitted.........'
        )


        // ======================================================
        // PAGE 2
        // WAIT FOR TRAIN
        // ======================================================

        cy.contains(
          '.train-heading strong',
          `GOA EXPRESS (${TRAIN_NO})`,
          {
            timeout: 90000
          }
        )
          .should('be.visible')


        cy.task(
          'log',
          `GOA EXPRESS (${TRAIN_NO}) found.........`
        )


        // ======================================================
        // FIND TARGET TRAIN CONTAINER
        // ======================================================

        cy.get(
          '.bull-back',
          {
            timeout: 30000
          }
        )
          .filter((index, element) => {

            const text =
              Cypress.$(element)
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


        // ======================================================
        // CLASS PRIORITY
        //
        // 1A → 2A → 3A → 3E → SL
        // ======================================================

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


        // ======================================================
        // CLASS SEARCH FUNCTION
        // ======================================================

        function selectAvailableClass(index) {

          if (
            index >= classPriority.length
          ) {

            throw new Error(
              `No available class found for train ${TRAIN_NO} on ${TRAVEL_DATE}. Checked: 1A, 2A, 3A, 3E and SL.`
            )

          }


          const currentClass =
            classPriority[index]


          cy.task(
            'log',
            `Checking ${currentClass.code} availability.........`
          )


          // ====================================================
          // SELECT CLASS TAB
          // ====================================================

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


          // Give IRCTC time to refresh availability
          cy.wait(1500)


          // ====================================================
          // CHECK TARGET DATE ONLY
          // ====================================================

          cy.get('@targetTrain')
            .then(($train) => {

              let matchingDateCard = null


              $train
                .find('.pre-avl')
                .each((i, element) => {

                  if (matchingDateCard) {
                    return
                  }


                  const card =
                    Cypress.$(element)


                  const cardText =
                    normalizeText(
                      card.text()
                    )


                  // ------------------------------------------------
                  // DATE MUST MATCH CONFIGURED TRAVEL_DATE
                  // ------------------------------------------------

                  const dateMatches =
                    targetDateVariants.some(
                      (variant) => {

                        return cardText.includes(
                          normalizeText(variant)
                        )

                      }
                    )


                  if (!dateMatches) {
                    return
                  }


                  // ------------------------------------------------
                  // CHECK AVAILABLE
                  // ------------------------------------------------

                  const availableText =
                    card
                      .find('.AVAILABLE')
                      .text()


                  const isAvailable =
                    normalizeText(
                      availableText
                    )
                      .includes('AVAILABLE')


                  if (isAvailable) {

                    matchingDateCard =
                      card

                  }

                })


              // ==================================================
              // TARGET DATE + AVAILABLE
              // ==================================================

              if (matchingDateCard) {

                cy.task(
                  'log',
                  `${currentClass.code} AVAILABLE on ${targetDateVariants[0]}`
                )


                cy.wrap(
                  matchingDateCard
                )
                  .should('be.visible')
                  .click({
                    force: true
                  })


                // =================================================
                // BOOK NOW
                // =================================================

                cy.get('@targetTrain')
                  .contains(
                    'button',
                    'Book Now',
                    {
                      timeout: 30000
                    }
                  )
                  .filter(':visible')
                  .should('be.visible')
                  .should('not.be.disabled')
                  .click({
                    force: true
                  })


                cy.task(
                  'log',
                  `BOOK NOW clicked for ${currentClass.code}`
                )


              } else {

                // =================================================
                // NOT AVAILABLE FOR TARGET DATE
                // =================================================

                cy.task(
                  'log',
                  `${currentClass.code} NOT AVAILABLE on ${targetDateVariants[0]}`
                )


                selectAvailableClass(
                  index + 1
                )

              }

            })

        }


        // ======================================================
        // START CLASS SEARCH
        // ======================================================

        selectAvailableClass(0)


        // ======================================================
        // WAIT FOR PASSENGER PAGE
        // ======================================================

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


        // ======================================================
        // BOARDING STATION
        // ======================================================

        if (BOARDING_STATION) {

          cy.task(
            'log',
            `Selecting boarding station: ${BOARDING_STATION}`
          )


          cy.get(
            '.ui-dropdown.ui-widget.ui-corner-all'
          )
            .filter(':visible')
            .first()
            .click({
              force: true
            })


          cy.contains(
            'li.ui-dropdown-item',
            BOARDING_STATION
          )
            .filter(':visible')
            .first()
            .click({
              force: true
            })

        }


        // ======================================================
        // PASSENGER DETAILS
        // ======================================================

        for (
          let i = 0;
          i < PASSENGER_DETAILS.length;
          i++
        ) {

          const passenger =
            PASSENGER_DETAILS[i]


          // ====================================================
          // ADD PASSENGER
          // ====================================================

          if (i > 0) {

            cy.get(
              '.pull-left > a > :nth-child(1)'
            )
              .filter(':visible')
              .click({
                force: true
              })

          }


          // ====================================================
          // NAME
          // ====================================================

          cy.get(
            '.ui-autocomplete input'
          )
            .filter(':visible')
            .eq(i)
            .clear()
            .type(
              passenger.NAME
            )


          // ====================================================
          // AGE
          // ====================================================

          cy.get(
            'input[formcontrolname="passengerAge"]'
          )
            .filter(':visible')
            .eq(i)
            .clear()
            .type(
              String(passenger.AGE)
            )


          // ====================================================
          // GENDER
          // ====================================================

          cy.get(
            'select[formcontrolname="passengerGender"]'
          )
            .filter(':visible')
            .eq(i)
            .select(
              passenger.GENDER
            )


          // ====================================================
          // BERTH
          // ====================================================

          cy.get(
            'select[formcontrolname="passengerBerthChoice"]'
          )
            .filter(':visible')
            .eq(i)
            .select(
              passenger.SEAT
            )


          cy.task(
            'log',
            `Passenger ${i + 1} details entered.`
          )

        }


        // ======================================================
        // FOOD
        // ======================================================

        cy.get('body')
          .then(($body) => {

            const foodSelectors =
              'select[formcontrolname="passengerFoodChoice"]'


            if (
              $body.find(foodSelectors).length > 0
            ) {

              PASSENGER_DETAILS.forEach(
                (passenger, index) => {

                  cy.get(
                    foodSelectors
                  )
                    .filter(':visible')
                    .eq(index)
                    .select(
                      passenger.FOOD
                    )

                }
              )


              cy.task(
                'log',
                'Food preferences selected.........'
              )

            }

          })


        // ======================================================
        // OPTIONAL BOOKING OPTIONS
        // ======================================================

        cy.get('body')
          .then(($body) => {

            const bodyText =
              $body.text()


            if (
              bodyText.includes(
                'Book only if confirm berths are allotted'
              )
            ) {

              cy.contains(
                'Book only if confirm berths are allotted'
              )
                .filter(':visible')
                .click({
                  force: true
                })

            }


            if (
              bodyText.includes(
                'Consider for Auto Upgradation.'
              )
            ) {

              cy.contains(
                'Consider for Auto Upgradation.'
              )
                .filter(':visible')
                .click({
                  force: true
                })

            }

          })


        // ======================================================
        // UPI PAYMENT OPTION
        //
        // Only select payment mode.
        // DO NOT ENTER PAYMENT / DO NOT PAY.
        // ======================================================

        cy.get(
          '#\\32  > .ui-radiobutton > .ui-radiobutton-box'
        )
          .filter(':visible')
          .click({
            force: true
          })


        cy.task(
          'log',
          'UPI payment option selected.........'
        )


        // ======================================================
        // CONTINUE
        // ======================================================

        cy.get(
          '.train_Search'
        )
          .filter(':visible')
          .last()
          .click({
            force: true
          })


        cy.task(
          'log',
          'Continue clicked.........'
        )


        // ======================================================
        // FOOD CONFIRMATION POPUP
        // ======================================================

        cy.get('body')
          .then(($body) => {

            if (
              $body.text()
                .includes(
                  'Enhance Your Travel with Taste'
                )
            ) {

              cy.task(
                'log',
                'Food confirmation popup detected.........'
              )


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


        // ======================================================
        // SECOND CAPTCHA
        // ======================================================

        cy.task(
          'log',
          'Solving Second Stage Captcha.........'
        )


        cy.solveCaptcha()
          .then(() => {

            cy.task(
              'log',
              'Second Stage Captcha solved.........'
            )


            // ==================================================
            // IMPORTANT SAFETY STOP
            // ==================================================
            //
            // DO NOT CLICK:
            //
            // Pay & Book
            //
            // DO NOT:
            //
            // - enter UPI ID
            // - wait for payment gateway
            // - submit payment
            //
            // The automation stops here.
            // ==================================================

            cy.task(
              'log',
              'SECOND CAPTCHA COMPLETE.'
            )

            cy.task(
              'log',
              'AUTOMATION STOPPED BEFORE PAY & BOOK.'
            )


            cy.log(
              'TEST STOPPED BEFORE PAYMENT / FINAL BOOKING'
            )

          })

      })

  })

})
