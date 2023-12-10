const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be less than 0"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    images: [
      {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Please upload atleast one image"],
      },
    ],
    model: String, // 3D model url
    artist: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: mongoose.Types.ObjectId,
    },
    quantity: {
      type: Number,
      required: [true, "Please enter product quantity"],
      min: [0, "Quantity cannot be less than 0"],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Product", productSchema)
