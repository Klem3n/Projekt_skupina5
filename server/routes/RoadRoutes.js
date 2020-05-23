var express = require('express');
var router = express.Router();
var RoadController = require('../controllers/RoadController.js');

/*
 * GET
 */
router.get('/', RoadController.list);

/*
 * GET
 */
router.get('/:id', RoadController.show);

/*
 * POST
 */
router.post('/', RoadController.create);

/*
 * PUT
 */
router.put('/:id', RoadController.update);

/*
 * DELETE
 */
router.delete('/:id', RoadController.remove);

module.exports = router;
