var mongoose = require('mongoose')
var Schema = mongoose.Schema

var radarSchema = new Schema({
    longitude: String,
    latitude: String,
    address: String,
    uuid: String,
})

var RadarModel = mongoose.model('radar_locations', radarSchema)
module.exports = RadarModel