const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
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
