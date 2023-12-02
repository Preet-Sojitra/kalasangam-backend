const express = require("express")
const router = express.Router()
const { signup, login } = require("../controllers/auth")
const { sendOTP, verifyOTP } = require("../controllers/twilio-sms")

router.post("/signup", signup)
router.post("/login", login)
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

module.exports = router
