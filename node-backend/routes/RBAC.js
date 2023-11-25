const Router = require('express').Router()

const {artisianLogin, artisianRegister, userLogin, userRegister} = require('../controllers/RBAC')

Router.post("/artisian/login", artisianLogin)
Router.post("/artisian/register", artisianRegister)
Router.post("/user/login", userLogin)
Router.post("/user/register", userRegister)

module.exports = Router