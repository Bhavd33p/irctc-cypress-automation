const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {

      // Allow cy.task('log', 'message')
      on('task', {
        log(message) {
          console.log(message)
          return null
        }
      })

      // Force Chromium into desktop-sized window
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.isHeadless) {
          launchOptions.args.push('--window-size=1600,1000')
          launchOptions.args.push('--force-device-scale-factor=1')
        }

        return launchOptions
      })

      return config
    },

    viewportWidth: 1478,
    viewportHeight: 900
  }
})
