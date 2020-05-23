var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var RoadSchema = new Schema({
	'Longitude' : String,
	'Latitude' : String,
	'Date' : String
});

module.exports = mongoose.model('Road', RoadSchema);
