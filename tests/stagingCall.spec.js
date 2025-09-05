import { test, expect, chromium } from '@playwright/test';
import { stagingCallPage } from '../pages/stagingCallPage';
import { Login } from "../pages/loginPage";
import env from '../utils/environment';

test.describe('Checking Call Module', () => {
  test('Checking Call Module', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutes timeout
    const context = await browser.newContext();
    const page = await context.newPage();
    const stagingCall = new stagingCallPage(page);
    const login = new Login(page);

    await login.navigateToLogin();
    await login.login(env.Stagingusername, env.Stagingpwd);
    
    await stagingCall.openDialpad();
    await stagingCall.enterRecipient("1042");

    const edgeBrowser = await chromium.launch({ headless: false, channel: "msedge" });
    const edgePage = await edgeBrowser.newPage();
    const stagingCallEdge = new stagingCallPage(edgePage);
    const loginNew = new Login(edgePage);

    await loginNew.navigateToLogin();
    await loginNew.login(env.StagingRecusername, env.StagingRecpwd);

    //await edgePage.waitForURL("/meetings/"); // Wait for login to complete, URL should contain 'meeting'
    //await edgePage.waitForTimeout(10000); // Wait for login to complete before starting dial
    edgePage.locator("//span[@class='anticon anticon-dial ']//*[name()='svg']").waitFor({state:'visible'});
    await page.bringToFront();
    await stagingCall.dialCall();

    await edgePage.bringToFront();
    await stagingCallEdge.acceptCall();
    await edgePage.waitForTimeout(2000); // Wait for call to be established
    const dialerName = await stagingCallEdge.getDialerName();
    //expect(dialerName).toBe("Akshita 1064 Gupta");

    const muteClass = await stagingCallEdge.muteCall();
    expect(muteClass).toContain("is-clicked");

    await stagingCallEdge.muteCall(); // Unmute
    await stagingCallEdge.startRecording();
    const recordingToast = await stagingCallEdge.startRecording();
    expect(recordingToast).toBe("Recording has started");

    await stagingCallEdge.stopRecording();
    await edgePage.waitForTimeout(1000); // Wait for recording to stop

    await page.bringToFront();
    const receiverName = await stagingCall.getDialerName();
    expect(receiverName).toBe("Akshita 11 1042");

    await stagingCall.endCall();
    await page.waitForTimeout(2000); // Wait for call to end

    await edgePage.bringToFront();
    await stagingCallEdge.closeCallPopup();
    await edgePage.waitForTimeout(1000);
    await stagingCallEdge.openCallHistory();
    await stagingCallEdge.downloadRecording();

    await edgeBrowser.close();
  });
});