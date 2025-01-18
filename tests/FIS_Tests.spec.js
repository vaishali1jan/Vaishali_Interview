import { test, expect, chromium } from '@playwright/test'
import exp from 'constants'
import { request } from 'http'

//keeping execution mode to parralle as UIa nd API are independant cases 
test.describe.configure({ mode: 'parallel' })
{

      test("UIcase", async () => {
            const browser = await chromium.launch()
            const newContext = await browser.newContext()
            const page = await newContext.newPage()

            //Go to URL mentioned in .env file
            await page.goto(process.env.url)
            const searchInput = page.locator("input[title='Search']");
            await searchInput.fill("book");
            await searchInput.press('Enter');

            //Wait for all elements to load
            await page.waitForSelector(".s-item.s-item__pl-on-bottom")

            //Click on 1st item in list and Wait for new tab
            const newTabBook = newContext.waitForEvent('page')
            await page.locator("(//div[@class='s-item__title'])[3]").click()
            const newpageBook = await newTabBook

            await newpageBook.getByText("Add to cart").click()
            let cartItems = await newpageBook.locator("span.gh-cart__icon").getAttribute('aria-label');
            console.log(cartItems)

            //Assertion for correct items added in cart
            expect(cartItems).toBe("Your shopping cart contains 1 items")
      })


      test("API_Test", async ({ request }) => {
            const res = await request.get("https://api.coindesk.com/v1/bpi/currentprice.json")

            //Verify Statusname and code
            expect(res.status()).toBe(200)
            expect(res.statusText()).toBe("OK")

            const body = await res.json()
            //console.log(body)

            //Verify 3 options under bpi
            const bpiKeys = Object.keys(body.bpi);
            expect(bpiKeys.length).toBe(3);

            //Verify 3 bpi names
            expect(body.bpi).toHaveProperty('USD');
            expect(body.bpi).toHaveProperty('GBP');
            expect(body.bpi).toHaveProperty('EUR');

            //Verify GBP description
            expect(body.bpi.GBP.description).toBe("British Pound Sterling")
      })
}