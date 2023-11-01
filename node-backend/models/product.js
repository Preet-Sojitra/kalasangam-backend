const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:String,
    price:String,
    description: String,
    images:[
        {
            name:String,
            url:String
        }
    ],
    model:String,
}, {timestamps: true})

module.exports = mongoose.model('Product',productSchema)