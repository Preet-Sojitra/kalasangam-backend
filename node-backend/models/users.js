const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      unique: true,
      maxlength: 10,
      minlength: 10,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["artisan", "customer", "admin"],
      default: "customer",
      required: true,
    },
    isVerified: {
      type: Boolean,
    },
  },
  { timestamps: true }
)

userSchema.pre("save", function (next) {
  if (this.role === "artisan") {
    // If user is artisan, then add the key "isVerified" to the userSchema
    this.isVerified = false
  }
  next()
})

module.exports = mongoose.model("Users", userSchema)
