var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var TrafficMetersSchema = new Schema({
	'Location' : String,
	'Road' : String,
	'Direction' : String,
	'NumberofVehicles' : Number,
	'Speed' : Number,
	'Condition' : String
});

module.exports = mongoose.model('TrafficMeters', TrafficMetersSchema);
