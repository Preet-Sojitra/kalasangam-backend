const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  artisan: {
    type: mongoose.Types.ObjectId,
    ref: "Artisan",
  },
  status: {
    type: String,
    enum: ["PLACED", "IN TRANSIT", "DELIVERED"],
    default: "PLACED",
  },
  purchasedQuantity: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD",
  },
  paymentId: String,
  paymentMethod: String,
})

module.exports = mongoose.model("Order", orderSchema)
