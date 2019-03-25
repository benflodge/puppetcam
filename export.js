const puppeteer = require("puppeteer");
const Xvfb = require("xvfb");
const xvfb = new Xvfb({ silent: true });

function getPuppetOptions(options) {

    const puppetOptions = {
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

    if(options.useChrome){
        puppetOptions.args.push("--no-sandbox");
        puppetOptions.args.push("--disable-setuid-sandbox");
        puppetOptions.executablePath = '/usr/bin/chromium-browser';
    }
    return puppetOptions;
}

function startRecording (options) {
    console.log("REC_CLIENT_PLAY")
    window.postMessage({ 
        type: "REC_CLIENT_PLAY", 
        data: {
            width: options.width,
            height : options.height,
            url: window.location.origin
        }
    }, "*");
}

function endRecording (filename) {
    window.postMessage({ 
        type: "SET_EXPORT_PATH", 
        filename: filename
    }, "*");
    
    window.postMessage({ type: "REC_STOP" }, "*");
}

async function main(options = {}) {
    xvfb.startSync();

    const url = options.url || "http://tobiasahlin.com/spinkit/";
    const exportname = options.exportname || "spinner.webm";
    
    const browser = await puppeteer.launch(getPuppetOptions(options));
    const pages = await browser.pages();
    const page = pages[0];

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => { 
        console.error('Error', err.toString())
        process.exit(2)
    })

    await page._client.send("Emulation.clearDeviceMetricsOverride");
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.setBypassCSP(true);
    
    await page.evaluate(startRecording, options);

    // Perform any actions that have to be captured in the exported video
    await page.waitFor(options.recordTime || 8000);

    await page.evaluate(endRecording, exportname);

    // Wait for download of webm to complete
    await page.waitForSelector("html.downloadComplete", { timeout: 0 });
    await browser.close();
    xvfb.stopSync();
}

module.exports.main = main;
