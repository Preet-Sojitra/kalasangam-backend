const Order = require("../models/order")
const Product = require("../models/product")
const axios = require("axios")

/**
 * Place an order for a product
 *
 * @param {Object} user
 * @param {Object} product
 * @param {String} paymentMode
 * @returns Placed order
 */
exports.addOrder = async (
  user,
  product,
  paymentMode,
  paymentId,
  paymentMethod
) => {
  const { id: customerId, mobile } = user
  //   console.log(customerId, mobile, product)

  //  Get all the details of the product based on the product id
  const productDetails = await Product.findById(product.id)
  const artisanId = productDetails.artist
  //   console.log(productDetails)

  //   Check if the product is in stock or not
  if (productDetails.quantity < product.purchasedQuantity) {
    throw new Error("Product is out of stock")
  }

  try {
    const order = await Order.create({
      customer: customerId,
      product: product.id,
      artisan: artisanId,
      purchasedQuantity: product.purchasedQuantity,
      paymentMode,
      paymentId,
      paymentMethod,
    })

    if (!order) {
      throw new Error("Order not placed. Please try again later.")
    }

    //   Update the product quantity
    productDetails.quantity -= product.purchasedQuantity
    await productDetails.save()

    return order
  } catch (error) {
    console.log(error)
    throw error
  }

  // try {
  //     await Order.create({
  //         customer,
  //         product,
  //         artisan,
  //         qty
  //     }).then(async() => {
  //         const product = await Product.findById(product).exec()
  //         product.qty -= qty
  //         await product.save()
  //         await axios.post('http://localhost:5000/create-analytics-entry',{
  //             artisan_id: artisan,
  //             product_id: product
  //         })
  //         return 1
  //     })
  // } catch (error) {
  //     throw error
  // }
}

exports.getOrders = async (req, res) => {
  try {
    // const { artisan } = req.params.id
    const orders = await Order.find({}).populate("product")
    if (!orders) {
      return res.status(200).json("No orders found")
    }
    return res.status(200).json(orders)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
//updating status
exports.updateOrder = async (req, res) => {
  try {
    let orderData = await Order.findById(req.params.id)

    if (!orderData) return res.status(404).json({ message: "Order not found!" })

    await Order.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: orderData },
      { new: true }
    ).then(() => {
      return res.status(200).json({ message: "Order Updated!" })
    })
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
