const express = require("express")
const { getOrders, updateOrder, getMyOrders } = require("../controllers/order")

const router = express.Router()

router.get("/myorders", getMyOrders)

// router.get("/order/:id",getOrders)
// router.put("/update/order/:id", updateOrder)

module.exports = router
