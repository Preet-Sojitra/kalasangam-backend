const express = require('express')
const {getCart, addProductToCart} = require('../controllers/cart')

const router = express.Router()

router.get("/cart/:id",getCart)
router.post("/cart/add", addProductToCart)

module.exports = router