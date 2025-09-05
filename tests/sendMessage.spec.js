import { expect, test } from "@playwright/test";
import { Login } from "../pages/loginPage";
import { MessagePage } from "../pages/messagePage";
const { chromium } = require("@playwright/test");
import env from "../utils/environment";

test.describe("Sending message", async () => {
  test("Verify the Login", async ({ page }) => {
    const login = new Login(page);
    const messagePage = new MessagePage(page);
    const messageSent = "Sending first message from 1064 to 1042 2";

    await login.navigateToLogin();
    await login.login(env.Stagingusername, env.StagingRecpwd);

    await messagePage.navigateToChat();
    await messagePage.createDirectMessage("Akshita 11 1042");
    await messagePage.sendMessage(messageSent);

    const lastMessage = await messagePage.getLastMessageText();
    expect(lastMessage).toBe(messageSent);
    const messageSentTime = await messagePage.getMessageTimestamp();
    console.log('messageSentTime:', messageSentTime);

    const edgeBrowser = await chromium.launch({ headless: false, channel: "msedge" });
    const edgePage = await edgeBrowser.newPage();
    const loginNew = new Login(edgePage);
    const messagePageNew = new MessagePage(edgePage);

    await loginNew.navigateToLogin();
    await loginNew.login(env.StagingRecusername, env.StagingRecpwd);

    expect(await messagePageNew.getUnreadMessageCount()).toEqual("1");
    await messagePageNew.openUnreadChat();
    const receivedMessage = await messagePageNew.getLastMessageText();
    expect(receivedMessage).toBe(messageSent);

    await page.waitForTimeout(5000); 
    const messageReceivedTime = await messagePageNew.getMessageTimestamp();
    expect(messageReceivedTime).toBe(messageSentTime);

  });
});
