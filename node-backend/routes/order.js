const express = require("express")
const {
  getArtisanOrders,
  updateOrder,
  getMyOrders,
  getOrder,
} = require("../controllers/order")

const { authorize, ROLES } = require("../middlewares/auth")

const router = express.Router()

router.get("/myorders", authorize(ROLES.USER), getMyOrders)
router.get("/artisan/allorders", authorize(ROLES.ARTISAN), getArtisanOrders)
router.get("/:id", getOrder)

// router.get("/order/:id",getOrders)
// router.put("/update/order/:id", updateOrder)

module.exports = router
