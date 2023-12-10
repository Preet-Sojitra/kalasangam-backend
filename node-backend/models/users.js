const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    mobile: {
      type: String,
      // required: true,
      unique: true,
      maxlength: 10,
      minlength: 10,
      sparse: true,
    },
    password: {
      type: String,
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
    avatar: String,

    // This will be used to uniquely identify the user in the database, as when user signs up with Google, we will not have their mobile number
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
  },
  { timestamps: true }
)

// userSchema.index({ mobile: 1, email: 1 }, { unique: true })

userSchema.pre("save", function (next) {
  if (this.role === "artisan") {
    // If user is artisan, then add the key "isVerified" to the userSchema
    this.isVerified = false
  }
  next()
})

// update the version number if the document is updated
userSchema.pre("updateOne", function (next) {
  this.updateOne({}, { $inc: { __v: 1 } })
  next()
})

module.exports = mongoose.model("Users", userSchema)
