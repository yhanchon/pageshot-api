
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {

            var totalHeight = 0;
            var distance = 180;
            var timer = setInterval(() => {
                var scrollHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

                window.scrollBy(0, distance);
                totalHeight += distance;

                if ((totalHeight >= scrollHeight - window.innerHeight) || totalHeight >= 2000) {
                    clearInterval(timer);
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, 800);


            /*
            var waitFor10Secs = new Promise((resolve2) => {
                setTimeout(() => {
                    resolve2();
                }, 30000);
            });

            waitFor10Secs.then(result => {
            
            });
            */
        });
    });
}

exports.autoScroll = autoScroll;
