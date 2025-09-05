import {test as myTest} from "@playwright/test";

type creds = {
    url: string,
    username: string,
    pwd: string
}

const myFixtureTest = myTest.extend<creds>({
    url: 'https://www.saucedemo.com/',
    username: 'standard_user',
    pwd: 'secret_sauce'    
})
export const test = myFixtureTest;