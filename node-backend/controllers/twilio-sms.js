const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID } =
  process.env

const { StatusCodes } = require("http-status-codes")
const Users = require("../models/users")
const { issueToken } = require("../middlewares/auth")

const client = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true,
})

exports.sendOTP = async (req, res, next) => {
  const { countryCode, mobile } = req.body

  try {
    // First check if the user exists
    const user = await Users.findOne({
      mobile,
    })

    if (user) {
      const error = new Error("User already exists. Please login instead.")
      error.statusCode = StatusCodes.BAD_REQUEST
      return next(error)
    }

    const otpResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verifications.create({
        to: `+${countryCode}${mobile}`,
        channel: "sms",
      })

    return res.status(StatusCodes.OK).json({
      msg: "OTP sent successfully",
    })
  } catch (error) {
    console.log(error)
    return next(error)
  }
}

exports.verifyOTP = async (req, res, next) => {
  try {
    const { countryCode, mobile, otp, name, role } = req.body

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

    const verifiedResponse = await client.verify.v2
      .services(TWILIO_SERVICE_SID)
      .verificationChecks.create({
        to: `+${countryCode}${mobile}`,
        code: otp,
      })

    if (verifiedResponse.status !== "approved") {
      const error = new Error("Invalid OTP. Please try again.")
      error.statusCode = StatusCodes.BAD_REQUEST
      return next(error)
    }

    // If OTP is verified, create a new user

    // If user not exists, create a new user
    let user
    if (!userExists) {
      user = await Users.create({
        name,
        mobile,
        role,
      })
    }

    const token = issueToken({
      id: user._id,
      role: user.role,
      name: user.name,
      mobile: user.mobile,
    })

    return res.status(StatusCodes.OK).json({
      msg: "OTP verified successfully",
      accessToken: token,
      role: user.role,
    })
  } catch (error) {
    console.log(error)
    return next(error)
  }
}
