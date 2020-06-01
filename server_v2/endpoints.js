const express = require('express')

const Scraper = require('./scraper')
const CameraScraper = require('./scraper_camera')

const PovpHitrost = require('./povp_hitrost')
const GostotaPrometa = require('./gostota_prometa')
const Ceste = require('./ceste')

const router = express.Router()

var data = null;
var lastScrape = new Date(null);

router.get('/api/v1/all', async (req, res) => {
    data = await Scraper.runScraper();

    res.send(JSON.stringify(data));
})

router.get('/api/v1/ceste', async (req, res) => {
    data = await Scraper.runScraper();

    res.send(JSON.stringify(Ceste.run(req, data)));
})

router.get('/api/v1/povprecna_hitrost', async (req, res) => {
    data = await Scraper.runScraper();

    try {
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    data = await Scraper.runScraper();

    try {
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota', async (req, res) => {
    data = await Scraper.runScraper();

    try {
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density', async (req, res) => {
    data = await Scraper.runScraper();

    try {
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density/:road', async (req, res) => {
    data = await Scraper.runScraper();

    try {
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/kamere', async (req, res) => {
    res.send(JSON.stringify(await CameraScraper.getCameras()))
})

router.get('/api/v1/kamere/:password', async (req, res) => {
    res.send(JSON.stringify(await CameraScraper.scrapeToFile(req, res)))
})

// dobi lokacijo iz android appa
router.post('/api/v1/lokacija', async (req, res) => {
    console.log("From android app: " + req)
})

initScraper();

async function initScraper() {
    data = await Scraper.runScraper();
}

module.exports = router