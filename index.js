const pw = require('playwright');

(async () => {
    const browser = await pw.chromium.launch();
    const context = await browser.newContext({
        viewport: {
            width: 1920,
            height: 1080
        }
    });
    const page = await context.newPage('https://pintandpillage.nl/login');

    const username = await page.$('input.inputField:nth-child(1)');
    await username.type('vblinden');

    const password = await page.$('input.inputField:nth-child(2)');
    await password.type('');

    const submitButton = await page.$('.submitButton');
    await submitButton.click();

    await sleep(3000);

    const villages = await page.$$('.dropdown > div');

    for (let i = 1; i < villages.length; i++) {
        const villageSwitcher = await page.$('.villageSelector');
        await villageSwitcher.click();

        await page.screenshot({ path: `village-${i}.png` });

        await sleep(3000);

        const dropdown = await page.$(`.dropdown > div:nth-child(${i + 1})`);
        await dropdown.click();

        await sleep(2000);

        console.log(`Checking village number: ${i}`)

        const tiles = await page.$$('.tile');
        
        for (let j = 0; j < tiles.length; j++) {
            const tile = tiles[j];

            await tile.click();
            await sleep(25);

            const levelUp = await page.$('text="Level Up"');
            if (levelUp) {
                await page.screenshot({ path: `village-${i}-tile-${j}.png` });
                await sleep(10);
                await levelUp.click()
                console.log(`Level up tile ${j}...`);
            }

            const close = await page.$('.innerModalBox #modalButton');
            if (close) {
                await sleep(10);
                close.click();
            }
        }
    }

    await browser.close();
})();

function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}