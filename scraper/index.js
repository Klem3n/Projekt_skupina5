const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

// Middleware
app.use(cors())

const routes = require('./endpoints.js')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use('/', routes)

const port = process.env.PORT || 4999

app.listen(port, () => console.log("Server listening on port " + port))
