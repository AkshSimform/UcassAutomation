
export class MessagePage {
  constructor(page) {
    this.page = page;
    this.loginBtn = page.locator("text=Login");
    this.usernameInput = page.locator("input[name='username']");
    this.passwordInput = page.locator("input[name='password']");
    this.submitBtn = page.locator("button[type='submit']");
    this.chatTab = page.locator("li:nth-child(2) a");
    this.drawerIcon = page.locator("//div[@class='drawer']//span[@class='ic-raw ic-raw-small']");
    this.createDMBtn = page.locator("(//p[normalize-space()='Create a Direct Message'])[1]");
    this.recipientName = page.locator("//h4[normalize-space()='Akshita Gupta 1008']");
    this.startConversationBtn = page.locator("//button[@class='start_consversation_button']");
    this.messageInput = page.locator("//div[@role='textbox']");
    this.sendBtn = page.locator(".prxiv40 > button:nth-child(4)");
    this.unreadBadge = page.locator("//li[2]//a[1]//span[1]//span[1]//sup[1]");
    this.selectedRoom = page.locator("div[class='room-selector room-selector--selected'] p[class='text text-b1 text-normal']");
    this.lastMessage = page.locator("._14vmqnff._1mqalmd1._1mqalmd0._14vmqnf9._1h740714").last();
  }

  async login(baseURL, username, password) {
    await this.page.goto(baseURL);
    await this.loginBtn.click();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
    await this.page.waitForURL("**/meetings/upcoming");
  }

  async navigateToChat() {
    await this.chatTab.waitFor({ state: 'visible' });
    await this.chatTab.click();
    await this.page.waitForURL("**/chat");
  }

  async createDirectMessage() {
    await this.drawerIcon.click();
    await this.createDMBtn.click();
    const recipient = await this.recipientName.textContent();
    if (recipient.includes("Akshita Gupta 1008")) {
      await this.page.locator(".btn-primary.noselect").nth(3).click();
    }
    await this.startConversationBtn.click();
  }

  async sendMessage(message) {
    await this.messageInput.fill(message);
    await this.sendBtn.click();
  }

  async verifyUnreadMessage() {
    if (await this.unreadBadge.count() > 0) {
      const count = await this.unreadBadge.getAttribute("title");
      return count;
    }
    return "0";
  }

  async openChatRoom() {
    if (await this.selectedRoom.count() > 0) {
      await this.selectedRoom.click();
    }
  }

  async getLastMessage() {
    return await this.lastMessage.textContent();
  }
}
