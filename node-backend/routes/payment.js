const express = require('express')
const {checkout,cod} = require('../controllers/payment')

const router = express.Router()

router.post("/checkout",checkout)
router.post("/cod",cod)

module.exports = router