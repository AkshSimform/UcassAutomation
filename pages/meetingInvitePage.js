
class MeetingInvitePage {
  constructor(page) {
    this.page = page;
    this.frameLocator = page.frameLocator("iframe[src*='https://us-meet.onecloud.com/devtest-1064']");
    this.startButton = page.locator("//button/span[text()='Start']");
    this.inviteButton = this.frameLocator.locator("div[aria-label='Invite people'] div div:nth-child(1) div:nth-child(1)");
    this.copyLinkButton = this.frameLocator.locator("//div[@id='add-people-copy-link-button']");
    this.closeInviteModal = this.frameLocator.locator("button[id='modal-header-close-button'] div[class='jitsi-icon jitsi-icon-default '] svg");
    this.chatTab = page.locator("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)");
    this.recipient = page.locator("//p[normalize-space()='Akshita 11 1042']").nth(0);
    this.messageBox = page.locator("//div[@role='textbox']");
    this.sendButton = page.locator(".prxiv40 > button:nth-child(4)");
    this.lastMessage = page.locator("._14vmqnff._1mqalmd1._1mqalmd0._14vmqnf9._1h740714").nth(-1);
    this.unreadBadge = page.locator("//li[2]//a[1]//span[1]//span[1]//sup[1]");
    this.chatRoom = page.locator("div[class='room-selector room-selector--selected'] p[class='text text-b1 text-normal']");
    this.meetingLink = page.locator("//a[@href='https://staging.ocgo.us/devtest-1064']").nth(-1);
    this.joinButton = page.locator("//div[@id='joinbtn']//button[@type='button']");
    this.participantPanelButton = this.frameLocator.locator("//div[contains(@aria-label,'Open participants panel. 2 participants')]//div//div[contains(@class,'jitsi-icon jitsi-icon-default')]//*[name()='svg']");
    this.participantName = this.frameLocator.locator("//div[contains(text(),'Akshita 11 1042')]");
    this.pinChatButton = page.locator("span[class='anticon anticon-pinchat '] svg");
    this.confirmJoinButton = page.locator("//button[@type='button']");
    this.driverCloseButton = page.locator(".driver-popover-close-btn");
  }

  async startMeeting() {
    await this.startButton.click();
    await this.page.waitForURL("https://staging.ocgo.us/meetings");
  }

  async verifyMeetingStarted() {
    const meetingTime = await this.frameLocator.locator("//span[@class='css-h6c4xs-timer']").innerText();
    const meetingMinute = Number(meetingTime.split(":")[1]);
    return meetingMinute;
  }

  async copyInviteLink() {
    await this.inviteButton.click();
    await this.page.waitForLoadState("domcontentloaded");
    await this.copyLinkButton.click();
    await this.closeInviteModal.click();
  }

  async sendInviteMessage() {
    await this.chatTab.click();
    await this.recipient.click();
    await this.messageBox.focus();
    await this.page.keyboard.press("ControlOrMeta+V");
    await this.sendButton.click();
  }

  async getLastSentMessage() {
    const messageText = await this.lastMessage.textContent();
    return messageText.split("M")[1];
  }

  async checkUnreadMessage() {
    if (await this.unreadBadge.count() > 0) {
      return await this.unreadBadge.getAttribute("title");
    }
    return null;
  }

  async openChatRoom() {
    await this.chatTab.click();
    await this.page.waitForURL("https://staging.ocgo.us/chat");
    if (await this.chatRoom.count() > 0) {
      await this.chatRoom.click();
    }
  }

  async getLastReceivedMessage() {
    const messageText = await this.lastMessage.textContent();
    return messageText.split("M")[1];
  }

  async openMeetingPopup() {
    const popupPromise = this.page.waitForEvent("popup");
    const [newPage] = await Promise.all([
      popupPromise,
      this.meetingLink.click(),
    ]);
    return newPage;
  }

  async joinMeeting(newPage) {
    await newPage.waitForLoadState("domcontentloaded");
    await newPage.locator("//button[@type='button']").click();
    await newPage.waitForURL("https://staging.ocgo.us/join/auth/devtest-1064");
    await newPage.locator(".driver-popover-close-btn").click();
    await newPage.locator("//div[@id='joinbtn']//button[@type='button']").click();
  }

  async verifyParticipantPresent() {
    await this.pinChatButton.click();
    await this.frameLocator.locator(".css-fbf6eb-action.primary").click();
    await this.participantPanelButton.click();
    const count = await this.participantName.count();
    return count;
  }
}

module.exports = { MeetingInvitePage };
