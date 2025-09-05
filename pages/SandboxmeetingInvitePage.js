
const { expect } = require('@playwright/test');

class MeetingInvitePage {
  constructor(page) {
    this.page = page;
    this.loginBtn = page.locator("//button[text()='Login']");
    this.usernameInput = page.locator("//input[@name='username']");
    this.passwordInput = page.locator("//input[@name='password']");
    this.submitBtn = page.locator("//button[@type='submit']");
    this.startMeetingBtn = page.locator("//button/span[text()='Start']");
    this.inviteBtn = page.frameLocator("iframe[src*='meet-ap-southeast-1.ocmeet.us/custom-1007-5']")
                      .locator("div[aria-label='Invite people'] div div:nth-child(1) div:nth-child(1)");
    this.copyLinkBtn = page.frameLocator("iframe[src*='meet-ap-southeast-1.ocmeet.us/custom-1007-5']")
                       .locator("#add-people-copy-link-button");
    this.closeInviteModalBtn = page.frameLocator("iframe[src*='meet-ap-southeast-1.ocmeet.us/custom-1007-5']")
                               .locator("button[id='modal-header-close-button'] div[class='jitsi-icon jitsi-icon-default '] svg");
    this.chatTab = page.locator("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)");
    this.chatRoom = page.locator(".text.text-b1.text-normal").nth(0);
    this.messageBox = page.locator("//div[@role='textbox']");
    this.sendBtn = page.locator(".prxiv40 > button:nth-child(4)");
    this.unreadCount = page.locator("//li[2]//a[1]//span[1]//span[1]//sup[1]");
    this.chatRoomSelected = page.locator("div[class='room-selector room-selector--selected'] p[class='text text-b1 text-normal']");
    this.messageLocator = page.locator("._14vmqnff._1mqalmd1._1mqalmd0._14vmqnf9._1h740714");
  }

  async login(username, password, baseURL) {
    await this.page.goto(baseURL);
    await this.loginBtn.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
    await this.page.waitForURL("**/meetings/upcoming");
    await expect(this.page.url()).toContain("meetings/upcoming");
  }

  async startMeeting() {
    await this.startMeetingBtn.click();
    await this.page.waitForURL("**/meetings");
  }

  async sendMeetingInvite() {
    await this.inviteBtn.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.copyLinkBtn.click();
    await this.closeInviteModalBtn.click();
  }

  async sendInviteInChat() {
    await this.chatTab.click();
    await this.chatRoom.click();
    await this.messageBox.focus();
    await this.page.keyboard.press("Meta+V");
    await this.sendBtn.click();
  }

  async getClipboardText() {
    return await this.page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });
  }

  async verifyUnreadMessage() {
    if (await this.unreadCount.count() > 0) {
      expect(await this.unreadCount.getAttribute("title")).toEqual("1");
    } else {
      console.log("There is no unread message in chats");
    }
  }

  async openChatRoom() {
    await this.chatTab.click();
    await this.page.waitForURL("**/chat");
    await expect(this.chatRoomSelected).toBeVisible();
    if (await this.chatRoomSelected.count() > 0) {
      await this.chatRoomSelected.click();
    }
  }

  async getLastMessageText() {
    const message = this.messageLocator.nth(-1);
    const messageTextComp = await message.textContent();
    return messageTextComp;
  }

  async openMeetingLink(link) {
    const popupPromise = this.page.waitForEvent("popup");
    const [newPage] = await Promise.all([
      popupPromise,
      this.page.locator(`//a[@href='${link}']`).nth(-1).click(),
    ]);
    return newPage;
  }

  async joinMeeting(newPage) {
    await newPage.waitForURL("**/devtest-1064");
    await newPage.waitForLoadState("networkidle");
    await newPage.locator("//button[@type='button']").click();
    await newPage.waitForURL("**/join/auth/custom-1007-5");
    await newPage.locator(".driver-popover-close-btn").click();
    await newPage.locator("//span[normalize-space()='Yes']").click();
    await newPage.locator("//div[@id='joinbtn']//button[@type='button']").click();
  }
}

module.exports = { MeetingInvitePage };
