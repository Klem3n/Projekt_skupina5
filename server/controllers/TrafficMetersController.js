var TrafficMetersModel = require('../models/TrafficMetersModel.js');

/**
 * TrafficMetersController.js
 *
 * @description :: Server-side logic for managing TrafficMeterss.
 */
module.exports = {

    /**
     * TrafficMetersController.list()
     */
    list: function (req, res) {
        TrafficMetersModel.find(function (err, TrafficMeterss) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting TrafficMeters.',
                    error: err
                });
            }
            return res.json(TrafficMeterss);
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
     * TrafficMetersController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        TrafficMetersModel.findOne({_id: id}, function (err, TrafficMeters) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting TrafficMeters.',
                    error: err
                });
            }
            if (!TrafficMeters) {
                return res.status(404).json({
                    message: 'No such TrafficMeters'
                });
            }
            return res.json(TrafficMeters);
        });
    },

    /**
     * TrafficMetersController.create()
     */
    create: function (req, res) {
        var TrafficMeters = new TrafficMetersModel({
			Location : req.body.Location,
			Road : req.body.Road,
			Direction : req.body.Direction,
			NumberofVehicles : req.body.NumberofVehicles,
			Speed : req.body.Speed,
			Condition : req.body.Condition

        });

        TrafficMeters.save(function (err, TrafficMeters) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating TrafficMeters',
                    error: err
                });
            }
            return res.status(201).json(TrafficMeters);
        });
    },

    showImages: function (req, res) {
        res.render('user/images');
    }
    ,
    showData: function (req, res) {
        res.render('user/data');
    }
    ,

    /**
     * TrafficMetersController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        TrafficMetersModel.findOne({_id: id}, function (err, TrafficMeters) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting TrafficMeters',
                    error: err
                });
            }
            if (!TrafficMeters) {
                return res.status(404).json({
                    message: 'No such TrafficMeters'
                });
            }

            TrafficMeters.Location = req.body.Location ? req.body.Location : TrafficMeters.Location;
			TrafficMeters.Road = req.body.Road ? req.body.Road : TrafficMeters.Road;
			TrafficMeters.Direction = req.body.Direction ? req.body.Direction : TrafficMeters.Direction;
			TrafficMeters.NumberofVehicles = req.body.NumberofVehicles ? req.body.NumberofVehicles : TrafficMeters.NumberofVehicles;
			TrafficMeters.Speed = req.body.Speed ? req.body.Speed : TrafficMeters.Speed;
			TrafficMeters.Condition = req.body.Condition ? req.body.Condition : TrafficMeters.Condition;
			
            TrafficMeters.save(function (err, TrafficMeters) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating TrafficMeters.',
                        error: err
                    });
                }

                return res.json(TrafficMeters);
            });
        });
    },

    /**
     * TrafficMetersController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        TrafficMetersModel.findByIdAndRemove(id, function (err, TrafficMeters) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the TrafficMeters.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }

    
};
