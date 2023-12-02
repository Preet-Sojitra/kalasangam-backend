const express = require("express")

const { sendOTP } = require("../controllers/twilio-sms")

const router = express.Router()

router.post("/send-otp", sendOTP)
