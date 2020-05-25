const express = require('express')

const Scraper = require('./scraper')

const PovpHitrost = require('./povp_hitrost')
const GostotaPrometa = require('./gostota_prometa')

const router = express.Router()

router.get('/api/v1/all', async (req, res) => {
    res.send(JSON.stringify(await Scraper.runScraper()));
})

router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    try{
        res.send(JSON.stringify(await PovpHitrost.run(req)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density', async (req, res) => {
    try{
        res.send(JSON.stringify(await GostotaPrometa.run(req)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density/:road', async (req, res) => {
    try{
        res.send(JSON.stringify(await GostotaPrometa.run(req)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

module.exports = router