const { StatusCodes } = require("http-status-codes")
const { getTokensFromCode, getGoogleAuthUrl } = require("../utils/google-auth")
const User = require("../models/users")
const { issueToken } = require("../middlewares/auth")

require("dotenv").config()
const axios = require("axios")

// const SERVER_ROOT_URI = "http://localhost:5173/auth/login"
// const redirectURI = ""
const SERVER_ROOT_URI = process.env.SERVER_ROOT_URI
const redirectURI = "auth/google/login/callback"

exports.googleLoginUrl = async (req, res, next) => {
  const { who } = req.query
  try {
    const googleAuthUrl = getGoogleAuthUrl(
      SERVER_ROOT_URI,
      redirectURI,
      process.env.GOOGLE_CLIENT_ID,
      who
    )
    // return res.redirect(googleAuthUrl)
    return res.status(StatusCodes.OK).json({
      googleAuthUrl,
    })
  } catch (error) {
    next(error)
  }
}

exports.googleLoginCallback = async (req, res, next) => {
  // Get authorization code from query string
  //   console.log(req.query)

  // const { code, who } = req.body
  const { code } = req.query
  let { state } = req.query

  const { id_token, access_token } = await getTokensFromCode({
    code,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${SERVER_ROOT_URI}/${redirectURI}`,
    // redirectUri: `http://localhost:5173/auth/login`,
  })

  // Fetch user info
  const googleUser = await axios
    .get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.log(error)
      next(error)
    })

  state = JSON.parse(state)
  console.log(state)

  // Let's first check if the user already exists in the database
  const user = await User.findOne({ googleId: googleUser.id })

  // If user exists, then we will return the user with a access token
  //   console.log(user)
  if (user) {
    const token = issueToken({
      id: user._id,
      role: user.role,
      name: user.name,
      googleId: user.googleId,
    })

    return res.status(StatusCodes.OK).json({
      msg: "User logged in successfully",
      accessToken: token,
    })
  }
  // Else, we will create a new user and then return the user with a access token
  else {
    try {
      const newUser = await User.create({
        name: googleUser.name,
        googleId: googleUser.id,
        email: googleUser.email,
        role: state.who === "artisan" ? "artisan" : "customer",
        // role: who === "artisan" ? "artisan" : "customer",
      })

      const token = issueToken({
        id: newUser._id,
        role: newUser.role,
        name: newUser.name,
        googleId: newUser.googleId,
      })

      // Only way to send data to the frontend is by using cookies
      res.cookie("accessToken", token)
      res.cookie("role", newUser.role)

      return res.redirect("http://localhost:5173/home")

      // return res.status(StatusCodes.CREATED).json({
      //   msg: "User created successfully",
      //   accessToken: token,
      //   role: newUser.role,
      // })
    } catch (error) {
      console.log(error)
      next(error)
    }
  }

  //   return res.status(StatusCodes.OK).json({
  //     msg: "User logged in successfully",
  //     googleUser,
  //   })
}
