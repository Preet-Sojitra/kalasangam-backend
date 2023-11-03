const express = require('express')
const {addProduct,updateProduct,getOneProduct,getAllProducts,deleteProduct} = require('../controllers/product')

const router = express.Router()

router.post("/product/add", addProduct)
router.put("/product/update/:id", updateProduct)
router.delete("/product/delete/:id", deleteProduct)
router.get("/product/one/:id", getOneProduct)
router.get("/product/all", getAllProducts)

module.exports = router