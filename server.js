/**
 * @name Express Server
 *
 * @desc Serves the page-shot API
*/
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const isURL = require("validator/lib/isURL");
const { autoScroll } = require("./components/autoScroll.js");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Details of device options - [0-10]: Desktop resolutions, [11-]: Mobile devices
const deviceData = [
    null,
    { "index": 1, "deviceName": "Desktop", "label": "1200x800", "browserWidth": 1200, "browserHeight": 800, "isMobilePhone": false },
    { "index": 2, "deviceName": "Desktop", "label": "1920x1080", "browserWidth": 1920, "browserHeight": 1080, "isMobilePhone": false },
    { "index": 3, "deviceName": "Desktop", "label": "1024x768", "browserWidth": 1024, "browserHeight": 768, "isMobilePhone": false },
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    { "index": 11, "deviceName": "iPhone X", "label": "iPhone X", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": true },
    { "index": 12, "deviceName": "iPhone 13", "label": "iPhone 13", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": true },
    { "index": 13, "deviceName": "iPhone 13 Pro Max", "label": "iPhone 13 Pro Max", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": true },
    { "index": 14, "deviceName": "iPad Mini", "label": "iPad Mini", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": false },
    { "index": 15, "deviceName": "iPad Pro", "label": "iPad Pro", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": false },
    { "index": 16, "deviceName": "Galaxy S9+", "label": "Galaxy S9+", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": true },
    { "index": 17, "deviceName": "Galaxy Tab S4", "label": "Galaxy Tab S4", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": false },
    { "index": 18, "deviceName": "Pixel 5", "label": "Pixel 5", "browserWidth": 0, "browserHeight": 0, "isMobilePhone": true }
];

const getDeviceData = (deviceName) => {
    var result = false;
    deviceData.map((device) => {
        if (device !== null) {
            if (device.deviceName === deviceName) {
                result = true;
            }
        } 
    });
    return result;
};

app.post("/api/pageshot", async (request, response) => {

    const clientIpAddr = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
    var logPrefix = '[' + clientIpAddr + '] ';

    if (request.body.url && isURL(request.body.url)) {

        logPrefix += '[' + request.body.url + '] ';
        console.log(logPrefix + "Received request: " + "url: " + request.body.url + " | deviceName: " + request.body.deviceName + " | browserWidth: " + request.body.browserWidth + " | browserHeight: " + request.body.browserHeight + " | isFullpage: " + request.body.isFullpage);

        const browser = await puppeteer.launch({
            args: [
                "--disable-setuid-sandbox",
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        });

        try {
            var width = 1200, height = 800;
            const page = await browser.newPage();

            if (request.body.deviceName !== null && getDeviceData(request.body.deviceName)) {
                if (request.body.deviceName === "Desktop") {
                    if (request.body.browserWidth) width = request.body.browserWidth;
                    if (request.body.browserHeight) height = request.body.browserHeight;

                    await page.setViewport({
                        width: width,
                        height: height,
                        isMobile: false,
                        hasTouch: false,
                        isLandscape: false
                    });
                    await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36");
                }
                else {
                    const device = puppeteer.devices[request.body.deviceName];
                    if (device) {
                        await page.emulate(device);
                    }
                    else {
                        await page.setViewport({
                            width: width,
                            height: height,
                            isMobile: false,
                            hasTouch: false,
                            isLandscape: false
                        });
                        await page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36");
                    }
                }
            }

            console.info(logPrefix + "Loading webpage");
            await page.goto(request.body.url, { waitUntil: 'networkidle0', timeout: 120000 });
            response.set('Content-Type', 'image/png');

            if (request.body.isFullpage !== null && request.body.isFullpage) {
                console.info(logPrefix + "Auto-scroll starting");
                await autoScroll(page, 10000);
                console.info(logPrefix + "Auto-scroll completed");

                console.info(logPrefix + "Screenshot (full) starting");
                response.send(await page.screenshot({ fullPage: true }));
                console.info(logPrefix + "Screenshot (full) completed");
            }
            else if (request.body.isFullpage === null || !request.body.isFullpage) {
                console.info(logPrefix + "Screenshot (partial) starting");
                response.send(await page.screenshot({ fullPage: false }));
                console.info(logPrefix + "Screenshot (partial) completed");
            }
            console.info(logPrefix + "Request completed");

        } catch (error) {
            if (error.message.includes("ERR_CERT_COMMON_NAME_INVALID")) {
                response.status(400).send();
            }
            else if (error.message.includes("ERR_NAME_NOT_RESOLVED") || error.message.includes("ERR_CONNECTION_REFUSED")) {
                response.status(404).send();
            }
            else if (error.message.includes("ERR_TIMED_OUT") || error.message.includes("Navigation timeout")) {
                response.status(408).send();
            }
            else if (error.message.includes("Unable to capture screenshot")) {
                response.status(500).send();
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
