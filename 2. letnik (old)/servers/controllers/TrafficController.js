var TrafficModel = require('../models/TrafficModel.js');

/**
 * TrafficController.js
 *
 * @description :: Server-side logic for managing Traffics.
 */
module.exports = {

    /**
     * TrafficController.list()
     */
    list: function (req, res) {
        TrafficModel.find(function (err, Traffics) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Traffic.',
                    error: err
                });
            }
            return res.json(Traffics);
        });
    },

    /**
     * TrafficMetersController.recieve()
     */
    recieve: function (req, res) {
        console.log(req);
        console.log(">... POST: /scrapedEvents -- Recieved " + req.body.num + " events");
        req.body.events.forEach(function(event) {

            var scrapper = new TrafficMetersModel({
                Location : event.Location,
                Road : event.Road,
                Direction : event.Direction,
                NumberofVehicles : event.NumberofVehicles,
                Speed : event.Speed,
                Condition : event.Condition,
            });

            scrapper.save(function (err, result) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when saving TrafficMeters.',
                        error: err
                    });
                }
                return res.status(201).json(TrafficMeters);
            });
        })
    },

    /**
     * TrafficController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        TrafficModel.findOne({_id: id}, function (err, Traffic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Traffic.',
                    error: err
                });
            }
            if (!Traffic) {
                return res.status(404).json({
                    message: 'No such Traffic'
                });
            }
            return res.json(Traffic);
        });
    },

    /**
     * TrafficController.create()
     */
    create: function (req, res) {
        var Traffic = new TrafficModel({
			location : req.body.location,
			road : req.body.road,
			direction : req.body.direction,
			zone : req.body.zone,
			num_vehicles : req.body.num_vehicles,
			speed : req.body.speed,
			distance : req.body.distance,
			condition : req.body.condition

        });

        Traffic.save(function (err, Traffic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating Traffic',
                    error: err
                });
            }
            return res.status(201).json(Traffic);
        });
    },

    /**
     * TrafficController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        TrafficModel.findOne({_id: id}, function (err, Traffic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Traffic',
                    error: err
                });
            }
            if (!Traffic) {
                return res.status(404).json({
                    message: 'No such Traffic'
                });
            }

            Traffic.location = req.body.location ? req.body.location : Traffic.location;
			Traffic.road = req.body.road ? req.body.road : Traffic.road;
			Traffic.direction = req.body.direction ? req.body.direction : Traffic.direction;
			Traffic.zone = req.body.zone ? req.body.zone : Traffic.zone;
			Traffic.num_vehicles = req.body.num_vehicles ? req.body.num_vehicles : Traffic.num_vehicles;
			Traffic.speed = req.body.speed ? req.body.speed : Traffic.speed;
			Traffic.distance = req.body.distance ? req.body.distance : Traffic.distance;
			Traffic.condition = req.body.condition ? req.body.condition : Traffic.condition;
			
            Traffic.save(function (err, Traffic) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Traffic.',
                        error: err
                    });
                }

                return res.json(Traffic);
            });
        });
    },

    /**
     * TrafficController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        TrafficModel.findByIdAndRemove(id, function (err, Traffic) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Traffic.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }
};
