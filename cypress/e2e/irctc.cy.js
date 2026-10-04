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


Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})


describe('IRCTC TATKAL BOOKING', () => {

  it('Tatkal Booking Begins......', () => {

    // ============================================================
    // VALIDATE QUOTA
    // ============================================================

    if (TATKAL && PREMIUM_TATKAL) {
      expect(
        false,
        'Make sure either TATKAL or PREMIUM_TATKAL is true, not both.'
      ).to.be.true
    }


    // ============================================================
    // TARGET DATE
    // ============================================================

    function getTargetDateVariants(dateString) {

      const parts = dateString.split('/')

      if (parts.length !== 3) {
        throw new Error(
          `Invalid TRAVEL_DATE: ${dateString}. Expected DD/MM/YYYY`
        )
      }

      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10)

      const months = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
      ]

      if (month < 1 || month > 12) {
        throw new Error(
          `Invalid month in TRAVEL_DATE: ${dateString}`
        )
      }

      return [
        `${day} ${months[month - 1]}`,
        `${String(day).padStart(2, '0')} ${months[month - 1]}`
      ]
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
    // PREFERRED LANGUAGE
    // ============================================================

    cy.task(
      'log',
      'Checking preferred language.........'
    )

    cy.get('body', {
      timeout: 30000
    }).then(($body) => {

      const englishButton = $body
        .find('button')
        .filter((i, el) => {

          return (
            Cypress.$(el).text().trim() === 'English' &&
            Cypress.$(el).is(':visible')
          )

        })

      if (englishButton.length > 0) {

        cy.task(
          'log',
          'English language popup detected.........'
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
          'English already selected.........'
        )

      }

    })


    // ============================================================
    // LOGIN / REGISTER
    // ============================================================

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )

    cy.get(
      'a[aria-label="Click here to Login in application"]',
      {
        timeout: 30000
      }
    )
      .should('be.visible')
      .click()


    cy.task(
      'log',
      'LOGIN / REGISTER clicked.........'
    )


    // ============================================================
    // WAIT FOR LOGIN DIALOG
    // ============================================================

    cy.get(
      'input[formcontrolname="userid"]',
      {
        timeout: 30000
      }
    )
      .should('be.visible')


    cy.task(
      'log',
      'LOGIN dialog opened.........'
    )


    // ============================================================
    // USERNAME
    // ============================================================

    cy.get(
      'input[formcontrolname="userid"]'
    )
      .should('be.visible')
      .clear()
      .type(username, {
        log: false
      })


    // ============================================================
    // PASSWORD
    // ============================================================

    cy.get(
      'input[formcontrolname="password"]'
    )
      .should('be.visible')
      .clear()
      .type(password, {
        log: false
      })


    // ============================================================
    // LOGIN CAPTCHA
    // ============================================================

    cy.task(
      'log',
      'Solving Login Captcha.........'
    )


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


      // ==========================================================
      // WELCOME / TATKAL POPUP
      // ==========================================================

      cy.get('body').then(($body) => {

        const text =
          $body.text()

        if (
          text.includes('Welcome to IRCTC') ||
          text.includes('आईआरसीटीसी में आपका स्वागत है')
        ) {

          cy.task(
            'log',
            'IRCTC Welcome popup detected.........'
          )

          const englishButton =
            $body
              .find('button')
              .filter((i, el) => {

                return (
                  Cypress.$(el)
                    .text()
                    .trim() === 'English' &&
                  Cypress.$(el)
                    .is(':visible')
                )

              })

          if (englishButton.length > 0) {

            cy.wrap(
              englishButton.first()
            ).click({
              force: true
            })

          }

        }

      })


      // ==========================================================
      // PAGE 1 — TRAIN SEARCH
      // ==========================================================

      cy.task(
        'log',
        `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
      )


      // ----------------------------------------------------------
      // FROM
      // ----------------------------------------------------------

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


      // ----------------------------------------------------------
      // TO
      // ----------------------------------------------------------

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


      // ==========================================================
      // JOURNEY DATE
      // ==========================================================

      cy.get('body').then(($body) => {

        if (
          $body.find(
            '#journeyDate input:visible'
          ).length
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


      // ==========================================================
      // PAGE 1 CLASS
      //
      // MUST REMAIN ALL CLASSES
      // ==========================================================

      cy.get(
        '#journeyClass'
      )
        .should('be.visible')


      cy.task(
        'log',
        'Page 1 class kept as ALL CLASSES'
      )


      // ==========================================================
      // QUOTA
      // ==========================================================

      if (TATKAL) {

        cy.get(
          '#journeyQuota'
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

      }


      if (PREMIUM_TATKAL) {

        cy.get(
          '#journeyQuota'
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
      // PAGE 2 — FIND TRAIN
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
        `GOA EXPRESS (${TRAIN_NO}) found.........`
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


      function selectAvailableClass(index) {

        if (
          index >= classPriority.length
        ) {

          throw new Error(
            `No available class found for ${TRAIN_NO}. Checked 1A, 2A, 3A, 3E and SL.`
          )

        }


        const currentClass =
          classPriority[index]


        cy.task(
          'log',
          `Checking ${currentClass.code} availability.........`
        )


        // --------------------------------------------------------
        // SELECT CLASS TAB
        // --------------------------------------------------------

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


        // Give IRCTC time to refresh availability
        cy.wait(1500)


        // --------------------------------------------------------
        // CHECK ONLY TARGET DATE
        // --------------------------------------------------------

        cy.get(
          '@targetTrain'
        ).then(($train) => {

          const dateCards =
            Cypress.$($train)
              .find('.pre-avl:visible')


          let targetAvailableCard = null


          dateCards.each((i, element) => {

            if (targetAvailableCard) {
              return
            }


            const $card =
              Cypress.$(element)


            // Get date from the first visible date line
            const dateText =
              $card
                .find('div')
                .first()
                .text()
                .replace(/\s+/g, ' ')
                .trim()


            const matchesTargetDate =
              targetDateVariants.some(
                variant =>
                  dateText.includes(variant)
              )


            if (!matchesTargetDate) {
              return
            }


            const availability =
              $card
                .find('.AVAILABLE')
                .filter(':visible')


            if (availability.length > 0) {

              targetAvailableCard =
                element

            }

          })


          // ------------------------------------------------------
          // TARGET DATE AVAILABLE
          // ------------------------------------------------------

          if (targetAvailableCard) {

            cy.task(
              'log',
              `${currentClass.code} AVAILABLE on ${TRAVEL_DATE}`
            )


            cy.wrap(
              targetAvailableCard
            )
              .click({
                force: true
              })


            // ----------------------------------------------------
            // BOOK NOW
            // ----------------------------------------------------

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
              .filter(':visible')
              .first()
              .should('not.be.disabled')
              .click({
                force: true
              })


            cy.task(
              'log',
              `BOOK NOW clicked for ${currentClass.code} on ${TRAVEL_DATE}`
            )


          } else {

            cy.task(
              'log',
              `${currentClass.code} NOT AVAILABLE on ${TRAVEL_DATE}`
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
      // WAIT FOR PASSENGER PAGE
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


      // ==========================================================
      // PASSENGER DETAILS
      // ==========================================================

      PASSENGER_DETAILS.forEach(
        (passenger, index) => {

          // ------------------------------------------------------
          // ADD PASSENGER
          // ------------------------------------------------------

          if (index > 0) {

            cy.get(
              '.pull-left > a > :nth-child(1)'
            )
              .filter(':visible')
              .click()

          }


          // ------------------------------------------------------
          // NAME
          // ------------------------------------------------------

          cy.get(
            '.ui-autocomplete input'
          )
            .filter(':visible')
            .eq(index)
            .clear()
            .type(
              passenger.NAME
            )


          // ------------------------------------------------------
          // AGE
          // ------------------------------------------------------

          cy.get(
            'input[formcontrolname="passengerAge"]'
          )
            .filter(':visible')
            .eq(index)
            .clear()
            .type(
              String(passenger.AGE)
            )


          // ------------------------------------------------------
          // GENDER
          // ------------------------------------------------------

          cy.get(
            'select[formcontrolname="passengerGender"]'
          )
            .filter(':visible')
            .eq(index)
            .select(
              passenger.GENDER
            )


          // ------------------------------------------------------
          // BERTH
          // ------------------------------------------------------

          cy.get(
            'select[formcontrolname="passengerBerthChoice"]'
          )
            .filter(':visible')
            .eq(index)
            .select(
              passenger.SEAT
            )

        }
      )


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

              cy.get(foodSelector)
                .filter(':visible')
                .eq(index)
                .select(
                  passenger.FOOD
                )

            }
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
        .should('be.visible')
        .click({
          force: true
        })


      cy.task(
        'log',
        'CONTINUE clicked.........'
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


        // ======================================================
        // TEST STOP
        //
        // IMPORTANT:
        // DO NOT CLICK PAY & BOOK
        // ======================================================

        cy.task(
          'log',
          'TEST STOP: Payment page reached. Pay & Book NOT clicked.'
        )

        cy.log(
          'TEST STOP: Payment page reached. Pay & Book NOT clicked.'
        )

      })

    })

  })

})
