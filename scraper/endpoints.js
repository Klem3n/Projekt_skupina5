const express = require('express')

const Scraper = require('./scraper')
const CameraScraper = require('./scraper_camera')

const router = express.Router()

// vrne JSON objekt trenutnih live radarskih slik in imena cest / predorov
router.get('/kamere', async (req, res) => {
    res.send(JSON.stringify(await CameraScraper.getCameras()))
})

router.get('/ceste', async (req, res) => {
    res.send(JSON.stringify(await Scraper.runScraper()))
})

module.exports = router