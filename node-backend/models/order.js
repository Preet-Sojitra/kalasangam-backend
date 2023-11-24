const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Types.ObjectId,
        ref:'User'
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref:'Product'
    },
    artisan: {
        type: mongoose.Types.ObjectId,
        ref:'Artisan'
    }
})

module.exports = mongoose.model('Order',orderSchema)
