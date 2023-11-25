const express = require("express")
const {
  getCart,
  addProductToCart,
  removeProductFromCart,
} = require("../controllers/cart")

const router = express.Router()

router.get("/cart/:id", getCart)
router.post("/cart/add", addProductToCart)
router.delete("/cart/remove", removeProductFromCart)

module.exports = router
