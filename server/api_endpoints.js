const express = require('express')
const router = express.Router()

// Test Endpoint
router.get('/test', (req, res) => {
    res.send(JSON.stringify("Server seems to be working."))
})

module.exports = router