# UcassAutomation

## Project Overview
Automated tests for Ucass using Playwright.

## Prerequisites
- Node.js (v16 or higher)
- Java (OpenJDK 11+ for Allure)
- Playwright
- Allure Commandline (`npm install -g allure-commandline --save-dev`)

## Setup
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Configure environment variables in a `.env` file (see below).

## Environment Variables
Create a `.env` file in the project root with the following (example):
```
Stagingusername=your_username
StagingRecpwd=your_password
StagingRecusername=recipient_username
StagingbaseURL=https://your.staging.url
```

## Running Tests
- Run all tests:
  ```bash
  npx playwright test
  ```
- Run a specific test:
  ```bash
  npx playwright test tests/sendMessage.spec.js
  ```

## Allure Reports
- Generate results:
  ```bash
  npx playwright test
  ```
- Generate static report:
  ```bash
  allure generate allure-results --clean -o allure-report
  ```
- View report:
  Open `allure-report/index.html` in your browser.

## Troubleshooting
- If Allure does not open, ensure Java is installed and in your PATH (`java -version`).
- If you see errors about missing `allure-results`, make sure your tests are configured to use the Allure reporter.
- Do not commit sensitive data or generated reports.

## Maintainers
- Project owner: Kalyani
- For issues, contact: your.email@domain.com

## Notes
- Do not commit `allure-results` or `allure-report` folders.
- Store sensitive data in environment variables or `.env` (excluded from git).
