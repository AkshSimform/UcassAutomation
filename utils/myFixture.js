import { test as myTest } from "@playwright/test";

const myFixtureTest = myTest.extend({
    url: 'https://www.saucedemo.com/',
    username: 'standard_user',
    pwd: 'secret_sauce'    
});

export const test = myFixtureTest;