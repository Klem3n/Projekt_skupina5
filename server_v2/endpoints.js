const express = require('express')

const Scraper = require('./scraper')

const PovpHitrost = require('./povp_hitrost')
const GostotaPrometa = require('./gostota_prometa')
const Ceste = require('./ceste')

const router = express.Router()

var data = null;
var lastScrape = new Date(null); 

router.get('/api/v1/all', async (req, res) => {
    await scrapeData();

    res.send(JSON.stringify(data));
})

router.get('/api/v1/ceste', async (req, res) => {
    await scrapeData();

    res.send(JSON.stringify(Ceste.run(req, data)));
})

router.get('/api/v1/povprecna_hitrost', async (req, res) => {
    await scrapeData();

    try{
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    await scrapeData();

    try{
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density', async (req, res) => {
    await scrapeData();

    try{
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density/:road', async (req, res) => {
    await scrapeData();

    try{
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

async function scrapeData(){
    var date = new Date();

    var diff = Math.round((date.getTime() - lastScrape.getTime()) / 60000);

    //Only scrape every 5 minutes
    if(data == null || diff >= 5){
        var newData = await Scraper.runScraper();

        if(newData != null){
            data = newData;
            lastScrape = date;
        } else {
            await scrapeData()
        }
    }
}

module.exports = router