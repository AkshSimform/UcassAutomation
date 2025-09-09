import { test, expect, chromium } from '@playwright/test';
import { CallPage } from '../pages/callPage';
import { Login } from "../pages/loginPage";
import env from '../utils/environment';
import path from 'path';

test.describe('VoiceMail Verification Test', () => {
  test('Verify VoiceMail functionality when call is declined', async ({ browser }) => {
    test.setTimeout(180000); // 3 minutes timeout
    const context = await browser.newContext({
      permissions: ['microphone', 'camera'],
      extraHTTPHeaders: {
        'Permissions-Policy': 'microphone=(), camera=()'
      }
    });
    const page = await context.newPage();
    const callPage = new CallPage(page);
    const login = new Login(page);

    // Initial setup from stagingCall.spec.js (lines 1-33 equivalent)
    await login.navigateToLogin(env.StagingbaseURL);
    await login.login(env.Stagingusername, env.Stagingpwd);
    
    await callPage.navigateToCallSection();
    
    // Setup audio recording BEFORE making the call
    const audioFilePath = path.join(process.cwd(), 'assets', 'voicemail-recording.wav');
    console.log('Pre-setting up voicemail recording with audio file:', audioFilePath);
    await callPage.simulateVoicemailRecording(audioFilePath);
    
    await callPage.openDialpad();
    await callPage.enterRecipient("1042");

    const edgeBrowser = await chromium.launch({ 
      headless: false, 
      channel: "msedge",
      args: [
        '--use-fake-ui-for-media-stream',
        '--autoplay-policy=no-user-gesture-required',
        '--allow-running-insecure-content',
        '--disable-web-security'
      ]
    });
    const edgeContext = await edgeBrowser.newContext({
      permissions: ['microphone', 'camera']
    });
    const edgePage = await edgeContext.newPage();
    const callPageEdge = new CallPage(edgePage);
    const loginNew = new Login(edgePage);

    await loginNew.navigateToLogin(env.StagingbaseURL);
    await loginNew.login(env.StagingRecusername, env.StagingRecpwd);

    await callPageEdge.navigateToCallSection();
    await callPageEdge.dialpadIcon.waitFor({ state: 'visible', timeout: 10000 });
    const initialVoicemailCount = await callPageEdge.getVoicemailCount();
//    console.log('Initial voicemail count:', initialVoicemailCount);
    await callPage.page.bringToFront();
    await callPage.page.waitForTimeout(3000); // Wait for page to be ready
    
    await callPage.dialCall();

    // Step 2: Click decline on edge browser
    await edgePage.bringToFront();
    await callPageEdge.declineCall();
    await edgePage.waitForTimeout(2000); // Wait for call to be declined

    // Step 3: Switch to chrome browser again
    await callPage.page.bringToFront();
    await callPage.page.waitForTimeout(5000);
    
    // Capture the call time before making the call
    const callTime = new Date();
    const expectedTime = callTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    console.log('Call made at:', expectedTime);
    
    // Wait for voicemail recording to capture audio (audio was pre-setup)
    console.log('Waiting for voicemail recording to complete...');
    await callPage.page.waitForTimeout(8000); // Longer wait for recording
    
    // Stop the recording and end call
    await callPage.stopVoicemailRecording();
    await callPage.endCall();

    // Step 4: Switch to edge browser
    await edgePage.bringToFront();
    //await edgePage.reload();

    // Step 5: Click on call section (already in call section, but ensuring we're there)
    await callPageEdge.openVoicemail();

    // Step 6: Wait for voicemail increase by one
    let currentVoicemailCount = initialVoicemailCount;
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 30 seconds
    
    while (currentVoicemailCount <= initialVoicemailCount && attempts < maxAttempts) {
      await edgePage.waitForTimeout(5000); // Wait longer without reloading
      currentVoicemailCount = await callPageEdge.getVoicemailCount();
      console.log('Current voicemail count:', currentVoicemailCount);
      attempts++;
    }
    
    // Step 8: Verify new record added has user name as Stagingusername
    const latestVoicemailRecord = await callPageEdge.getLatestVoicemailRecord();
    expect(latestVoicemailRecord.username).toBe("1064");

    // Step 9: Verify date and time of new record as call made
    console.log('Expected call time:', expectedTime);
    console.log('Voicemail record time:', latestVoicemailRecord.date);
    
    expect(latestVoicemailRecord.date).toContain("Today");
    
    // Extract time from voicemail record (format: "Today, 01:05 pm")
    const timeMatch = latestVoicemailRecord.date.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
    if (timeMatch) {
      const recordTimeStr = `${timeMatch[1]}:${timeMatch[2]} ${timeMatch[3].toLowerCase()}`;
      console.log('Extracted record time:', recordTimeStr);
      
      // Compare times (allowing for 1-2 minute difference due to processing time)
      const callTimeObj = new Date(`1970-01-01 ${expectedTime}`);
      const recordTimeObj = new Date(`1970-01-01 ${recordTimeStr}`);
      const timeDiffMinutes = Math.abs(callTimeObj - recordTimeObj) / (1000 * 60);
      
      expect(timeDiffMinutes).toBeLessThanOrEqual(2); // Allow 2-minute tolerance
    }

    // Step 10: Click on 3 dots in 5th column
    await callPageEdge.clickVoicemailOptions();


    // Step 11: Download and verify voicemail file with audio comparison
    const downloadResult = await callPageEdge.downloadAndVerifyVoicemail(audioFilePath);
    expect(downloadResult.isValid).toBe(true);
    expect(downloadResult.size).toBeGreaterThan(44);
    expect(downloadResult.filename).toMatch(/\.wav$/i);
    
    // Assert audio content similarity
    expect(downloadResult.audioMatch.similarity).toBeGreaterThan(30); // At least 30% similarity
    console.log(`Audio similarity: ${downloadResult.audioMatch.similarity}%`);
    console.log(`Audio match details:`, downloadResult.audioMatch.details);
    
    if (downloadResult.audioMatch.matches) {
      console.log('✅ Downloaded voicemail contains your original voice recording!');
    } else {
      console.log('⚠️  Downloaded voicemail may not contain your original recording');
    }
    
    console.log('Voicemail download verification completed successfully!');

    await edgeBrowser.close();
  });
});