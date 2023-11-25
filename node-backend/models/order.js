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
    },
    status:{
        type:String,
        enum:[
            'PLACED',
            'IN TRANSIT',
            'DELIVERED'
        ],
        default: 'PLACED'
    },
    qty:Number
})

module.exports = mongoose.model('Order',orderSchema)
