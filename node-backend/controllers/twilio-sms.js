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
    const user = await Users.create({
      name,
      mobile,
      role,
    })

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
