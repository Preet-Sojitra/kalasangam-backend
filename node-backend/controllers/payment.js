const { StatusCodes } = require("http-status-codes")

require("dotenv").config()
const stripe = require("stripe")(process.env.STRIPE_KEY)
const { addOrder } = require("../controllers/order")

exports.checkout = async (req, res, next) => {
  // console.log(req.user)
  // console.log(req.body.product)

  try {
    const payment = await stripe.paymentIntents.create({
      amount: req.body.product.totalPrice,
      currency: "inr",
      payment_method: req.body.payment.id,
      confirm: true,
      return_url: "http://localhost:3000/payment/success",
    })

    if (payment) {
      const placeOrder = await addOrder(
        req.user,
        req.body.product,
        "ONLINE",
        payment.id,
        payment.payment_method
      )

      if (!placeOrder) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Something went wrong",
          success: false,
        })
      }
      return res.status(StatusCodes.OK).json({
        message: "Payment Successful",
        success: true,
      })
    }

    // const placedOrder = await addOrder(req.user, req.body.product, "ONLINE")
    // return res.status(StatusCodes.OK).json(placedOrder)
  } catch (error) {
    console.log(error)
    return next(error)
  }

  // try {
  //    const {products,customer} = req.body
  //    // product - id,name,price and qty
  //     // customer - id
  //    const params = {
  //         submit_type: 'pay',
  //         mode: 'payment',
  //         currency: 'inr',
  //         // customer: customer,
  //         payment_method_types: ['card'],
  //         line_items: products.map((item) => {
  //             return {
  //               price_data: {
  //                 currency: 'inr',
  //                 product_data: {
  //                   name: item.name,
  //                 },
  //                 unit_amount: item.price * 100,
  //               },
  //               adjustable_quantity: {
  //                 enabled:true,
  //                 minimum: 1,
  //               },
  //               quantity: item.qty
  //             }
  //           }),
  //           success_url: `http://localhost:5173/success`,
  //           cancel_url: `http://localhost:3000/payment/canceled`,
  //         }

  //     // console.log(params.line_items);

  //     const session = await stripe.checkout.sessions.create(params)
  //     await products.map(async(product) => {
  //         await addOrder(customer,product.id,product.artisian,product.qty)
  //     })
  //     return res.status(200).json(session.url)

  // } catch (error) {
  //     return res.status(500).json(error.message)
  // }
}

exports.cod = (req, res) => {
  try {
    const { products, customer } = req.body
    products.map(async (product) => {
      await addOrder(customer, product.id, product.artisian, product.qty)
    })
    return res.status(200).json({ message: "Order Placed" })
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
