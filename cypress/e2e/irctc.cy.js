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
// DATE HELPER
//
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

  if (
    !day ||
    !month ||
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      `Invalid TRAVEL_DATE: ${dateString}. Expected DD/MM/YYYY.`
    )
  }

  return [
    `${day} ${months[month - 1]}`,
    `${String(day).padStart(2, '0')} ${months[month - 1]}`
  ]
}


// ================================================================
// CHECK WHETHER AVAILABILITY CARD IS FOR TARGET DATE
// ================================================================

function isTargetDateCard($card, dateVariants) {

  const cardText =
    Cypress.$($card)
      .text()
      .replace(/\s+/g, ' ')
      .trim()

  return dateVariants.some((date) => {
    return cardText.includes(date)
  })
}


// ================================================================
// TEST
// ================================================================

describe('IRCTC TATKAL BOOKING', () => {

  it('Tatkal Booking Begins......', () => {


    // ============================================================
    // CONFIG VALIDATION
    // ============================================================

    if (!username) {
      throw new Error(
        'USERNAME environment variable is missing.'
      )
    }

    if (!password) {
      throw new Error(
        'PASSWORD environment variable is missing.'
      )
    }

    if (!SOURCE_STATION) {
      throw new Error(
        'SOURCE_STATION is missing from passenger_data.json.'
      )
    }

    if (!DESTINATION_STATION) {
      throw new Error(
        'DESTINATION_STATION is missing from passenger_data.json.'
      )
    }

    if (!TRAIN_NO) {
      throw new Error(
        'TRAIN_NO is missing from passenger_data.json.'
      )
    }

    if (!TRAVEL_DATE) {
      throw new Error(
        'TRAVEL_DATE is missing from passenger_data.json.'
      )
    }


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
      '================================================'
    )

    cy.task(
      'log',
      'IRCTC TATKAL BOOKING'
    )

    cy.task(
      'log',
      `TRAIN NO: ${TRAIN_NO}`
    )

    cy.task(
      'log',
      `TRAIN COACH: ${TRAIN_COACH}`
    )

    cy.task(
      'log',
      `SOURCE: ${SOURCE_STATION}`
    )

    cy.task(
      'log',
      `DESTINATION: ${DESTINATION_STATION}`
    )

    cy.task(
      'log',
      `TARGET JOURNEY DATE: ${TRAVEL_DATE}`
    )

    cy.task(
      'log',
      `IRCTC DATE CARD: ${targetDateVariants.join(' / ')}`
    )

    cy.task(
      'log',
      `TATKAL: ${TATKAL}`
    )

    cy.task(
      'log',
      `PREMIUM TATKAL: ${PREMIUM_TATKAL}`
    )

    cy.task(
      'log',
      '================================================'
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
    // WAIT FOR PAGE BODY
    // ============================================================

    cy.get(
      'body',
      {
        timeout: 60000
      }
    )
      .should('exist')


    cy.task(
      'log',
      'IRCTC body loaded.........'
    )


    // ============================================================
    // WELCOME POPUP
    // ============================================================

    cy.get(
      'body',
      {
        timeout: 60000
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
          'Welcome popup detected.........'
        )


        cy.wrap(
          englishButton.first()
        ).click({
          force: true
        })


        cy.task(
          'log',
          'English selected.........'
        )

      } else {

        cy.task(
          'log',
          'Welcome popup not present.........'
        )

      }

    })


    // ============================================================
    // LOGIN / REGISTER
    //
    // DO NOT DETECT DESKTOP/MOBILE HEADER.
    //
    // IRCTC uses:
    //
    // Desktop:
    // <a class="search_btn loginText">
    //
    // Mobile:
    // <button class="search_btn">
    //
    // Both contain:
    // LOGIN / REGISTER
    //
    // Therefore we directly search for .search_btn + text.
    // ============================================================

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )


    cy.contains(
      '.search_btn',
      'LOGIN / REGISTER',
      {
        timeout: 60000
      }
    )
      .should('exist')
      .should('be.visible')
      .click({
        force: true
      })


    cy.task(
      'log',
      'LOGIN / REGISTER clicked.........'
    )


    // ============================================================
    // LOGIN FORM
    // ============================================================

    cy.task(
      'log',
      'Waiting for login form.........'
    )


    cy.get(
      'input[placeholder="User Name"]',
      {
        timeout: 60000
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
        timeout: 60000
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
      // LAST TRANSACTION POPUP
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
        '================================================'
      )

      cy.task(
        'log',
        `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
      )

      cy.task(
        'log',
        `Journey date: ${TRAVEL_DATE}`
      )

      cy.task(
        'log',
        'Page 1 class: ALL CLASSES'
      )

      cy.task(
        'log',
        TATKAL
          ? 'Quota: TATKAL'
          : 'Quota: PREMIUM TATKAL'
      )

      cy.task(
        'log',
        '================================================'
      )


      // ==========================================================
      // FROM
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


      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click({
          force: true
        })


      cy.task(
        'log',
        `Source selected: ${SOURCE_STATION}`
      )


      // ==========================================================
      // TO
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


      cy.task(
        'log',
        `Destination selected: ${DESTINATION_STATION}`
      )


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
            .type(
              TRAVEL_DATE
            )


        } else if (jDate.length > 0) {

          cy.get(
            '#jDate input'
          )
            .filter(':visible')
            .first()
            .click()
            .clear()
            .type(
              TRAVEL_DATE
            )


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
      // IMPORTANT:
      // KEEP ALL CLASSES.
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
          'TATKAL quota selected.........'
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
          'PREMIUM TATKAL quota selected.........'
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
      // WAIT FOR TARGET TRAIN
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
      // TARGET TRAIN CONTAINER
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
      // SELECT AVAILABLE CLASS
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


        cy.wait(1500)


        // ========================================================
        // FIND TARGET DATE CARD
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
              `${currentClass.code}: ${TRAVEL_DATE} date card not found`
            )


            selectAvailableClass(
              index + 1
            )


            return

          }


          const targetCardText =
            Cypress.$(targetCard)
              .text()
              .replace(/\s+/g, ' ')
              .trim()


          cy.task(
            'log',
            `${currentClass.code} target card: ${targetCardText}`
          )


          // ======================================================
          // CHECK AVAILABLE
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

          if (
            available.length > 0
          ) {

            cy.task(
              'log',
              `${currentClass.code} AVAILABLE for ${TRAVEL_DATE}`
            )


            cy.wrap(
              targetCard
            )
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


        cy.task(
          'log',
          `Boarding station selected: ${BOARDING_STATION}`
        )

      } else {

        cy.task(
          'log',
          'Boarding station not configured; keeping default.........'
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

      cy.get(
        'body'
      ).then(($body) => {

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

      cy.get(
        'body'
      ).then(($body) => {


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
      // SELECT UPI PAYMENT METHOD
      //
      // We select the payment method but DO NOT:
      // - click Pay & Book
      // - enter UPI ID
      // - submit payment
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

      cy.get(
        'body'
      ).then(($body) => {

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
        // FINAL TEST STOP
        //
        // DO NOT CLICK PAY & BOOK.
        // DO NOT ENTER UPI.
        // DO NOT SUBMIT PAYMENT.
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
          `Journey: ${SOURCE_STATION} → ${DESTINATION_STATION}`
        )

        cy.task(
          'log',
          `Train: ${TRAIN_NO}`
        )

        cy.task(
          'log',
          `Configured date: ${TRAVEL_DATE}`
        )

        cy.task(
          'log',
          'Pay & Book NOT clicked.'
        )

        cy.task(
          'log',
          'UPI ID NOT entered.'
        )

        cy.task(
          'log',
          'Payment NOT submitted.'
        )

        cy.task(
          'log',
          '================================================'
        )


        cy.get(
          'body'
        )
          .should('exist')

      })

    })

  })

})
