const Users = require("../models/users")
const { StatusCodes } = require("http-status-codes")

exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.user

    const user = await Users.findById(id).select(
      "name mobile avatar email address"
    )

    return res.status(StatusCodes.OK).json({
      success: true,
      user,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user
    const { name, email, mobile, address } = req.body
    // const { address } = req.body

    await Users.updateOne(
      { _id: id },
      { name, email, mobile, address },
      { runValidators: true },
      (err, doc) => {
        if (err) {
          console.log(err)
          err = new Error(err)
          err.statusCode = StatusCodes.BAD_REQUEST
          return next(err)
        }
      }
    )

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
