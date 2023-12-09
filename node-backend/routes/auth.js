const express = require("express")
const router = express.Router()
const { signup, login } = require("../controllers/auth")
const { sendOTP, verifyOTP } = require("../controllers/twilio-sms")
const {
  googleLoginUrl,
  googleLoginCallback,
} = require("../controllers/google-auth")

router.post("/signup", signup)
router.post("/login", login)
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

// This is the route that the frontend will use to get the Google Auth URL
router.get("/google/login/url", googleLoginUrl)

// This is the route that Google will redirect to after login. Callback because Google will call this route back.
router.get("/google/login/callback", googleLoginCallback)

module.exports = router
