var mongoose = require('mongoose')
var Schema = mongoose.Schema

var locationSchema = new Schema({
    longitude: String,
    latitude: String,
    speed: String,
    address: String,
    uuid: String,
    name: String
})

var LocationModel = mongoose.model('locations', locationSchema)
module.exports = LocationModel