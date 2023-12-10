const { StatusCodes } = require("http-status-codes")
// const { v4: uuidv4 } = require("uuid")
const Product = require("../models/product")
const Category = require("../models/categories")
const cloudinary = require("cloudinary").v2
require("dotenv").config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.addProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, quantity } = req.body
    const artist = req.user.id

    let images = req.files?.images
    console.log(images)

    if (!images) {
      const error = new Error("Please upload atleast one image")
      error.statusCode = StatusCodes.BAD_REQUEST
      return next(error)
    }

    // If single image is uploaded, convert it to an array
    if (!Array.isArray(images)) {
      images = [images]
    }

    const uploadedImages = await Promise.all(
      images.map(
        (image) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                {
                  resource_type: "auto",
                  folder: "kalasangam",

                  // commented because it takes relatively more time to upload
                  // resource_type: "image",
                  // format: "png",
                },
                (error, result) => {
                  if (error) {
                    console.log(error)
                    reject(error) // Reject the promise in case of an error
                  } else {
                    // console.log(result)
                    resolve(result) // Resolve the promise with the result
                  }
                }
              )
              .end(image.data)
          })
      )
    )

    // Check if category exists
    const categoryExists = await Category.findOne({
      name: category || "Uncategorized",
    })

    // If category does not exist, create a new category
    let createdCategory
    if (!categoryExists) {
      createdCategory = await Category.create({
        name: category || "Uncategorized",
      })
    }

    // Create the product
    await Product.create({
      name,
      price,
      description,
      category: createdCategory?._id || categoryExists._id,
      artist,
      images: uploadedImages,
      quantity,
    })

    return res.status(StatusCodes.CREATED).json({
      message: "Product Uploaded",
    })
    // return res.status(StatusCodes.CREATED).json("test")
  } catch (error) {
    next(error)
  }
}

//update product endpoint being added --> need product object id in params
exports.updateProduct = async (req, res) => {
  try {
    //fetch existing product from product collection from db
    let productData = await Product.findById(req.params.id)

    //if product not found even if id is sent --> to handle incorrect ids
    if (!productData)
      return res.status(404).json({ message: "Product Not Found!" })

    //check and modify fetched data accordingly
    productData.name = req.body.name ? req.body.name : productData.name
    productData.price = req.body.price ? req.body.price : productData.price
    productData.description = req.body.description
      ? req.body.description
      : productData.description
    // productData.images = (req.body.images) ?    req.body.images   :   productData.images;

    if (req.files.images) {
      productData.images.forEach(async (image) => {
        let params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.key,
        }
        const command = new DeleteObjectCommand(params)
        await s3Client.send(command)
      })

      await uploadImages(res, req.files.images)
    }

    //update the object based on obj id
    await Product.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: productData },
      { new: true }
    ).then(() => {
      return res.status(200).json({ message: "Product Updated!" })
    })
  } catch (error) {
    return res.status(500).json(error)
  }
}

//delete product endpoint being added --> need product object id in params
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (product.images) {
      try {
        product.images.forEach(async (image) => {
          // console.log(image.key);
          let params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.key,
          }
          const command = new DeleteObjectCommand(params)
          await s3Client.send(command)
        })
      } catch (error) {
        return res.status(500).json(error.message)
      }
    }
    await product.deleteOne()
    return res.status(200).json("Product deleted")
  } catch (error) {
    return res.status(500).json(error.message)
  }
}

//endpoint to get one product --> pass obj id in param
exports.getOneProduct = async (req, res) => {
  try {
    let productData = await Product.findById(req.params.id)

    //in case product not found
    if (!productData)
      return res.status(404).json({ message: "Product Not Found!" })

    //in case product is found
    return res.status(200).json({ message: "Product found!", productData })
  } catch (error) {
    return res.status(500).json(error)
  }
}

//endpoint to get all products from db
exports.getAllProducts = async (req, res, next) => {
  try {
    let productsData = await Product.find()

    //returning all products data
    return res
      .status(StatusCodes.OK)
      .json({ message: "Products found!", productsData })
  } catch (error) {
    next(error)
  }
}

exports.viewInventory = async (req, res) => {
  try {
    const id = req.params.id
    const products = Product.find({ artist: id })
    if (!products) {
      return res.status(400).json("No products found")
    }
    return res.status(200).json(products)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
