const express = require('express')
const cors = require('cors')

const app = express()

// Middleware
app.use(cors())

const routes = require('./endpoints.js')

app.use('/', routes)

const port = process.env.PORT || 5000

app.listen(port, () => console.log("Server listening on port " + port))
