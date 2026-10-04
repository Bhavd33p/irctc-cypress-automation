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


// ================================================================
// IGNORE IRCTC FRONTEND EXCEPTIONS
// ================================================================

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('[IRCTC EXCEPTION]', err.message)
  return false
})


// ================================================================
// DATE HELPER
// ================================================================

function getTargetDateVariants(dateString) {

  const [dayRaw, monthRaw] =
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
// CHECK TARGET DATE CARD
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


    // ============================================================
    // INITIAL LOGGING
    // ============================================================

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
      `PASSENGER COUNT: ${PASSENGER_DETAILS.length}`
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

    cy.viewport(1478, 900)

    cy.task(
      'log',
      'Cypress viewport set to 1478 x 900'
    )

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
    // ACTUAL BROWSER SIZE
    // ============================================================

    cy.window().then((win) => {

      cy.task(
        'log',
        `window.innerWidth = ${win.innerWidth}`
      )

      cy.task(
        'log',
        `window.innerHeight = ${win.innerHeight}`
      )

      cy.task(
        'log',
        `document.clientWidth = ${win.document.documentElement.clientWidth}`
      )

      cy.task(
        'log',
        `document.clientHeight = ${win.document.documentElement.clientHeight}`
      )

      cy.task(
        'log',
        `devicePixelRatio = ${win.devicePixelRatio}`
      )

    })


    // ============================================================
    // BODY
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
    // HEADER DEBUG
    // ============================================================

    cy.get('body').then(($body) => {

      cy.task(
        'log',
        `Desktop header count = ${
          $body.find('.h_container').length
        }`
      )

      cy.task(
        'log',
        `Mobile/small header count = ${
          $body.find('.h_container_sm').length
        }`
      )

      cy.task(
        'log',
        `Desktop login count = ${
          $body.find(
            'a[aria-label="Click here to Login in application"]'
          ).length
        }`
      )

      cy.task(
        'log',
        `Hamburger count = ${
          $body.find('.h_menu_drop_button').length
        }`
      )

      cy.task(
        'log',
        `Username field count = ${
          $body.find(
            'input[placeholder="User Name"]'
          ).length
        }`
      )

    })


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
        )
          .click({
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
    // ============================================================

    cy.task(
      'log',
      '================================================'
    )

    cy.task(
      'log',
      'Opening LOGIN / REGISTER.........'
    )

    cy.task(
      'log',
      'Looking for desktop login selector...'
    )


    // IMPORTANT:
    // Use the actual desktop IRCTC login anchor.
    //
    // DO NOT use:
    // cy.contains('.search_btn', 'LOGIN / REGISTER')
    //
    // The captured IRCTC DOM exposes:
    // a[aria-label="Click here to Login in application"]

    cy.get(
      'a[aria-label="Click here to Login in application"]',
      {
        timeout: 60000
      }
    )
      .should('exist')
      .then(($login) => {

        cy.task(
          'log',
          `Desktop login element count = ${$login.length}`
        )

        cy.task(
          'log',
          `Desktop login visible = ${$login.is(':visible')}`
        )

        cy.task(
          'log',
          `Desktop login text = "${$login.text().trim()}"`
        )

      })
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


    cy.task(
      'log',
      'Username entered.........'
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
      'Password entered.........'
    )


    // ============================================================
    // FIRST CAPTCHA + LOGIN
    // ============================================================

    cy.task(
      'log',
      'Starting login captcha.........'
    )

    cy.submitCaptcha().then(() => {

      cy.task(
        'log',
        'Login captcha completed.........'
      )

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

        } else {

          cy.task(
            'log',
            'Last transaction popup not present.........'
          )

        }

      })


      // ==========================================================
      // PAGE 1
      // ==========================================================

      cy.task(
        'log',
        '================================================'
      )

      cy.task(
        'log',
        'PAGE 1 - TRAIN SEARCH'
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

      cy.task(
        'log',
        `Entering source station: ${SOURCE_STATION}`
      )

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

      cy.task(
        'log',
        `Entering destination: ${DESTINATION_STATION}`
      )

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

      cy.task(
        'log',
        `Setting journey date: ${TRAVEL_DATE}`
      )

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

          cy.task(
            'log',
            'Using #journeyDate input'
          )

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

          cy.task(
            'log',
            'Using #jDate input'
          )

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
      // CLASS
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

        cy.task(
          'log',
          'Selecting TATKAL quota.........'
        )

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

        cy.task(
          'log',
          'Selecting PREMIUM TATKAL quota.........'
        )

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

      cy.task(
        'log',
        'Clicking Search Trains.........'
      )

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
      // ==========================================================

      cy.task(
        'log',
        '================================================'
      )

      cy.task(
        'log',
        'PAGE 2 - TRAIN RESULTS'
      )

      cy.task(
        'log',
        `Waiting for GOA EXPRESS (${TRAIN_NO}).........`
      )


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
      // TARGET TRAIN
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


      cy.task(
        'log',
        'Target train container identified.........'
      )


      // ==========================================================
      // CLASS PRIORITY
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


        cy.task(
          'log',
          `${currentClass.code} tab clicked.........`
        )


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


          cy.task(
            'log',
            `${currentClass.code}: found ${availabilityCards.length} availability cards`
          )


          let targetCard = null


          for (
            let i = 0;
            i < availabilityCards.length;
            i++
          ) {

            const card =
              availabilityCards[i]


            const cardText =
              Cypress.$(card)
                .text()
                .replace(/\s+/g, ' ')
                .trim()


            cy.task(
              'log',
              `${currentClass.code} card ${i}: ${cardText.substring(0, 250)}`
            )


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
              `${currentClass.code}: ${TRAVEL_DATE} target date card NOT FOUND`
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
            `${currentClass.code} TARGET DATE CARD: ${targetCardText}`
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


            cy.task(
              'log',
              `${currentClass.code} target date card selected.`
            )


            // ====================================================
            // BOOK NOW
            // ====================================================

            cy.task(
              'log',
              `Looking for Book Now button for ${currentClass.code}...`
            )


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

          } else {

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

      cy.task(
        'log',
        'Starting class search: 1A → 2A → 3A → 3E → SL'
      )

      selectAvailableClass(0)


      // ==========================================================
      // PASSENGER PAGE
      // ==========================================================

      cy.task(
        'log',
        'Waiting for passenger page.........'
      )

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


        cy.task(
          'log',
          `Passenger ${i + 1} completed.........`
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


        const foodCount =
          $body.find(foodSelector).length


        cy.task(
          'log',
          `Food dropdown count: ${foodCount}`
        )


        if (
          foodCount > 0
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

          cy.task(
            'log',
            'Confirm-berth-only option selected.........'
          )

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

          cy.task(
            'log',
            'Auto-upgradation option selected.........'
          )

        }

      })


      // ==========================================================
      // SELECT UPI PAYMENT METHOD
      //
      // We select the method only.
      //
      // DO NOT:
      // - enter UPI ID
      // - click Pay & Book
      // - submit payment
      // ==========================================================

      cy.task(
        'log',
        'Selecting UPI payment option.........'
      )


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

      cy.task(
        'log',
        'Looking for Continue button.........'
      )


      cy.get(
        '.train_Search'
      )
        .filter(':visible')
        .last()
        .then(($button) => {

          cy.task(
            'log',
            `Continue button text: "${$button.text().trim()}"`
          )

        })
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


          cy.task(
            'log',
            'Food confirmation popup closed.........'
          )

        } else {

          cy.task(
            'log',
            'Food confirmation popup not present.........'
          )

        }

      })


      // ==========================================================
      // SECOND CAPTCHA
      // ==========================================================

      cy.task(
        'log',
        '================================================'
      )

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
        // FINAL STOP
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
