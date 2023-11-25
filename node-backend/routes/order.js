const express = require('express')
const {getOrders, updateOrder} = require('../controllers/order')

const router = express.Router()

router.get("/order/:id",getOrders)

router.put("/update/order/:id", updateOrder)

module.exports = router