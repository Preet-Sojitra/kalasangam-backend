const express = require('express')
const {addProduct,updateProduct,getOneProduct,getAllProducts,deleteProduct} = require('../controllers/product')
const { search } = require('../utils/customer')

const router = express.Router()

router.post("/add", addProduct)
router.put("/update/:id", updateProduct)
router.delete("/delete/:id", deleteProduct)
router.get("/one/:id", getOneProduct)
router.get("/all", getAllProducts)
router.get("/search", search)

module.exports = router