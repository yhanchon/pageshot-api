
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {

            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

                window.scrollBy(0, distance);
                totalHeight += distance;

                if ((totalHeight >= scrollHeight - window.innerHeight) || totalHeight >= 2000) {
                    window.scrollTo(0, 0);
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
            window.scrollTo(0, 0);
        });
    });
}

exports.autoScroll = autoScroll;
