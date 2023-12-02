const { StatusCodes } = require("http-status-codes")
const bcrypt = require("bcryptjs")
const Users = require("../models/users")
const { issueToken } = require("../middlewares/auth")

exports.signup = async (req, res, next) => {
  try {
    const { name, mobile, password, role } = req.body

    // First check if the user exists
    const userExists = await Users.findOne({
      mobile,
    })

    // If user exists, and has password field, then user has already signed up with password
    if (userExists && userExists.password) {
      const error = new Error(
        "User already exists. Please login with password instead."
      )
      error.statusCode = StatusCodes.BAD_REQUEST
      return next(error)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await Users.create({
      name,
      mobile,
      password: hashedPassword,
      role,
    })

    const token = issueToken({
      id: user._id,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
    })

    return res.status(StatusCodes.CREATED).json({
      msg: "User created successfully",
      accessToken: token,
      role: user.role,
    })
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body

    // Need to check if user exists
    const user = await Users.findOne({ mobile })

    if (!user) {
      const error = new Error("User does not exist")
      error.statusCode = StatusCodes.NOT_FOUND
      return next(error)
    }

    // If user exists, but has not password field, then he has signed up with OTP
    if (!user.password) {
      const error = new Error(
        "You have signed up with OTP. Please login with OTP instead."
      )
      error.statusCode = StatusCodes.BAD_REQUEST
      return next(error)
    }

    // If user exits, then match password
    const hashedPassword = user.password
    const isMatch = await bcrypt.compare(password, hashedPassword)

    if (!isMatch) {
      const error = new Error("Invalid credentials")
      error.statusCode = StatusCodes.UNAUTHORIZED
      return next(error)
    }

    // If all ok, then send token
    const token = issueToken({
      id: user._id,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
    })

    return res.status(StatusCodes.OK).json({
      msg: "User logged in successfully",
      accessToken: token,
      role: user.role,
    })
  } catch (error) {
    next(error)
  }
}
