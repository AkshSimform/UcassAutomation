import { test, expect, chromium } from '@playwright/test';
import { CallPage } from '../pages/callPage';
import { Login } from "../pages/loginPage";
import env from '../utils/environment';

test.describe('VoiceMail Verification Test', () => {
  test('Verify VoiceMail functionality when call is declined', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutes timeout
    const context = await browser.newContext();
    const page = await context.newPage();
    const callPage = new CallPage(page);
    const login = new Login(page);

    // Initial setup from stagingCall.spec.js (lines 1-33 equivalent)
    await login.navigateToLogin(env.StagingbaseURL);
    await login.login(env.Stagingusername, env.Stagingpwd);
    
    await callPage.navigateToCallSection();
    await callPage.openDialpad();
    await callPage.enterRecipient("1042");

    const edgeBrowser = await chromium.launch({ headless: false, channel: "msedge" });
    const edgePage = await edgeBrowser.newPage();
    const callPageEdge = new CallPage(edgePage);
    const loginNew = new Login(edgePage);

    await loginNew.navigateToLogin(env.StagingbaseURL);
    await loginNew.login(env.StagingRecusername, env.StagingRecpwd);

    await callPageEdge.navigateToCallSection();
    await page.bringToFront();
    await page.waitForTimeout(3000); // Wait for page to be ready
    await callPage.dialCall();

    // Step 2: Click decline on edge browser
    await edgePage.bringToFront();
    await callPageEdge.declineCall();
    await edgePage.waitForTimeout(2000); // Wait for call to be declined

    // Step 3: Switch to chrome browser again
    await page.bringToFront();
    await page.waitForTimeout(5000);

    // Step 4: Switch to edge browser
    await edgePage.bringToFront();

    // Step 5: Click on call section (already in call section, but ensuring we're there)
    await callPageEdge.navigateToCallSection();

    // Step 6: Wait for voicemail increase by one
    const initialVoicemailCount = await callPageEdge.getVoicemailCount();
    await edgePage.waitForTimeout(5000); // Wait for voicemail to be processed
    
    // Step 7: Click on voicemail
    await callPageEdge.openVoicemail();

    // Step 8: Verify new record added has user name as Stagingusername
    const latestVoicemailRecord = await callPageEdge.getLatestVoicemailRecord();
    expect(latestVoicemailRecord.username).toBe(env.Stagingusername);

    // Step 9: Verify date and time of new record as call made
    const currentDate = new Date().toDateString();
    expect(latestVoicemailRecord.date).toContain(currentDate);

    // Step 10: Click on 3 dots in 5th column
    await callPageEdge.clickVoicemailOptions();

    // Step 11: Click on download
    await callPageEdge.downloadVoicemail();

    await edgeBrowser.close();
  });
});