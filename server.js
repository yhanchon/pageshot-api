const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const isURL = require("validator/lib/isURL");
const { autoScroll } = require("./components/autoScroll.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post("/api/pageshot", async (request, response) => {

    const clientIpAddr = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    const clientUserAgent = request.get('user-agent');

    var logPrefix = '[' + clientIpAddr + '] [' + clientUserAgent + '] ';
    
    if (request.body.url && isURL(request.body.url)) {

        logPrefix += '[' + request.body.url + '] ';
        console.log(logPrefix + "Received request");

        const browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
            ]
        });
        try {
            const page = await browser.newPage();
            //            const iPhone = puppeteer.devices['iPhone 13 Pro Max landscape'];
            //            await page.emulate(iPhone);

            await page.setViewport({
                width: 1200,
                height: 800,
                isMobile: false,
                hasTouch: false,
                isLandscape: false
            });

            //await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36");
            console.info(logPrefix + "Loading webpage");
            await page.goto(request.body.url, { waitUntil: 'networkidle0', timeout: 60000 });
            console.info(logPrefix + "Auto-scroll starting");
            await autoScroll(page);
            console.info(logPrefix + "Auto-scroll completed");
            console.info(logPrefix + "Screenshot starting");
            const image = await page.screenshot({ fullPage: true });
            console.info(logPrefix + "Screenshot completed");

            response.set('Content-Type', 'image/png');
            response.send(image);

            console.info(logPrefix + "Request completed");

        } catch (error) {
            if (error.message.includes("ERR_CERT_COMMON_NAME_INVALID")) {
                response.status(400).send();
            }
            else if (error.message.includes("ERR_NAME_NOT_RESOLVED") || error.message.includes("ERR_CONNECTION_REFUSED")) {
                response.status(404).send();
            }
            else if (error.message.includes("Navigation timeout")) {
                response.status(408).send();
            }
            
            console.error(logPrefix + error.message);

        } finally {
            await browser.close();
        }
    }
    else {
        console.error(logPrefix + "URL specified is invalid!");
        response.status(400).send("URL specified is invalid!");
    }

});


var listener = app.listen(8100, function () {
    console.info("Pageshot service is listening on port " + listener.address().port);
});