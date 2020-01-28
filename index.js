const pw = require('playwright');
const schedule = require('node-schedule');

schedule.scheduleJob('*/15 * * * *', () => {
    (async () => {
        const browser = await pw.chromium.launch();
        const context = await browser.newContext({
            viewport: {
                width: 1920,
                height: 1080
            }
        });

        const page = await context.newPage('https://pintandpillage.nl/login');
        await login(page);

        console.log(`Checking current village`);
        await upgradeAllTiles(page, 0);
        // console.log(await page.evaluate('localStorage.token'));

        const villages = await page.$$('.dropdown > div');
        for (let i = 1; i < villages.length; i++) {
            const villageSwitcher = await page.$('.villageSelector');
            await villageSwitcher.click();

            const villageName = await page.$eval('.villageSelector', el => el.textContent);

            //await page.screenshot({ path: `village-${i}.png` });

            await sleep(3000);

            const dropdown = await page.$(`.dropdown > div:nth-child(${i + 1})`);
            await dropdown.click();

            await sleep(2000);

            console.log(`Checking village: ${villageName}`)

            await upgradeAllTiles(page, i);
        }

        await browser.close();
    })();

    async function upgradeAllTiles(page, i) {
        const tiles = await page.$$('.tile');
            
        for (let j = 0; j < tiles.length; j++) {
            const tile = tiles[j];

            await tile.click();
            await sleep(25);

            const levelUp = await page.$('//button[text()="Level Up"][not(@disabled)]');
            if (levelUp) {
                //await page.screenshot({ path: `village-${i}-tile-${j}.png` });
                await sleep(10);

                await levelUp.click()

                const title = await page.$eval('h1', el => el.textContent);

                console.log(`Level up ${title}...`);
            }

            const close = await page.$('.innerModalBox #modalButton');
            if (close) {
                await sleep(10);
                close.click();
            }
        }
    }

    async function login(page) {
        const username = await page.$('input.inputField:nth-child(1)');
        await username.type('vblinden');

        const password = await page.$('input.inputField:nth-child(2)');
        await password.type('FackingRetard123!');

        const submitButton = await page.$('.submitButton');
        await submitButton.click();
        await sleep(3000);
    }

    function sleep(millis) {
        return new Promise(resolve => setTimeout(resolve, millis));
    }
});