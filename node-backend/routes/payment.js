const express = require("express")
const { checkout, cod } = require("../controllers/payment")

const router = express.Router()

router.post("/online", checkout)
router.post("/cod", cod)

module.exports = router
