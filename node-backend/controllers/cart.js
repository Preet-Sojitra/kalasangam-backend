const Cart = require("../models/cart")

// send customer id in params
exports.getCart = async (req, res) => {
  try {
    const id = req.params.id
    const cart = await Cart.find({ customer: id }).populate("product")
    if (!cart) {
      return res.status(400).json("cart not found")
    }
    return res.status(200).json(cart)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}

exports.addProductToCart = async (req, res) => {
  try {
    const { customer, productId } = req.body
    // console.log(req.body)
    const cart = await Cart.findOne({ customer })
    if (!cart) {
      const newCart = await Cart.create({
        customer,
      })
      await newCart.product.push(productId)
      await newCart.save()
      // console.log(newCart)
      return res.status(200).json("product added")
    }
    await cart.product.push(productId)
    await cart.save()
    return res.status(200).json("product added")
  } catch (error) {
    return res.status(500).json(error.message)
  }
}

exports.removeProductFromCart = async (req, res) => {
  try {
    // console.log(req.body)
    const { customer, productId } = req.body
    const cart = await Cart.findOne({ customer })
    if (!cart) {
      return res.status(400).json("cart not found")
    }

    // remove product where product id = productId

    await cart.product.map((id) => {
      if (id == productId) {
        cart.product.pull(id)
      }
    })
    await cart.save()
    return res.status(200).json({
      message: "product removed",
    })
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
