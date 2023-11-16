const Router = require('express').Router()

const {artisanLogin, artisanRegister, userLogin, userRegister} = require('../controllers/RBAC')

Router.post("/artisan/login", artisanLogin)
Router.post("/artisan/register", artisanRegister)
Router.post("/user/login", userLogin)
Router.post("/user/register", userRegister)

module.exports = Router