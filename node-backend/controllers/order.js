const Order = require('../models/order')
const axios = require('axios')

exports.addOrder = async(customer,product,artisan) => {
    try {
        await Order.create({
            customer,
            product,
            artisan
        }).then(async() => {
            await axios.post('http://localhost:5000/create-analytics-entry',{
                artisan_id: artisan,
                product_id: product
            })
            return 1
        })
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

exports.getOrders = async(req,res) => {
    try {
        const {artisan} = req.params.id 
        const orders = await Order.find({artisan})
        if(!orders){
            return res.status(200).json("No orders found")
        }
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json(error.message)
    }
}

