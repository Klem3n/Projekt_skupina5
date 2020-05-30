var express = require('express');
var router = express.Router();
var TrafficMetersController = require('../controllers/TrafficMetersController.js');

/*
 * GET
 */
router.get('/', TrafficMetersController.list);
router.get('/images', TrafficMetersController.showImages);
router.get('/data', TrafficMetersController.showData);
/*
 * GET
 */
router.get('/:id', TrafficMetersController.show);

/*
 * POST
 */
router.post('/', TrafficMetersController.recieve);

/*
 * PUT
 */
router.put('/:id', TrafficMetersController.update);

/*
 * DELETE
 */
router.delete('/:id', TrafficMetersController.remove);

module.exports = router;
