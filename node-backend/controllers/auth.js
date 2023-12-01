const { StatusCodes } = require("http-status-codes")
const Users = require("../models/users")

exports.signup = async (req, res, next) => {
  try {
    const { name, mobile, password, role } = req.body
    const user = await Users.create({
      name,
      mobile,
      password,
      role,
    })
    return res.status(StatusCodes.CREATED).json(user)
  } catch (error) {
    next(error)
  }
}
