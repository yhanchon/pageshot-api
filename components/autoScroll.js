
async function autoScroll(page, maxHeight) {
    
    await page.evaluate(async (maxHeight) => {
        return new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

                window.scrollBy(0, distance);
                totalHeight += distance;

                if ((totalHeight >= scrollHeight - document.documentElement.clientHeight) || totalHeight >= maxHeight - document.documentElement.clientHeight) {
                    window.scrollTo(0, 0);
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
            window.scrollTo(0, 0);
        });
    }, maxHeight);
}

exports.autoScroll = autoScroll;
