const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
const productRouter = require('./routes/product')
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


mongoose.connect(process.env.URI)
    .then(() => {
        console.log("DB connected");
        
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        })
        sequelize.authenticate().then(() => {
            console.log("Connected to RDS");
        })
        .catch(err => {
            console.log(err);
        })
    })
