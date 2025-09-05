
class Login {
  constructor(page) {
    this.page = page;
  }

  async navigateToLogin() {
    await this.page.goto('https://staging.ocgo.us/login');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email, password) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async verifyMeetingPage() {
    await this.page.getByRole('heading', { name: 'Meetings' }).waitFor({ state: 'visible' });
  }

}

module.exports = { Login };
