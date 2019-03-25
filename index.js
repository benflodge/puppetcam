const puppeteer = require("./export");

const argv = require("yargs")
    .usage("Usage: $0 --exportname=[str]' --url=[str] --width=[int] --height=[int] --recordtime=[int] --useChrome")
    .example("$0 --exportname='test.webm' --url='http://tobiasahlin.com/spinkit/' --width=1280 --height=720 --useChrome")
    .argv;

function main() {
    const options = {
        url: argv.url || null,
        exportname: argv.exportname || null,
        useChrome: argv.useChrome || false,
        height: argv.height ? argv.height * 1 : null,
        width: argv.width ? argv.width * 1 : null,
        recordTime: argv.recordtime ? argv.recordtime  * 1: null,
    }
    puppeteer.main(options)
}

main();
