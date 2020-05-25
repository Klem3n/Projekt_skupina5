const cheerio = require('cheerio')
const Nightmare = require('nightmare')

const nightmare = Nightmare({ show: false })
const url = "https://www.promet.si/portal/sl/stevci-prometa.aspx"

module.exports = {

    runScraper: async () => {
        nightmare
            .goto(url)
            .wait('body')
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                // console.log(response)
                parseData(response)
            }).catch(err => {
                console.log(err);
            });
    },
}

function parseData(html) {
    const $ = cheerio.load(html)
    //console.log($.html())
    $('tr.PrometPanelItem').each((i, el) => {
        console.log($(el).text())
        return $(el).text()
        //console.log($())
    })
}



