const express = require('express')
const cors = require('cors')

const app = express()

// Middlewares
app.use(cors())

const api_endpoints = require('./api_endpoints.js')

app.use('/', api_endpoints)

const port = process.env.PORT || 5000

app.listen(port, () => console.log("Server is running on port " + port))