const express = require('express')

const Scraper = require('./scraper')

const router = express.Router()

router.get('/api/v1/stanje', async (req, res) => {

    await Scraper.runScraper()

    res.send("testni endpoint")
})

module.exports = router