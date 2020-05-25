const cheerio = require('cheerio')
const Nightmare = require('nightmare')

const nightmare = Nightmare({ show: false })
const url = "https://www.promet.si/portal/sl/stevci-prometa.aspx"

module.exports = {

    runScraper: async () => {
        var data = [];

        await nightmare
            .goto(url)
            .wait('body')
            .evaluate(() => document.querySelector('body').innerHTML)
            .end()
            .then(response => {
                data = parseData(response)
            }).catch(err => {
                console.log(err);
                data = null;
                return err;
            });
        
        return data;
    },
}

function parseData(html) {
    const scrapedData = []
    const $ = cheerio.load(html)

    $('tr.PrometPanelItem').each((i, element) => {
        const tds = $(element).find("td");
        const lokacija = $(tds[1]).text();
        const cesta = $(tds[2]).text();
        const smer = $(tds[3]).text();
        const pas = $(tds[4]).text();
        const stevilo_vozil = $(tds[5]).text();
        const hitrost = $(tds[6]).text();
        const razmik = $(tds[7]).text();
        const stanje = $(tds[8]).text();

        const entry = { lokacija, cesta, smer, pas, stevilo_vozil, hitrost, razmik, stanje }
        scrapedData.push(entry)
    })

    return scrapedData
}



