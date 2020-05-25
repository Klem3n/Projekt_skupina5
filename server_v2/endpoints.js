const express = require('express')

const Scraper = require('./scraper')

const PovpHitrost = require('./povp_hitrost')

const router = express.Router()

router.get('/api/v1/all', async (req, res) => {
    res.send(JSON.stringify(await Scraper.runScraper()));
})

router.get('/api/v1/povprecna_hitrost/:cesta', async (req, res) => {
    res.send(await PovpHitrost.run());
})

module.exports = router