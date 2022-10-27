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

    if (request.body.url && isURL(request.body.url)) {

        console.log("\nNew Pageshot request: " + request.body.url);
        try {
            const browser = await puppeteer.launch({
                args: [
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                ]
            });

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
            await page.goto(request.body.url, { waitUntil: 'networkidle0', timeout: 60000 });
            console.log("started auto scroll");
            await autoScroll(page);
            console.log("finished auto scroll");
            const image = await page.screenshot({ fullPage: true });
            await browser.close();

            console.log("Pageshot completed!");

            response.set('Content-Type', 'image/png');
            response.send(image);

            console.log("Completed request\n");

        } catch (error) {
            if (error.message.includes("ERR_NAME_NOT_RESOLVED")) {
                console.log("Unable to resolve URL to a website!!");
                response.status(404).send("Website cannot be found!!");
            }
            else if (error.message.includes("ERR_CERT_COMMON_NAME_INVALID")) {
                console.log("Unable to load url due to SSL cert issue!!");
                response.status(400).send("Website cannot be loaded!!");
            }
            console.log(error);
        }
    }
    else {
        console.log("URL specified is invalid!");
        response.status(400).send("URL specified is invalid!");
    }

});


var listener = app.listen(8100, function () {
    console.log("Pageshot service is listening on port " + listener.address().port);
});