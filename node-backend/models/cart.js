const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    customer:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    product:[{
        type:mongoose.Types.ObjectId,
        ref:'Product'
    }]
})

module.exports = mongoose.model('Cart', cartSchema)