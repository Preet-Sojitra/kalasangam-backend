const express = require("express")
const {
  getOneProduct,
  getAllProducts,
  getProductCategories,
  getProductsByCategory,
} = require("../controllers/product")
const { search } = require("../utils/customer")

const router = express.Router()

router.get("/one", getOneProduct)
router.get("/all", getAllProducts)
router.get("/search", search)
router.get("/categories/all", getProductCategories)
router.get("/category/", getProductsByCategory)

module.exports = router
