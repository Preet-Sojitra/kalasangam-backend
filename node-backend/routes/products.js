const express = require("express")
const { getOneProduct, getAllProducts } = require("../controllers/product")
const { search } = require("../utils/customer")

const router = express.Router()

router.get("/one/:id", getOneProduct)
router.get("/all", getAllProducts)
router.get("/search", search)

module.exports = router
