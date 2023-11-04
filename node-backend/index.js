const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const productRouter = require('./routes/product')
const analyticsRouter = require('./routes/analytics')
const {sequelize} = require('./db/db')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(morgan('tiny'))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))

app.use("/api/v1/product",productRouter)
app.use("/api/v1",analyticsRouter)


mongoose.connect(process.env.URI)
    .then(() => {
        console.log("DB connected");
        
        app.listen(process.env.PORT,"192.168.179.61", () => {
            console.log(`Server started on port ${process.env.PORT}`);
        })
        sequelize.authenticate().then(() => {
            console.log("Connected to RDS");
        })
        .catch(err => {
            console.log(err);
        })
    })
