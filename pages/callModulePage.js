class CallModule {
  constructor(page) {
    this.page = page;

    // Declare all locators here
    this.callLink = page.getByRole('link', { name: 'Call' });
    this.dialpad = page.locator("//span[@class='anticon anticon-dial ']//*[name()='svg']");
    this.inputfield = page.getByRole("textbox", { name: "Enter a Number or Extension" });
    this.dialButton = page.locator("//span[@class='ant-btn-icon']//span[contains(@class,'anticon anticon-call')]//*[name()='svg']");
    this.acceptCallButton = page.locator("//span[normalize-space()='Accept']");
    this.connectingText = page.getByText('Connecting...');
  }

  async navigateToCallSection() {
    await this.callLink.waitFor({ state: 'visible', timeout: 30000 });
    await this.callLink.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(5000);
  }

  async openDialpad() {
    await this.dialpad.waitFor({ state: 'visible', timeout: 10000 });
    await this.dialpad.click();
  }

  async enterRecipient(data) {
    await this.inputfield.fill(data);
  }

  async dialCall() {
    await this.dialButton.click();
  }

  async verifyConnecting() {
    await this.connectingText.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.connectingText).toBeVisible();
  }
}

module.exports = { CallModule };
