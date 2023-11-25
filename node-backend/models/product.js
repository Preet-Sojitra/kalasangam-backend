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
    artist:{
        type: mongoose.Types.ObjectId,
        ref:'Artisan'
    },
    qty: Number
}, {timestamps: true})

module.exports = mongoose.model('Product',productSchema)