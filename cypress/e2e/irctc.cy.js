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
    // VALIDATE QUOTA CONFIG
    // ============================================================

    if (TATKAL && PREMIUM_TATKAL) {
      expect(
        false,
        'Make sure either TATKAL or PREMIUM_TATKAL is true, not both.'
      ).to.be.true
    }


    // ============================================================
    // OPEN IRCTC
    // ============================================================

    cy.clearCookies()
    cy.clearLocalStorage()

    cy.viewport(1478, 1056)

    cy.visit('https://www.irctc.co.in/nget/train-search', {
      failOnStatusCode: false,
      timeout: 90000
    })

    cy.task('log', 'Website Fetching completed.........')


    // ============================================================
    // WELCOME POPUP
    // ============================================================

    cy.get('body', { timeout: 30000 }).then(($body) => {

      const englishButton = $body
        .find('button')
        .filter((i, el) => {
          return (
            Cypress.$(el).text().trim() === 'English' &&
            Cypress.$(el).is(':visible')
          )
        })

      if (englishButton.length) {
        cy.wrap(englishButton.first()).click({ force: true })
      }

    })


    // ============================================================
    // LOGIN
    // ============================================================

    cy.get('input[placeholder="User Name"]', {
      timeout: 30000
    })
      .should('be.visible')
      .clear()
      .type(username, { log: false })


    cy.get('input[placeholder="Password"]', {
      timeout: 30000
    })
      .should('be.visible')
      .clear()
      .type(password, { log: false })


    // ============================================================
    // CAPTCHA + LOGIN
    // ============================================================

    cy.submitCaptcha().then(() => {

      cy.task('log', 'Login completed.........')


      // ============================================================
      // CLOSE LAST TRANSACTION POPUP IF PRESENT
      // ============================================================

      cy.get('body').then(($body) => {

        if ($body.text().includes('Your Last Transaction')) {

          cy.contains(
            'button',
            /OK|Close/i
          )
            .filter(':visible')
            .first()
            .click({ force: true })

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


      // ------------------------------------------------------------
      // FROM
      // ------------------------------------------------------------

      cy.get('#origin input', {
        timeout: 30000
      })
        .should('be.visible')
        .clear()
        .type(SOURCE_STATION, {
          delay: 100
        })


      // Select station suggestion
      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click()


      // ------------------------------------------------------------
      // TO
      // ------------------------------------------------------------

      cy.get('#destination input', {
        timeout: 30000
      })
        .should('be.visible')
        .clear()
        .type(DESTINATION_STATION, {
          delay: 100
        })


      // Select station suggestion
      cy.get('body')
        .find(
          '[role="option"]:visible, .ui-autocomplete-list-item:visible'
        )
        .first()
        .should('be.visible')
        .click()


      // ============================================================
      // JOURNEY DATE
      // ============================================================

      cy.get('body').then(($body) => {

        if ($body.find('#journeyDate input:visible').length) {

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
      // CLASS
      //
      // IMPORTANT:
      // DO NOT CHANGE PAGE-1 CLASS.
      //
      // It must remain:
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

      cy.get('button.train_Search', {
        timeout: 30000
      })
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
      // FIND THE CORRECT TRAIN CONTAINER
      // ============================================================

      cy.get('.bull-back', {
        timeout: 30000
      })
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
      // SL
      //
      // 3E IS INTENTIONALLY NOT USED.
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
          code: 'SL',
          label: 'Sleeper (SL)'
        }
      ]


      function selectAvailableClass(index) {

        if (index >= classPriority.length) {

          throw new Error(
            `No available class found for train ${TRAIN_NO}. Checked: 1A, 2A, 3A and SL.`
          )

        }


        const currentClass =
          classPriority[index]


        cy.task(
          'log',
          `Checking ${currentClass.code} availability...`
        )


        // ========================================================
        // SELECT CLASS TAB INSIDE THIS TRAIN
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


        // Wait for IRCTC to update availability
        cy.wait(1500)


        // ========================================================
        // CHECK AVAILABILITY ONLY INSIDE TARGET TRAIN
        // ========================================================

        cy.get('@targetTrain').then(($train) => {

          const available = $train
            .find('.AVAILABLE:visible')
            .filter((i, element) => {

              const text = Cypress.$(element)
                .text()
                .replace(/\s+/g, ' ')
                .trim()
                .toUpperCase()

              return text.includes('AVAILABLE')

            })


          // ======================================================
          // CLASS AVAILABLE
          // ======================================================

          if (available.length > 0) {

            cy.task(
              'log',
              `${currentClass.code} AVAILABLE`
            )


            cy.wrap(available)
              .first()
              .closest('.pre-avl')
              .click({
                force: true
              })


            // ====================================================
            // BOOK NOW
            // ====================================================

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
              `BOOK NOW clicked for ${currentClass.code}`
            )


          } else {

            // ====================================================
            // NOT AVAILABLE
            // ====================================================

            cy.task(
              'log',
              `${currentClass.code} NOT AVAILABLE`
            )

            selectAvailableClass(index + 1)

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


        // --------------------------------------------------------
        // ADD PASSENGER
        // --------------------------------------------------------

        if (i > 0) {

          cy.get(
            '.pull-left > a > :nth-child(1)'
          )
            .filter(':visible')
            .click()

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
          .type(passenger.NAME)


        // --------------------------------------------------------
        // AGE
        // --------------------------------------------------------

        cy.get(
          'input[formcontrolname="passengerAge"]'
        )
          .filter(':visible')
          .eq(i)
          .clear()
          .type(String(passenger.AGE))


        // --------------------------------------------------------
        // GENDER
        // --------------------------------------------------------

        cy.get(
          'select[formcontrolname="passengerGender"]'
        )
          .filter(':visible')
          .eq(i)
          .select(passenger.GENDER)


        // --------------------------------------------------------
        // BERTH
        // --------------------------------------------------------

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


      // ============================================================
      // UPI PAYMENT OPTION
      // ============================================================

      cy.get('#\\32  > .ui-radiobutton > .ui-radiobutton-box')
        .filter(':visible')
        .click({
          force: true
        })


      // ============================================================
      // NEXT
      // ============================================================

      cy.get('.train_Search')
        .filter(':visible')
        .last()
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
        // PAYMENT
        // ========================================================

        cy.get(':nth-child(3) > .col-pad')
          .filter(':visible')
          .click()


        cy.get(
          '.col-sm-9 > app-bank > #bank-type'
        )
          .filter(':visible')
          .click()


        cy.get(
          '.col-sm-9 > app-bank > #bank-type > :nth-child(2) > table > tr > :nth-child(1) > .col-lg-12 > .border-all > .col-xs-12 > .col-pad'
        )
          .filter(':visible')
          .click()


        // ========================================================
        // PAY & BOOK
        // ========================================================

        cy.get('.btn')
          .filter(':visible')
          .contains(/Pay|Book/i)
          .first()
          .click()


        // ========================================================
        // UPI
        // ========================================================

        cy.viewport(460, 760)


        cy.intercept(
          '/theia/processTransaction?orderid=*'
        ).as('payment')


        cy.wait('@payment', {
          timeout: 200000
        }).then(() => {

          if (UPI_ID_CONFIG) {

            cy.get('#ptm-upi')
              .filter(':visible')
              .click()


            cy.get(
              '.brdr-box > :nth-child(2) > ._1WLd > :nth-child(1) > .xs-hover-box > ._Mzth > .form-ctrl'
            )
              .filter(':visible')
              .type(UPI_ID_CONFIG)


            cy.get(
              ':nth-child(5) > section > .btn'
            )
              .filter(':visible')
              .click()


            // Give user time to complete UPI payment
            cy.wait(120000)

          }

        })

      })

    })

  })

})
