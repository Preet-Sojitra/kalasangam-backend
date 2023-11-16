const express = require("express")
const morgan = require("morgan")
const fileUpload = require("express-fileupload")
const mongoose = require("mongoose")
const productRouter = require("./routes/product")
const analyticsRouter = require("./routes/analytics")
const { sequelize } = require("./db/db")
const RBACRouter = require("./routes/RBAC")
require("dotenv").config()
cors = require("cors")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use(morgan("tiny"))
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
)

app.use("/api/v1/product", productRouter)
app.use("/api/v1", RBACRouter)
app.use("/api/v1", analyticsRouter)

// Test route
app.get("/", (req, res) => {
  res.send("Testing, 123")
})

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("DB connected")
    const Port = 3000 || process.env.PORT
    app.listen(Port, () => {
      console.log(`Server started on port ${process.env.PORT}`)
    })
    // sequelize.authenticate().then(() => {
    //     console.log("Connected to RDS");
    // })
  })
  .catch((err) => {
    console.log(err)
  })
