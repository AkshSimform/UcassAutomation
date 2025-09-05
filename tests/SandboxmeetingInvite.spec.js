
import { test, expect } from "@playwright/test";
import { MeetingInvitePage } from "../pages/meetingInvitePage";
import env from "../utils/environment";

test.describe("Sending meeting Invite", () => {
  test("Sending meeting invite", async ({ page }) => {
    const meetingPage = new MeetingInvitePage(page);

    await meetingPage.login(env.SandboxSenderusername, env.SandboxSenderpwd, env.SandboxbaseURL);
    await meetingPage.startMeeting();
    await meetingPage.sendMeetingInvite();
    await meetingPage.sendInviteInChat();

    const meetingInviteLink = await meetingPage.getClipboardText();
    console.log(meetingInviteLink);
    await page.pause();

    const edgeBrowser = await chromium.launch({
      headless: false,
      channel: "msedge",
    });
    const edgePage = await edgeBrowser.newPage();
    const meetingPageEdge = new MeetingInvitePage(edgePage);

    await meetingPageEdge.login(env.SandboxRecusername, env.SandboxRecpwd, env.SandboxbaseURL);
    await meetingPageEdge.verifyUnreadMessage();
    await meetingPageEdge.openChatRoom();

    const messageTextComp = await meetingPageEdge.getLastMessageText();
    console.log(messageTextComp);
    const onlyMessage = messageTextComp.split("//");
    console.log(onlyMessage[1]);

    const newPage = await meetingPageEdge.openMeetingLink("https://sandbox.ocmeet.us/custom-1007-5");
    await meetingPageEdge.joinMeeting(newPage);
    await newPage.pause();

    await edgeBrowser.close();
  });
});
