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


// ================================================================
// IGNORE IRCTC FRONTEND EXCEPTIONS
// ================================================================

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})


// ================================================================
// HELPER
// Convert DD/MM/YYYY into possible IRCTC date labels
// Example:
// 05/10/2026 -> ["5 Oct", "05 Oct"]
// 16/10/2026 -> ["16 Oct", "16 Oct"]
// ================================================================

function getTargetDateVariants(dateString) {

  const [dayRaw, monthRaw, yearRaw] =
    dateString.split('/')

  const day = parseInt(dayRaw, 10)
  const month = parseInt(monthRaw, 10)

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

  return [
    `${day} ${months[month - 1]}`,
    `${String(day).padStart(2, '0')} ${months[month - 1]}`
  ]
}


// ================================================================
// HELPER
// Determine whether an availability card belongs to target date
// ================================================================

function isTargetDateCard($card, dateVariants) {

  const cardText = Cypress.$($card)
    .text()
    .replace(/\s+/g, ' ')
    .trim()

  return dateVariants.some((date) => {
    return cardText.includes(date)
  })
}


// ================================================================
// MAIN TEST
// ================================================================

describe('IRCTC TATKAL BOOKING', () => {

  it('Tatkal Booking Begins......', () => {


    // ============================================================
    // VALIDATE CONFIGURATION
    // ============================================================

    expect(
      SOURCE_STATION,
      'SOURCE_STATION must be configured'
    ).to.exist

    expect(
      DESTINATION_STATION,
      'DESTINATION_STATION must be configured'
    ).to.exist

    expect(
      TRAIN_NO,
      'TRAIN_NO must be configured'
    ).to.exist

    expect(
      TRAVEL_DATE,
      'TRAVEL_DATE must be configured'
    ).to.exist


    if (TATKAL && PREMIUM_TATKAL) {

      throw new Error(
        'TATKAL and PREMIUM_TATKAL cannot both be true.'
      )

    }


    if (!TATKAL && !PREMIUM_TATKAL) {

      throw new Error(
        'Either TATKAL or PREMIUM_TATKAL must be true.'
      )

    }


    const targetDateVariants =
      getTargetDateVariants(TRAVEL_DATE)


    cy.task(
      'log',
      `TARGET JOURNEY DATE: ${TRAVEL_DATE}`
    )

    cy.task(
      'log',
      `IRCTC DATE CARD TO SELECT: ${targetDateVariants.join(' / ')}`
    )


    // ============================================================
    // OPEN IRCTC
    // ============================================================

    cy.clearCookies()

    cy.clearLocalStorage()

    // Keep enough width for IRCTC but the login code below also
    // supports the responsive/mobile header used by CI.
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

      const englishButton =
        $body
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
          'English welcome button found.........'
        )

        cy.wrap(
          englishButton.first()
        ).click({
          force: true
        })

      } else {

        cy.task(
          'log',
          'English already selected.........'
        )

      }

    })


    // ============================================================
    // OPEN LOGIN / REGISTER
    //
    // Desktop:
    // a[aria-label="Click here to Login in application"]
    //
    // Mobile/CI:
    // hamburger menu
    //       ↓
    // LOGIN / REGISTER button
    // ============================================================

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )


    cy.get(
      'body',
      {
        timeout: 30000
      }
    ).then(($body) => {

      const desktopLogin =
        $body.find(
          'a[aria-label="Click here to Login in application"]'
        ).length


      const mobileMenu =
        $body.find(
          '.h_container_sm .h_menu_drop_button'
        ).length


      const mobileLogin =
        $body.find(
          '.h_container_sm button.search_btn'
        ).length


      cy.task(
        'log',
        `Desktop login count: ${desktopLogin}`
      )

      cy.task(
        'log',
        `Mobile menu count: ${mobileMenu}`
      )

      cy.task(
        'log',
        `Mobile login count: ${mobileLogin}`
      )


      // ==========================================================
      // DESKTOP HEADER
      // ==========================================================

      if (desktopLogin > 0) {

        cy.task(
          'log',
          'Desktop header detected.........'
        )


        cy.get(
          'a[aria-label="Click here to Login in application"]',
          {
            timeout: 30000
          }
        )
          .filter(':visible')
          .first()
          .click({
            force: true
          })


        cy.task(
          'log',
          'Desktop LOGIN / REGISTER clicked.........'
        )


      }

      // ==========================================================
      // MOBILE / TABLET HEADER
      // ==========================================================

      else {

        cy.task(
          'log',
          'Mobile/tablet header detected.........'
        )


        cy.get(
          '.h_container_sm .h_menu_drop_button',
          {
            timeout: 30000
          }
        )
          .first()
          .click({
            force: true
          })


        cy.task(
          'log',
          'Hamburger menu clicked.........'
        )


        cy.contains(
          'button.search_btn',
          'LOGIN / REGISTER',
          {
            timeout: 30000
          }
        )
          .first()
          .click({
            force: true
          })


        cy.task(
          'log',
          'Mobile LOGIN / REGISTER clicked.........'
        )

      }

    })


    // ============================================================
    // LOGIN PAGE
    // ============================================================

    cy.task(
      'log',
      'Waiting for login form.........'
    )


    cy.get(
      'input[placeholder="User Name"]',
      {
        timeout: 30000
      }
    )
      .should('be.visible')
      .clear()
      .type(
        username,
        {
          log: false
        }
      )


    cy.get(
      'input[placeholder="Password"]',
      {
        timeout: 30000
      }
    )
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


    // ============================================================
    // FIRST CAPTCHA + LOGIN
    // ============================================================

    cy.submitCaptcha().then(() => {

      cy.task(
        'log',
        'Login completed.........'
      )


      // ==========================================================
      // CLOSE LAST TRANSACTION POPUP IF PRESENT
      // ==========================================================

      cy.get('body').then(($body) => {

        if (
          $body.text().includes(
            'Your Last Transaction'
          )
        ) {

          cy.task(
            'log',
            'Last transaction popup detected.........'
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


          cy.task(
            'log',
            'Last transaction popup closed.........'
          )

        }

      })


      // ==========================================================
      // PAGE 1
      // TRAIN SEARCH
      // ==========================================================

      cy.task(
        'log',
        `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
      )


      // ==========================================================
      // FROM STATION
      // ==========================================================

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


      cy.task(
        'log',
        `Source entered: ${SOURCE_STATION}`
      )


      // Select autocomplete suggestion

      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click({
          force: true
        })


      // ==========================================================
      // TO STATION
      // ==========================================================

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


      cy.task(
        'log',
        `Destination entered: ${DESTINATION_STATION}`
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


      // ==========================================================
      // JOURNEY DATE
      // ==========================================================

      cy.get('body').then(($body) => {

        const journeyDate =
          $body.find(
            '#journeyDate input:visible'
          )

        const jDate =
          $body.find(
            '#jDate input:visible'
          )


        if (journeyDate.length > 0) {

          cy.get(
            '#journeyDate input'
          )
            .filter(':visible')
            .first()
            .click()
            .clear()
            .type(TRAVEL_DATE)


        } else if (jDate.length > 0) {

          cy.get(
            '#jDate input'
          )
            .filter(':visible')
            .first()
            .click()
            .clear()
            .type(TRAVEL_DATE)


        } else {

          throw new Error(
            'Could not find IRCTC journey date input.'
          )

        }

      })


      cy.task(
        'log',
        `Journey date entered: ${TRAVEL_DATE}`
      )


      // ==========================================================
      // PAGE 1 CLASS
      //
      // MUST REMAIN ALL CLASSES
      // ==========================================================

      cy.get(
        '#journeyClass',
        {
          timeout: 30000
        }
      )
        .should('be.visible')


      cy.task(
        'log',
        'Page 1 class kept as ALL CLASSES.........'
      )


      // ==========================================================
      // QUOTA
      // ==========================================================

      if (TATKAL) {

        cy.get(
          '#journeyQuota',
          {
            timeout: 30000
          }
        )
          .should('be.visible')
          .click()


        cy.get(
          '.ui-dropdown-panel'
        )
          .filter(':visible')
          .contains(
            '.ui-dropdown-item',
            'TATKAL'
          )
          .click()


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
          .should('be.visible')
          .click()


        cy.get(
          '.ui-dropdown-panel'
        )
          .filter(':visible')
          .contains(
            '.ui-dropdown-item',
            'PREMIUM TATKAL'
          )
          .click()


        cy.task(
          'log',
          'Quota selected: PREMIUM TATKAL'
        )

      }


      // ==========================================================
      // SEARCH TRAINS
      // ==========================================================

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


      // ==========================================================
      // PAGE 2
      // WAIT FOR TRAIN
      // ==========================================================

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
        `Train found: GOA EXPRESS (${TRAIN_NO})`
      )


      // ==========================================================
      // FIND TARGET TRAIN CONTAINER
      // ==========================================================

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


      cy.get(
        '@targetTrain'
      )
        .should('exist')


      // ==========================================================
      // CLASS PRIORITY
      //
      // 1A → 2A → 3A → 3E → SL
      // ==========================================================

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


      // ==========================================================
      // CLASS SEARCH FUNCTION
      // ==========================================================

      function selectAvailableClass(index) {

        if (
          index >= classPriority.length
        ) {

          throw new Error(
            `No available class found for train ${TRAIN_NO} on ${TRAVEL_DATE}. Checked 1A, 2A, 3A, 3E and SL.`
          )

        }


        const currentClass =
          classPriority[index]


        cy.task(
          'log',
          `Checking ${currentClass.code} availability.........`
        )


        // ========================================================
        // SELECT CLASS TAB
        // ========================================================

        cy.get(
          '@targetTrain'
        )
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


        // Give IRCTC time to update availability

        cy.wait(1500)


        // ========================================================
        // CHECK TARGET DATE
        // ========================================================

        cy.get(
          '@targetTrain'
        ).then(($train) => {


          const availabilityCards =
            $train.find(
              '.pre-avl'
            )


          let targetCard = null


          for (
            let i = 0;
            i < availabilityCards.length;
            i++
          ) {

            const card =
              availabilityCards[i]


            if (
              isTargetDateCard(
                card,
                targetDateVariants
              )
            ) {

              targetCard = card

              break

            }

          }


          // ======================================================
          // TARGET DATE NOT FOUND
          // ======================================================

          if (!targetCard) {

            cy.task(
              'log',
              `${currentClass.code}: target date ${TRAVEL_DATE} not found`
            )


            selectAvailableClass(
              index + 1
            )

            return

          }


          const targetText =
            Cypress.$(targetCard)
              .text()
              .replace(/\s+/g, ' ')
              .trim()


          cy.task(
            'log',
            `${currentClass.code} target card: ${targetText}`
          )


          // ======================================================
          // CHECK AVAILABILITY
          // ======================================================

          const available =
            Cypress.$(targetCard)
              .find('.AVAILABLE')
              .filter((i, element) => {

                const text =
                  Cypress.$(element)
                    .text()
                    .replace(/\s+/g, ' ')
                    .trim()
                    .toUpperCase()


                return text.includes(
                  'AVAILABLE'
                )

              })


          // ======================================================
          // AVAILABLE
          // ======================================================

          if (available.length > 0) {

            cy.task(
              'log',
              `${currentClass.code} AVAILABLE for ${TRAVEL_DATE}`
            )


            cy.wrap(targetCard)
              .click({
                force: true
              })


            // ====================================================
            // BOOK NOW
            // ====================================================

            cy.get(
              '@targetTrain'
            )
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
              `BOOK NOW clicked for ${currentClass.code}`
            )


          }

          // ======================================================
          // NOT AVAILABLE
          // ======================================================

          else {

            cy.task(
              'log',
              `${currentClass.code} NOT AVAILABLE for ${TRAVEL_DATE}`
            )


            selectAvailableClass(
              index + 1
            )

          }

        })

      }


      // ==========================================================
      // START CLASS SEARCH
      // ==========================================================

      selectAvailableClass(0)


      // ==========================================================
      // PASSENGER PAGE
      // ==========================================================

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


      // ==========================================================
      // BOARDING STATION
      // ==========================================================

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
          .click()


        cy.contains(
          'li.ui-dropdown-item',
          BOARDING_STATION
        )
          .filter(':visible')
          .first()
          .click()


      } else {

        cy.task(
          'log',
          'Boarding station not configured; keeping default.'
        )

      }


      // ==========================================================
      // PASSENGER DETAILS
      // ==========================================================

      for (
        let i = 0;
        i < PASSENGER_DETAILS.length;
        i++
      ) {

        const passenger =
          PASSENGER_DETAILS[i]


        cy.task(
          'log',
          `Entering passenger ${i + 1}: ${passenger.NAME}`
        )


        // --------------------------------------------------------
        // ADD PASSENGER
        // --------------------------------------------------------

        if (i > 0) {

          cy.get(
            '.pull-left > a > :nth-child(1)'
          )
            .filter(':visible')
            .click({
              force: true
            })

        }


        // --------------------------------------------------------
        // NAME
        // --------------------------------------------------------

        cy.get(
          '.ui-autocomplete input'
        )
          .filter(':visible')
          .eq(i)
          .clear()
          .type(
            passenger.NAME
          )


        // --------------------------------------------------------
        // AGE
        // --------------------------------------------------------

        cy.get(
          'input[formcontrolname="passengerAge"]'
        )
          .filter(':visible')
          .eq(i)
          .clear()
          .type(
            String(passenger.AGE)
          )


        // --------------------------------------------------------
        // GENDER
        // --------------------------------------------------------

        cy.get(
          'select[formcontrolname="passengerGender"]'
        )
          .filter(':visible')
          .eq(i)
          .select(
            passenger.GENDER
          )


        // --------------------------------------------------------
        // BERTH / SEAT
        // --------------------------------------------------------

        cy.get(
          'select[formcontrolname="passengerBerthChoice"]'
        )
          .filter(':visible')
          .eq(i)
          .select(
            passenger.SEAT
          )

      }


      // ==========================================================
      // FOOD
      // ==========================================================

      cy.get('body').then(($body) => {

        const foodSelector =
          'select[formcontrolname="passengerFoodChoice"]'


        if (
          $body.find(foodSelector).length > 0
        ) {

          PASSENGER_DETAILS.forEach(
            (passenger, index) => {

              cy.get(
                foodSelector
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

        } else {

          cy.task(
            'log',
            'Food selection not present.........'
          )

        }

      })


      // ==========================================================
      // OPTIONAL BOOKING OPTIONS
      // ==========================================================

      cy.get('body').then(($body) => {


        if (
          $body.text().includes(
            'Book only if confirm berths are allotted'
          )
        ) {

          cy.contains(
            'Book only if confirm berths are allotted'
          )
            .click({
              force: true
            })

        }


        if (
          $body.text().includes(
            'Consider for Auto Upgradation.'
          )
        ) {

          cy.contains(
            'Consider for Auto Upgradation.'
          )
            .click({
              force: true
            })

        }

      })


      // ==========================================================
      // UPI PAYMENT OPTION
      //
      // Select the UPI payment method only.
      // We DO NOT enter the UPI ID here.
      // ==========================================================

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


      // ==========================================================
      // CONTINUE
      // ==========================================================

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


      // ==========================================================
      // FOOD CONFIRMATION POPUP
      // ==========================================================

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


          cy.task(
            'log',
            'Food confirmation popup closed.........'
          )

        }

      })


      // ==========================================================
      // SECOND CAPTCHA
      // ==========================================================

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
        // STOP BEFORE PAYMENT
        // ========================================================

        cy.task(
          'log',
          '================================================'
        )

        cy.task(
          'log',
          'TEST STOP POINT REACHED'
        )

        cy.task(
          'log',
          'Pay & Book will NOT be clicked.'
        )

        cy.task(
          'log',
          'UPI ID will NOT be entered.'
        )

        cy.task(
          'log',
          'No payment will be submitted.'
        )

        cy.task(
          'log',
          '================================================'
        )


        // ========================================================
        // FINAL ASSERTION
        // ========================================================

        cy.get('body')
          .should('exist')


      })

    })

  })

})
