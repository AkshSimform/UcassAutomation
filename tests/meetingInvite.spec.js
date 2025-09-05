
import { expect, test } from "@playwright/test";
import { LoginPO } from "../page-object/loginPageObject";
import { MeetingInvitePage } from "../page-object/meetingInvitePage";
const { chromium } = require("@playwright/test");
import env from "../utils/environment";

test.describe("Sending meeting Invite", async () => {
  test("Sending meeting invite", async ({ page }) => {
    const login = new LoginPO(page);
    const meetingPage = new MeetingInvitePage(page);

    await page.goto(env.StagingbaseURL);
    await login.clickLoginBtn();
    await login.enterUsername(env.Stagingusername);
    await login.enterPassword(env.Stagingpwd);
    await login.clickSubmitBtn();
    await page.waitForURL("https://staging.ocgo.us/meetings/upcoming");
    await expect(page.url()).toBe("https://staging.ocgo.us/meetings/upcoming");

    await meetingPage.startMeeting();
    const meetingMinuteNumber = await meetingPage.verifyMeetingStarted();
    expect(meetingMinuteNumber).toBeGreaterThanOrEqual(0);

    await meetingPage.copyInviteLink();
    await meetingPage.sendInviteMessage();

    const meetingInviteLink = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    const onlyMessageSent = await meetingPage.getLastSentMessage();
    expect(meetingInviteLink).toBe(onlyMessageSent);

    const edgeBrowser = await chromium.launch({ headless: false, channel: "msedge" });
    const edgePage = await edgeBrowser.newPage();
    const loginNew = new LoginPO(edgePage);
    const meetingPageNew = new MeetingInvitePage(edgePage);

    await edgePage.goto(env.StagingbaseURL);
    await loginNew.clickLoginBtn();
    await loginNew.enterUsername(env.StagingRecusername);
    await loginNew.enterPassword(env.StagingRecpwd);
    await loginNew.clickSubmitBtn();
    await edgePage.waitForURL("https://staging.ocgo.us/meetings/upcoming");
    expect(edgePage.url()).toBe("https://staging.ocgo.us/meetings/upcoming");

    const unreadCount = await meetingPageNew.checkUnreadMessage();
    if (unreadCount) {
      expect(unreadCount).toEqual("1");
    } else {
      console.log("There is no unread message in chats");
    }

    await meetingPageNew.openChatRoom();
    const onlyMessage = await meetingPageNew.getLastReceivedMessage();
    expect(meetingInviteLink).toBe(onlyMessage);

    const newPage = await meetingPageNew.openMeetingPopup();
    await meetingPageNew.joinMeeting(newPage);

    const { exec } = require("child_process");
    exec("powershell -Command \"(New-Object -ComObject WScript.Shell).AppActivate('Chrome')\"");

    await page.bringToFront();
    const count = await meetingPage.verifyParticipantPresent();
    expect(count).toBeGreaterThan(0);

    await page.pause();
  });
});
