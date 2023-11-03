const Product = require('../models/product')

exports.addProduct = async(req,res) => {
    try {
        const {name,price,description} = req.body 
        const images = req.files.images

        if(!name || !price || !description){
            return res.status(400).json({message: "Please enter all details"})
        }

        if(req.files){
            // code to store images in azure blob storgae
        }

        await Product.create({
            name,
            price,
            description
        }).then(() => {
            res.status(200).json({message: "OK"})
        })
    } catch (error) {
        return res.status(500).json(error)
    }
}