const Users = require("../models/users")

exports.signup = async (req, res) => {
  try {
    const { name, mobile, password, role } = req.body
    const user = await Users.create({
      name,
      mobile,
      password,
      role,
    })
    return res.status(201).json(user)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}
