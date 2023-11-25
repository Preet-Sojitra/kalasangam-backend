require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_TEST_KEY)
const {addOrder} = require('../controllers/order')

exports.checkout = async(req,res) => {
    try {
       const {products,customer} = req.body 
       // product - id,name,price and qty
        // customer - id
       const params = {
            submit_type: 'pay',
            mode: 'payment',
            currency: 'inr',
            // customer: customer,
            payment_method_types: ['card'],
            line_items: products.map((item) => {      
                return {
                  price_data: { 
                    currency: 'inr',
                    product_data: { 
                      name: item.name,
                    },
                    unit_amount: item.price * 100,
                  },
                  adjustable_quantity: {
                    enabled:true,
                    minimum: 1,
                  },
                  quantity: item.qty
                }
              }),
              success_url: `http://localhost:3000/payment/success`,
              cancel_url: `http://localhost:3000/payment/canceled`,
            }

        // console.log(params.line_items);

        const session = await stripe.checkout.sessions.create(params)
        await products.map(async(product) => {
            await addOrder(customer,product.id,product.artisian,product.qty)
        })
        return res.status(200).json(session.url)

    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.cod = (req, res)=>{
    try {
        const {products,customer} = req.body 
        products.map(async(product) => {
            await addOrder(customer,product.id,product.artisian,product.qty)
        })
        return res.status(200).json("Order Placed")
    } catch (error) {
        return res.status(500).json(error.message)
    }
}