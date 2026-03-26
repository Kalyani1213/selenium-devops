const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { startServer } = require('./app');

async function runTest() {
  const server = startServer(3000, '127.0.0.1');

  // Chrome options - MUST be headless for Jenkins
  let options = new chrome.Options();
  options.addArguments('--headless=new'); // Use the modern headless mode
  options.addArguments('--no-sandbox');    // Required for Linux/Jenkins
  options.addArguments('--disable-dev-shm-usage'); // Prevents memory crashes in containers

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    await driver.get('http://127.0.0.1:3000');

    const element = await driver.wait(
      until.elementLocated(By.id('result')),
      10000
    );

    const text = await element.getText();
    // Match the sum in your app (looks like you have 7 in one version and 5 in the other)
    assert.strictEqual(text, 'Sum is: 7'); 

    console.log('Test passed in headless mode!');
  } finally {
    await driver.quit();
    server.close();
  }
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
