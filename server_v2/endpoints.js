const express = require('express')

const Scraper = require('./scraper')

const PovpHitrost = require('./povp_hitrost')

const router = express.Router()

router.get('/api/v1/all', async (req, res) => {
    res.send(JSON.stringify(await Scraper.runScraper()));
})

router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    try{
        res.send(await PovpHitrost.run(req));
    } catch(err){
        res.send("Error: " + err);
    }
})

module.exports = router