var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var TrafficSchema = new Schema({
	'location' : String,
	'road' : String,
	'direction' : String,
	'zone' : String,
	'num_vehicles' : String,
	'speed' : String,
	'distance' : String,
	'condition' : String
});

module.exports = mongoose.model('Traffic', TrafficSchema);
