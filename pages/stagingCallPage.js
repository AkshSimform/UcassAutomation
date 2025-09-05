export class stagingCallPage {
  constructor(page) {
    this.page = page;

    // Login locators
    this.loginButton = page.locator("text=Login");
    this.usernameField = page.locator("input[name='username']");
    this.passwordField = page.locator("input[name='password']");
    this.submitButton = page.locator("button[type='submit']");

    // Call module locators
    this.dialpadIcon = page.locator("//span[@class='anticon anticon-dial ']//*[name()='svg']");
    this.inputField = page.getByRole("textbox", { name: "Enter a Number or Extension" });
    this.dialButton = page.locator("//span[@class='ant-btn-icon']//span[contains(@class,'anticon anticon-call')]//*[name()='svg']");
    this.acceptCallButton = page.locator("//span[normalize-space()='Accept']");
    this.dialerName = page.locator("//div[@class='text-ellipsis']");
    this.muteButton = page.locator("//div[text()='Mute']/preceding-sibling::button");
    this.moreButton = page.locator("#more-button");
    this.recordButton = page.locator("#record-button");
    this.recordingToast = page.locator("//div[@class='ant-message-custom-content ant-message-success']");
    this.endCallButton = page.locator("#end-call-button");
    this.closeCallButton = page.locator("//button[@class='ant-btn css-fbl77k ant-btn-gray ant-btn-sm sc-fGFwAa jezLFp text']");
    this.callHistoryIcon = page.locator("//span[contains(@class,'anticon anticon-call')]");
    this.callHistoryURL = "https://staging.ocgo.us/calls/all-calls";
    this.callHistoryRow = page.locator("table tbody tr").first();
    this.callOptionsDropdown = page.locator("//td[@class='ant-table-cell ant-table-cell-fix-right ant-table-cell-fix-right-first ant-table-cell-row-hover']//a[@class='ant-dropdown-trigger']");
    this.downloadRecordingOption = page.locator("//div[normalize-space()='Download Recording']");
  }

  async openDialpad() {
    await this.dialpadIcon.waitFor({ state: 'visible' });
    await this.dialpadIcon.click();
  }

  async enterRecipient(extension) {
    await this.inputField.fill(extension);
  }

  async dialCall() {
    await this.dialButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.dialButton.click();
    console.log('Dial button clicked, waiting for call to initiate...');
  }

  async acceptCall() {
    try {
      // Wait for incoming call notification
      await this.page.waitForTimeout(5000);
      
      // Try different possible selectors for accept button
      const acceptSelectors = [
        '//span[normalize-space()="Accept"]',
        '//button[contains(text(), "Accept")]',
        '[data-testid="accept-call"]',
        '.accept-call-button',
        '//span[contains(@class, "accept")]'
      ];
      
      let acceptButton = null;
      for (const selector of acceptSelectors) {
        try {
          acceptButton = this.page.locator(selector);
          await acceptButton.waitFor({ state: 'visible', timeout: 3000 });
          console.log(`Found accept button with selector: ${selector}`);
          break;
        } catch (e) {
          console.log(`Accept button not found with selector: ${selector}`);
        }
      }
      
      if (acceptButton) {
        await acceptButton.click();
      } else {
        // Take screenshot for debugging
        await this.page.screenshot({ path: '/tmp/no-accept-button.png' });
        console.log('No accept button found. Screenshot saved to /tmp/no-accept-button.png');
        throw new Error('Accept call button not found with any selector');
      }
    } catch (error) {
      console.log('Error in acceptCall:', error.message);
      throw error;
    }
  }

  async getDialerName() {
    await this.dialerName.waitFor({ state: 'visible', timeout: 10000 });
    return await this.dialerName.textContent();
  }

  async muteCall() {
    await this.muteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.muteButton.click();
    await this.page.waitForTimeout(500); // Wait for UI update
    return await this.muteButton.getAttribute('class');
  }

  async startRecording() {
    await this.moreButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.moreButton.click();
    await this.recordButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.recordButton.click();
    await this.recordingToast.waitFor({ state: 'visible', timeout: 10000 });
    return await this.recordingToast.textContent();
  }

  async stopRecording() {
    await this.moreButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.moreButton.click();
    await this.recordButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.recordButton.click();
  }

  async endCall() {
    await this.endCallButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.endCallButton.click();
  }

  async closeCallPopup() {
    await this.closeCallButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.closeCallButton.click();
  }

  async openCallHistory() {
    await this.callHistoryIcon.waitFor({ state: 'visible', timeout: 5000 });
    await this.callHistoryIcon.click();
    await this.page.waitForURL(this.callHistoryURL, { timeout: 10000 });
  }

  async downloadRecording() {
    await this.callHistoryRow.waitFor({ state: 'visible', timeout: 10000 });
    await this.callHistoryRow.hover();
    await this.callOptionsDropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.callOptionsDropdown.click();
    await this.downloadRecordingOption.waitFor({ state: 'visible', timeout: 5000 });
    await this.downloadRecordingOption.click();
  }
}