var express = require('express');
var router = express.Router();
var TrafficController = require('../controllers/TrafficController.js');

var Scraper = require('../scraper')
var CameraScraper = require('../scraper_camera')

var PovpHitrost = require('../controllers/povp_hitrost')
var GostotaPrometa = require('../controllers/gostota_prometa')
var Ceste = require('../controllers/ceste')

var data = null;
var lastScrape = new Date(null); 

/*
 * GET
 */
router.get('/', TrafficController.list);
router.get('/:id', TrafficController.show);
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

    try{
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    data = await Scraper.runScraper();

    try{
        res.send(JSON.stringify(PovpHitrost.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota', async (req, res) => {
    data = await Scraper.runScraper();

    try{
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density', async (req, res) => {
    data = await Scraper.runScraper();

    try{
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/gostota/:density/:road', async (req, res) => {
    data = await Scraper.runScraper();

    try{
        res.send(JSON.stringify(GostotaPrometa.run(req, data)));
    } catch(err){
        res.send(JSON.stringify("Error: " + err));
    }
})

router.get('/api/v1/kamere', async (req, res) => {
    res.send(JSON.stringify(await CameraScraper.getCameras()))
})

router.get('/api/v1/kamere/:password', async (req, res) => {
    res.send(JSON.stringify(await CameraScraper.scrapeToFile(req, res)))
})

initScraper();

/*
 * POST
 */
router.post('/', TrafficController.recieve);

/*
 * PUT
 */
router.put('/:id', TrafficController.update);

/*
 * DELETE
 */
router.delete('/:id', TrafficController.remove);


async function initScraper(){
    data = await Scraper.runScraper();
}

module.exports = router;
