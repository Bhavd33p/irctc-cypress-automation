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

    /*
     * Keep the AUT viewport below 1303 so that IRCTC renders
     * the mobile/small header.
     *
     * We intentionally use the hamburger menu for LOGIN / REGISTER.
     */
    cy.viewport(1280, 720)

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
        cy.wrap(englishButton.first())
          .click({ force: true })
      }

    })


    // ============================================================
    // LOGIN / REGISTER
    // MOBILE HEADER -> HAMBURGER -> LOGIN / REGISTER
    // ============================================================

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )

    // Open hamburger
    cy.get('.h_container_sm .h_menu_drop_button')
      .filter(':visible')
      .first()
      .should('be.visible')
      .click({ force: true })

    cy.task(
      'log',
      'Hamburger menu opened.........'
    )

    // Login button inside opened sidebar
    cy.contains(
      'button.search_btn',
      'LOGIN / REGISTER',
      {
        timeout: 30000
      }
    )
      .filter(':visible')
      .first()
      .should('be.visible')
      .click({ force: true })

    cy.task(
      'log',
      'LOGIN / REGISTER clicked.........'
    )


    // ============================================================
    // LOGIN FORM
    // ============================================================

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
      .type(username, {
        log: false
      })


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
      .type(password, {
        log: false
      })


    // ============================================================
    // CAPTCHA + LOGIN
    // ============================================================

    cy.task(
      'log',
      'Solving login captcha.........'
    )

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
      // PAGE 1
      // TRAIN SEARCH
      // ==========================================================

      cy.task(
        'log',
        `Searching ${SOURCE_STATION} → ${DESTINATION_STATION}`
      )


      // ----------------------------------------------------------
      // FROM
      // ----------------------------------------------------------

      cy.get('#origin input', {
        timeout: 30000
      })
        .should('be.visible')
        .clear()
        .type(SOURCE_STATION, {
          delay: 100
        })


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

      cy.get('#destination input', {
        timeout: 30000
      })
        .should('be.visible')
        .clear()
        .type(DESTINATION_STATION, {
          delay: 100
        })


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


      cy.task(
        'log',
        `Journey date selected: ${TRAVEL_DATE}`
      )


      // ==========================================================
      // CLASS
      //
      // IMPORTANT:
      // PAGE 1 MUST REMAIN ALL CLASSES
      // ==========================================================

      cy.get('#journeyClass')
        .should('be.visible')

      cy.task(
        'log',
        'Page 1 class kept as ALL CLASSES'
      )


      // ==========================================================
      // QUOTA
      // ==========================================================

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

        cy.task(
          'log',
          'Quota selected: TATKAL'
        )
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

        cy.task(
          'log',
          'Quota selected: PREMIUM TATKAL'
        )
      }


      // ==========================================================
      // SEARCH
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
      // FIND GOA EXPRESS
      // ==========================================================

      cy.contains(
        '.train-heading strong',
        `GOA EXPRESS (${TRAIN_NO})`,
        {
          timeout: 90000
        }
      )
        .should('be.visible')


      // ==========================================================
      // FIND TARGET TRAIN
      // ==========================================================

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


      // ==========================================================
      // TARGET DATE
      //
      // Convert DD/MM/YYYY -> 5 Oct / 05 Oct
      // ==========================================================

      function getTargetDateVariants(dateString) {

        const parts = dateString.split('/')

        if (parts.length !== 3) {
          throw new Error(
            `Invalid TRAVEL_DATE: ${dateString}. Expected DD/MM/YYYY.`
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

        if (
          month < 1 ||
          month > 12 ||
          Number.isNaN(day)
        ) {
          throw new Error(
            `Invalid TRAVEL_DATE: ${dateString}`
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
        `Target journey date: ${TRAVEL_DATE}`
      )

      cy.task(
        'log',
        `IRCTC date card to select: ${targetDateVariants.join(' / ')}`
      )


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
      // FIND AVAILABLE TARGET DATE
      // ==========================================================

      function findAvailableTargetDate($train) {

        const cards = $train
          .find('.pre-avl')
          .filter(':visible')


        for (
          let i = 0;
          i < cards.length;
          i++
        ) {

          const $card =
            Cypress.$(cards[i])


          const text =
            $card
              .text()
              .replace(/\s+/g, ' ')
              .trim()


          const dateMatches =
            targetDateVariants.some(
              variant =>
                text.includes(variant)
            )


          const available =
            $card.find('.AVAILABLE').length > 0


          if (
            dateMatches &&
            available
          ) {

            return $card

          }

        }

        return null

      }


      // ==========================================================
      // CLASS SELECTION
      // ==========================================================

      function selectAvailableClass(index) {

        if (
          index >=
          classPriority.length
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


        // --------------------------------------------------------
        // SELECT CLASS TAB
        // --------------------------------------------------------

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


        cy.wait(1500)


        // --------------------------------------------------------
        // CHECK ONLY TARGET DATE
        // --------------------------------------------------------

        cy.get('@targetTrain')
          .then(($train) => {

            const targetCard =
              findAvailableTargetDate(
                $train
              )


            if (targetCard) {

              cy.task(
                'log',
                `${currentClass.code} AVAILABLE on ${TRAVEL_DATE}`
              )


              // Click target date card
              cy.wrap(targetCard)
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
                .filter(':visible')
                .should('not.be.disabled')
                .click({
                  force: true
                })


              cy.task(
                'log',
                `BOOK NOW clicked for ${currentClass.code}`
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
        // BERTH
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


      // ==========================================================
      // CONTINUE
      // ==========================================================

      cy.get('.train_Search')
        .filter(':visible')
        .last()
        .click({
          force: true
        })


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
          'TEST STOP: Payment page reached. Pay & Book NOT clicked.'
        )

        cy.log(
          'TEST STOP — Pay & Book intentionally not clicked.'
        )

      })

    })

  })

})
