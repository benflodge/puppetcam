const puppeteer = require("./export");

const argv = require("yargs")
    .usage("Usage: $0 --exportname=test.webm' --url=[str] -w [str] -h [str]")
    .example("$0 --exportname='test.webm' --url='http://tobiasahlin.com/spinkit/' -w 1280 -h 720")
    .argv;

function main() {
    const options = {
        url: argv.url || null,
        exportname: argv.exportname || null,
        h: argv.h || null,
        w: argv.w || null,
    }
    puppeteer.main(options)
}

main();
