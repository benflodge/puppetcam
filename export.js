const puppeteer = require("puppeteer");
const Xvfb = require("xvfb");
const xvfb = new Xvfb({ silent: true }); // Single instance or capable of many ?

function getPuppeteerOptions(options) {

    return options = {
        headless: false,
        args: [
            "--enable-usermedia-screen-capturing",
            "--allow-http-screen-capture",
            "--auto-select-desktop-capture-source=puppetcam",
            "--load-extension=" + __dirname,
            ,
            "--disable-extensions-except=" + __dirname,
            "--disable-infobars",
            `--window-size=${options.width || 1280},${options.height || 720}`,
        ],
    };
}

async function main(options = {}) {

    xvfb.startSync();

    const url = options.url || "http://tobiasahlin.com/spinkit/";
    const exportname = options.exportname || "spinner.webm";
    
    const browser = await puppeteer.launch(getPuppeteerOptions(options));
    const pages = await browser.pages();
    const page = pages[0];
    await page._client.send("Emulation.clearDeviceMetricsOverride");
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.setBypassCSP(true);

    // Perform any actions that have to be captured in the exported video
    await page.waitFor(8000);

    await page.evaluate(filename => {
        window.postMessage(
            { type: "SET_EXPORT_PATH", filename: filename },
            "*"
        );
        window.postMessage({ type: "REC_STOP" }, "*");
    }, exportname);

    // Wait for download of webm to complete
    await page.waitForSelector("html.downloadComplete", { timeout: 0 });
    await browser.close();
    xvfb.stopSync();
}

module.exports.main = main;
