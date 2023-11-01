const express = require('express')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(morgan('tiny'))
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))

mongoose.connect(process.env.URI)
    .then(() => {
        console.log("DB connected");
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        })
    })