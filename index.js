const puppeteer = require("./export");

const argv = require("yargs")
    .usage("Usage: $0 --exportname=[str]' --url=[str] --width=[int] --height=[int]")
    .example("$0 --exportname='test.webm' --url='http://tobiasahlin.com/spinkit/' --width=1280 --height=720")
    .argv;

function main() {
    const options = {
        url: argv.url || null,
        exportname: argv.exportname || null,
        height: argv.height || null,
        width: argv.width || null,
    }
    puppeteer.main(options)
}

main();
