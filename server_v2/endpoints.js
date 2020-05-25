const express = require('express')

const Scraper = require('./scraper')

const router = express.Router()

router.get('/api/v1/all', async (req, res) => {
    res.send(await Scraper.runScraper());
})

module.exports = router