const { StatusCodes } = require("http-status-codes")
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

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Orders placed by the user
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    // console.log(req.user)
    const userId = req.user.id
    const orders = await Order.find({ customer: userId }).populate("product")

    return res.status(200).json(orders)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns Return all the orders placed for the artisan
 */
exports.getArtisanOrders = async (req, res, next) => {
  try {
    // console.log(req.user)
    const artisanId = req.user.id

    const orders = await Order.find({ artisan: artisanId }).populate("product")

    if (!orders) {
      return res.status(StatusCodes.OK).json("No orders found")
    }

    return res.status(StatusCodes.OK).json(orders)
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id
    console.log(orderId)

    const order = await Order.findById(orderId).populate("product")

    if (!order) {
      return res.status(StatusCodes.OK).json("No orders found")
    }

    return res.status(StatusCodes.OK).json(order)
  } catch (error) {
    console.log(error)
    next(error)
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
