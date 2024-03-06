const express = require("express")
const router = express.Router()
const Order = require("../models/order")
const Product = require("../models/product")

router.post("/orders", async (req, res, next) => {
  // DUMMY PAYMENT DATA : ONLY FOR SEEDING
  const paymentId = "pi_3OnF4VSAWaEIhbRZ1L7oByEi"
  const paymentMethod = "pm_1OnF4SSAWaEIhbRZwao7NHGt"

  try {
    const { id: customerId, mobile } = req.user
    const { product } = req.body

    const productDetails = await Product.findById(product.id)
    const artisanId = productDetails.artist

    if (productDetails.quantity < product.purchasedQuantity) {
      throw new Error("Product is out of stock")
    }

    const order = await Order.create({
      customer: customerId,
      product: product.id,
      artisan: artisanId,
      purchasedQuantity: product.purchasedQuantity,
      paymentMode: "ONLINE",
      paymentId,
      paymentMethod,
    })

    if (!order) {
      throw new Error("Order not placed. Please try again later.")
    }

    //   Update the product quantity
    productDetails.quantity -= product.purchasedQuantity
    await productDetails.save()

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
})

module.exports = router
