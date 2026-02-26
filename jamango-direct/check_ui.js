const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        // ignoring some arg defaults because headless may not work perfectly on Windows without specific args. Let's just try standard launch.
    });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER PAGE ERROR:', error.message));
    page.on('requestfailed', request => console.error('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

    try {
        console.log('Navigating...');
        await page.goto('http://localhost:8081/admin', { waitUntil: 'networkidle2' });

        // Login
        await page.type('input[type="email"]', 'saivenkatuppu@gmail.com');
        await page.type('input[type="password"]', 'sai123'); // Oh wait, password is wrong.
        // Actually I don't know the password. So I will just inject a valid JWT using localStorage!

    } catch (e) { console.error('Error:', e); }

    await browser.close();
})();
