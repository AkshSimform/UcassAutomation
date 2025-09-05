const { test, expect } = require('@playwright/test');
const { CallPage } = require('../pages/callPage');
const { Login } = require('../pages/loginPage');
const { env } = require('process');

test.describe('Call Functionality Test', () => {
  test.setTimeout(120000); // Set timeout to 2 minutes

  test('Should be able to make a call using extension', async ({ page }) => {
    const callPage = new CallPage(page);
    const login = new Login(page);

    console.log('Step 1: Navigate to login page');
    await login.navigateToLogin(env.StagingbaseURL);

    console.log('Step 2: Enter login credentials');
    await login.login('1064@devtest', 'Simform@1234');

    console.log('Step 3: Verify meeting page loads');
    await login.verifyMeetingPage();

    console.log('Step 4: Navigate to call section');
    await callPage.navigateToCallSection();

    console.log('Step 5: Opening dial pad');
    await callPage.openDialpad();

    console.log('Step 6: Enter extension number');
    await callPage.enterRecipient('1042');

    console.log('Step 7: Initiate call');
    await callPage.dialCall();

    console.log('Step 8: Verify connecting message');
    await callPage.verifyConnecting();
  });
});
