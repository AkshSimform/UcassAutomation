import { test, expect, chromium } from '@playwright/test';
import { CallPage } from '../pages/callPage';
import { Login } from "../pages/loginPage";
import env from '../utils/environment';

test.describe('Checking Call Module', () => {
  test('Checking Call Module', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutes timeout
    const context = await browser.newContext();
    const page = await context.newPage();
    const callPage = new CallPage(page);
    const login = new Login(page);

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

    await callPageEdge.openDialpad();
    await page.bringToFront();
    await callPage.dialCall();

    await edgePage.bringToFront();
    await callPageEdge.acceptCall();
    await edgePage.waitForTimeout(2000); // Wait for call to be established
    const dialerName = await callPageEdge.getDialerName();
    //expect(dialerName).toBe("Akshita 1064 Gupta");

    const muteClass = await callPageEdge.muteCall();
    expect(muteClass).toContain("is-clicked");

    await callPageEdge.muteCall(); // Unmute
    await callPageEdge.startRecording();
    const recordingToast = await callPageEdge.startRecording();
    expect(recordingToast).toBe("Recording has started");

    await callPageEdge.stopRecording();
    await edgePage.waitForTimeout(1000); // Wait for recording to stop

    await page.bringToFront();
    const receiverName = await callPage.getDialerName();
    expect(receiverName).toBe("Akshita 11 1042");

    await callPage.endCall();
    await page.waitForTimeout(2000); // Wait for call to end

    await edgePage.bringToFront();
    await callPageEdge.closeCallPopup();
    await edgePage.waitForTimeout(1000);
    await callPageEdge.openCallHistory();
    await callPageEdge.downloadRecording();

    await edgeBrowser.close();
  });
});