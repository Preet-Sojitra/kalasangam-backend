const Users = require("../models/users")
exports.getProfile = async (req, res, next) => {
  try {
    const { id } = req.user

    const user = await Users.findById(id).select("name mobile avatar")

    return res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
