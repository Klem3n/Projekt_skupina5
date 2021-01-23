const express = require('express')
const request = require('request');

const PovpHitrost = require('./povp_hitrost')
const GostotaPrometa = require('./gostota_prometa')
const Ceste = require('./ceste')
const Lokacija = require('./lokacija')

const router = express.Router()

const LocationModel = require('./models/locationModel.js')
const RadarModel = require('./models/radarModel')

// vrne JSON objekt trenutnih live radarskih slik in imena cest / predorov
router.get('/api/v1/kamere', async (req, res) => {
    requestData("kamere", function (response) {
        res.send(response)
    })
})

// Vrne vse podatke iz promet.si tabele
router.get('/api/v1/all', async (req, res) => {
    requestData("ceste", function (response) {
        res.send(response)
    })
})

// vrne seznam cest
router.get('/api/v1/ceste', async (req, res) => {
    requestData("ceste", function (response) {
        var data = JSON.parse(response);

        if (data != null)
            res.send(JSON.stringify(Ceste.run(req, data)))
    })
})

// vrne povprecno hitrost na vsaki izmed cest
router.get('/api/v1/povprecna_hitrost', async (req, res) => {
    try {
        requestData("ceste", function (response) {
            var data = JSON.parse(response);

            if (data != null)
                res.send(JSON.stringify(PovpHitrost.run(req, data)))
        })
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

// vrne povprecno hitrost za podano cesto
router.get('/api/v1/povprecna_hitrost/:road', async (req, res) => {
    try {
        requestData("ceste", function (response) {
            var data = JSON.parse(response);

            if (data != null)
                res.send(JSON.stringify(PovpHitrost.run(req, data)))
        })
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

// vrne par cesta : gostota
router.get('/api/v1/gostota', async (req, res) => {
    try {
        requestData("ceste", function (response) {
            var data = JSON.parse(response);

            if (data != null)
                res.send(JSON.stringify(GostotaPrometa.run(req, data)))
        })
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

// vrne trenutno gostoto prometa na podani cesti kot parameter :density
router.get('/api/v1/gostota/:density', async (req, res) => {
    try {
        requestData("ceste", function (response) {
            var data = JSON.parse(response);

            if (data != null)
                res.send(JSON.stringify(GostotaPrometa.run(req, data)))
        })
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

// vrne podatno gostoto :density na podani cesti :road
router.get('/api/v1/gostota/:density/:road', async (req, res) => {
    try {
        requestData("ceste", function (response) {
            var data = JSON.parse(response);

            if (data != null)
                res.send(JSON.stringify(GostotaPrometa.run(req, data)))
        })
    } catch (err) {
        res.send(JSON.stringify("Error: " + err));
    }
})

router.post('/api/v1/ceste', async (req, res) => {
    Ceste.sendSigns(req, res)
})

// dobi lokacijo iz android appa
router.post('/api/v1/lokacija', async (req, res) => {
    //Lokacija.save(req, res);

    var loc = new LocationModel({
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        speed: req.body.speed,
        address: req.body.address,
        uuid: req.body.uuid,
        name: req.body.name
    })

    /*
    loc.save((err, location) => {
        if (err) {
            //return res.send(500)
        } else {
            // console.log(res.status(201).json(user))
            //return res.sendStatus(200)
        }
    })
    */

    var query = { 'uuid': req.body.uuid }
    LocationModel.findOneAndUpdate(query, loc, { upsert: true }, (err, doc) => {
        return res.send('Saved')
    })
})

router.post('/api/v1/report_radar', async (req, res) => {


    console.log("recieved radar report")

    const obj = JSON.parse(JSON.stringify(req.body));

    //console.log(obj.longitude);
    //console.log(obj.uuid)

    /*
    var rad = new RadarModel({
        longitude: obj.longitude,
        latitude: obj.latitude,
        address: obj.address,
        uuid: obj.uuid
    })
    */

    var rad = new RadarModel({
        longitude: CoDepress.compress(obj.longitude),
        latitude: CoDepress.compress(obj.latitude),
        address: CoDepress.compress(obj.address),
        uuid: CoDepress.compress(obj.uuid)
    })
    /*
    var x = CoDepress.compress(obj.address);
    console.log("Encoded Address: " + x)
    console.log("Decoded Address: " + CoDepress.decompress(x))
    */

    var query = { 'uuid': CoDepress.compress(obj.uuid) }
    RadarModel.findOneAndUpdate(query, rad, { upsert: true }, (err, doc) => {
        return res.send('Saved')
    })

})

router.get('/api/v1/fetch_all_radar', async (req, res) => {

    console.log("fetching all radarji")

    RadarModel.find().sort({
        _id: -1
    }).exec((err, docs) => {
        //console.log(docs)

        var temp = []

        //console.log(temp)

        docs.forEach((element, index, array) => {
            var obj = {
                longitude: CoDepress.decompress(element.longitude),
                latitude: CoDepress.decompress(element.latitude),
                address: CoDepress.decompress(element.address),
                uuid: CoDepress.decompress(element.uuid),

            }
            temp.push(obj)
            console.log(obj)
        });

        res.send(JSON.stringify(temp))


    })

})

router.get('/api/v1/lokacija', async (req, res) => {
    LocationModel.find().sort({
        _id: -1
    }).exec((err, docs) => {
        //console.log(docs)
        res.send(JSON.stringify(docs))
    })
})

module.exports = router

var requestIndex = 0;

var scrapers = [
    "http://localhost:4999/",
    "http://192.168.0.27:4999/"
]

function requestData(endpoint, callback) {
    console.log("Requesting", scrapers[requestIndex % scrapers.length] + endpoint)
    request(scrapers[requestIndex++ % scrapers.length] + endpoint, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            callback(html)
        } else {
            callback(error)
        }
    });
}

// VP - encoding

var dictionary = {},
    reverseDictionary = {};

var CoDepress = {
    fillDictionary: function () {
        dictionary[-2] = "0000";
        dictionary[-1] = "0001";
        dictionary[1] = "0010";
        dictionary[2] = "0011";

        dictionary[-6] = "01000";
        dictionary[-5] = "01001";
        dictionary[-4] = "01010";
        dictionary[-3] = "01011";
        dictionary[6] = "01100";
        dictionary[5] = "01101";
        dictionary[4] = "01110";
        dictionary[3] = "01111";

        dictionary[-14] = "100000";
        dictionary[-13] = "100001";
        dictionary[-12] = "100010";
        dictionary[-11] = "100011";
        dictionary[-10] = "100100";
        dictionary[-9] = "100101";
        dictionary[-8] = "100110";
        dictionary[-7] = "100111";
        dictionary[14] = "101111";
        dictionary[13] = "101110";
        dictionary[12] = "101101";
        dictionary[11] = "101100";
        dictionary[10] = "101011";
        dictionary[9] = "101010";
        dictionary[8] = "101001";
        dictionary[7] = "101000";

        dictionary[-30] = "1100000";
        dictionary[-29] = "1100001";
        dictionary[-28] = "1100010";
        dictionary[-27] = "1100011";
        dictionary[-26] = "1100100";
        dictionary[-25] = "1100101";
        dictionary[-24] = "1100110";
        dictionary[-23] = "1100111";
        dictionary[-22] = "1101000";
        dictionary[-21] = "1101001";
        dictionary[-20] = "1101010";
        dictionary[-19] = "1101011";
        dictionary[-18] = "1101100";
        dictionary[-17] = "1101101";
        dictionary[-16] = "1101110";
        dictionary[-15] = "1101111";
        dictionary[30] = "1111111";
        dictionary[29] = "1111110";
        dictionary[28] = "1111101";
        dictionary[27] = "1111100";
        dictionary[26] = "1111011";
        dictionary[25] = "1111010";
        dictionary[24] = "1111001";
        dictionary[23] = "1111000";
        dictionary[22] = "1110111";
        dictionary[21] = "1110110";
        dictionary[20] = "1110101";
        dictionary[19] = "1110100";
        dictionary[18] = "1110011";
        dictionary[17] = "1110010";
        dictionary[16] = "1110001";
        dictionary[15] = "1110000";

        Object.keys(dictionary).forEach(function (key) {
            reverseDictionary[dictionary[key]] = key;
        });


    },

    compress: function (uncompressed) {
        var i,
            result = "";
        this.fillDictionary(dictionary);
        var encoded = [...uncompressed];
        var uncompressedCopy = [...uncompressed];

        for (i = 0; i < encoded.length; ++i) {
            var asciiValue = encoded[i].charCodeAt(0);
            if (i != 0) {
                var asciiValueLast = uncompressedCopy[i - 1].charCodeAt(0);
                if (asciiValue == asciiValueLast)
                    encoded[i] = 0;
                else
                    encoded[i] = asciiValue - asciiValueLast;
            }
            else {
                encoded[i] = asciiValue;
            }
        }

        var flagZero = false;
        var numofZeroRepeats = 0;
        var roleNum = -1;
        for (i = 0; i < uncompressed.length; ++i) {
            var resultHelper = "";
            var currentValue = encoded[i];

            if (i == 0) {
                resultHelper = currentValue.toString(2).padStart(8, '0');
            }
            else if (currentValue == 0) {
                ++numofZeroRepeats;
                flagZero = true;
            }
            else if (currentValue != 0) {
                if (flagZero == true) {
                    roleNum = 1;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    let tmpZ = parseInt(numofZeroRepeats) - 1;
                    resultHelper += (tmpZ).toString(2).padStart(3, '0');
                    result += resultHelper;
                    resultHelper = '';
                    flagZero = false;
                    numofZeroRepeats = 0;
                }
                if (Math.abs(currentValue) > 30) {
                    roleNum = 2;
                    resultHelper += Math.abs(currentValue).toString(2).padStart(9, '0');
                    if (currentValue < 0)
                        resultHelper = '1' + resultHelper.substring(1);
                    resultHelper = roleNum.toString(2) + resultHelper;
                }
                else {
                    roleNum = 0;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    resultHelper += dictionary[currentValue];
                }
            }
            if (numofZeroRepeats == 8) {
                roleNum = 1;
                resultHelper += roleNum.toString(2).padStart(2, '0');
                resultHelper += (numofZeroRepeats - 1).toString(2).padStart(3, '0');
                result += resultHelper;
                resultHelper = '';
                flagZero = false;
                numofZeroRepeats = 0;
            }
            if (i == uncompressed.length - 1) {
                if (flagZero) {
                    roleNum = 1;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    resultHelper += (numofZeroRepeats - 1).toString(2).padStart(3, '0');
                    result += resultHelper;
                    resultHelper = '';
                }
                roleNum = 3;
                resultHelper += roleNum.toString(2).padStart(2, '0');
            }
            result += resultHelper;
        }
        return result;
    },

    decompress: function (compressed) {
        var i,
            result = "",
            decodedNumbers = [];

        this.fillDictionary(dictionary);

        var tmpNumber = 0,
            bitCounter = 0;

        console.log("A");
        while (compressed != "11") {
            if (bitCounter == 0) {
                tmpNumber = parseInt(compressed.substring(0, 8), 2);
                decodedNumbers.push(tmpNumber);
                compressed = compressed.substring(8);
                bitCounter += 8;
            }
            else if (compressed.substring(0, 2) == "00") {
                compressed = compressed.substring(2);
                bitCounter += 2;
                if (compressed.substring(0, 2) == "00") {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 4)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(4);
                    bitCounter += 4;
                }
                else if (compressed.substring(0, 2) == "01") {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 5)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(5);
                    bitCounter += 5;
                }
                else if (compressed.substring(0, 2) == "10") {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 6)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(6);
                    bitCounter += 6;
                }
                else if (compressed.substring(0, 2) == "11") {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 7)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(7);
                    bitCounter += 7;
                }
            }
            else if (compressed.substring(0, 2) == "01") {
                compressed = compressed.substring(2);
                bitCounter += 2;
                tmpNumber = parseInt(compressed.substring(0, 3), 2);
                for (i = 0; i <= tmpNumber; ++i)
                    decodedNumbers.push(parseInt(0));
                compressed = compressed.substring(3);
                bitCounter += 3;
            }
            else if (compressed.substring(0, 2) == "10") {
                compressed = compressed.substring(2);
                bitCounter += 2;
                if (compressed.substring(0, 1) == "1")
                    tmpNumber = -parseInt(compressed.substring(1, 9), 2);
                else
                    tmpNumber = parseInt(compressed.substring(0, 9), 2);
                decodedNumbers.push(tmpNumber);
                compressed = compressed.substring(9);
                bitCounter += 9;
            }
        }
        for (i = 1; i < decodedNumbers.length; ++i) {
            decodedNumbers[i] += decodedNumbers[i - 1];
        }
        for (i = 0; i < decodedNumbers.length; ++i) {
            result += String.fromCharCode(decodedNumbers[i]);
        }
        return result;
    }
}
// comp = CoDepress.compress("goooooooorankirov");
// decomp = CoDepress.decompress(comp);
