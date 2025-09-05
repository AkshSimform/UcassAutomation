
import { test, expect } from '@playwright/test';
import { MessagePage } from '../pages/messagePage';
import env from '../utils/environment';

test.describe('Sending message', () => {
  test('Verify the message flow between sender and receiver', async ({ page }) => {
    const sender = new MessagePage(page);
    const messageText = "Sending first message from 1007 to 1008";

    // Sender login and send message
    await sender.login(env.SandboxbaseURL, env.SandboxSenderusername, env.SandboxSenderpwd);
    await sender.navigateToChat();
    await sender.createDirectMessage();
    await sender.sendMessage(messageText);

    // Launch Edge browser for receiver
    const { chromium } = require('@playwright/test');
    const edgeBrowser = await chromium.launch({ headless: false, channel: 'msedge' });
    const edgePage = await edgeBrowser.newPage();
    const receiver = new MessagePage(edgePage);

    await receiver.login(env.SandboxbaseURL, env.SandboxRecusername, env.SandboxRecpwd);
    const unreadCount = await receiver.verifyUnreadMessage();
    expect(unreadCount).toBe("1");

    await receiver.navigateToChat();
    await receiver.openChatRoom();
    const receivedMessage = await receiver.getLastMessage();
    expect(receivedMessage.includes(messageText)).toBeTruthy();

    await edgeBrowser.close();
  });
});
