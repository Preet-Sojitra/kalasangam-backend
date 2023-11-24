const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:String,
    price:Number,
    description: String,
    images:[
        {
            key:String,
            url:String
        }
    ],
    model:String,
}, {timestamps: true})

module.exports = mongoose.model('Product',productSchema)