const { test, expect } = require('@playwright/test');
const { CallModule } = require('../pages/callModulePage');
const { Login } = require('../pages/loginPage');

test.describe('Call Functionality Test', () => {
  test.setTimeout(120000); // Set timeout to 2 minutes

  test('Should be able to make a call using extension', async ({ page }) => {
    const callModule = new CallModule(page);
    const login = new Login(page);

    console.log('Step 1: Navigate to login page');
    await login.navigateToLogin();

    console.log('Step 2: Enter login credentials');
    await login.login('1064@devtest', 'Simform@1234');

    console.log('Step 3: Verify meeting page loads');
    await login.verifyMeetingPage();

    console.log('Step 4: Navigate to call section');
    await callModule.navigateToCallSection();

    console.log('Step 5: Opening dial pad');
    await callModule.openDialpad();

    console.log('Step 6: Enter extension number');
    await callModule.enterRecipient('1042');

    console.log('Step 7: Initiate call');
    await callModule.dialCall();

    console.log('Step 8: Verify connecting message');
    await callModule.verifyConnecting();
  });
});
