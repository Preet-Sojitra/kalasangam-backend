const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: String,
    mobile: String,
    password: String,
  },
  { timestamps: true }
)

module.exports = mongoose.model("User", userSchema)
