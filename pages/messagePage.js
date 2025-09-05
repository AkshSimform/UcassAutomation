
class MessagePage {
  constructor(page) {
    this.page = page;
    this.chatTab = page.locator("body > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(2) > a:nth-child(1)");
    this.drawerIcon = page.locator("//div[@class='drawer']//span[@class='ic-raw ic-raw-small']");
    this.createDMButton = page.locator("(//p[normalize-space()='Create a Direct Message'])[1]");
    this.add = page.locator("//h4[contains(text(),'Akshita 11 1042')]/following::p[contains(text(),'Add')][1]");
    this.startConversationButton = page.locator("//button[@class='start_consversation_button']");
    this.messageInput = page.locator("//div[@role='textbox']");
    this.sendButton = page.locator(".prxiv40 > button:nth-child(4)");
    this.lastMessage = page.locator("._14vmqnff._1mqalmd1._1mqalmd0._14vmqnf9._1h740714").nth(-1);
    this.unreadBadge = page.locator("//li[2]//a[1]//span[1]//span[1]//sup[1]");
    this.selectedRoom = page.locator("div[class='room-selector room-selector--selected'] p[class='text text-b1 text-normal']");
    this.timestamp = this.lastMessage.locator("//time['._1xny9xl0 _1mqalmd1 _1mqalmd0 _1xny9xlc _1xny9xlo']").nth(-1);
  }

  async navigateToChat() {
    await this.chatTab.click();
    await this.page.waitForURL("https://staging.ocgo.us/chat");
  }

  async addRecipient(expectedRecipient) {
    await this.page.locator('h4', { hasText: expectedRecipient })
  .locator('xpath=following::p[contains(text(),"Add")][1]')
  .click();
  }

  async createDirectMessage(expectedRecipient) {
    await this.drawerIcon.click();
    await this.createDMButton.click();
    await this.addRecipient(expectedRecipient);
    await this.startConversationButton.click();
  }

  async sendMessage(message) {
    await this.messageInput.type(message);
    await this.sendButton.click();
  }

  async getLastMessageText() {
    const messageText = await this.lastMessage.textContent();
    return messageText.split("M")[1];
  }

  async hasUnreadMessage() {
    return await this.unreadBadge.count() > 0;
  }

  async getUnreadMessageCount() {
    return await this.unreadBadge.getAttribute("title");
  }

  async openUnreadChat() {
    await this.chatTab.click();
    await this.page.waitForURL("https://staging.ocgo.us/chat");
    if (await this.selectedRoom.count() > 0) {
      await this.selectedRoom.click();
    }
  }

  async getMessageTimestamp() {
    return await this.timestamp.innerText();
  }
}

module.exports = { MessagePage };
