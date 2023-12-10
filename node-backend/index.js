const express = require("express")
const morgan = require("morgan")
const fileUpload = require("express-fileupload")
const mongoose = require("mongoose")
const productsRouter = require("./routes/products")
const productRouter = require("./routes/product")
const analyticsRouter = require("./routes/analytics")
const cartRouter = require("./routes/cart")
const orderRouter = require("./routes/order")
const paymentRouter = require("./routes/payment")
const { sequelize } = require("./db/db")
const RBACRouter = require("./routes/RBAC")
const authRouter = require("./routes/auth")
const profileRouter = require("./routes/profile")

const { authorize, ROLES } = require("./middlewares/auth")

const errorHandlerMiddleware = require("./middlewares/error-handler")

require("dotenv").config()
cors = require("cors")
const cookieParser = require("cookie-parser")

const corsOptions = {
  origin: true,
  credentials: true,
}

const app = express()

app.get("/payment/success", (req, res) => {
  console.log(req.body)
  res.send("Payment successful")
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(cookieParser())

app.use(morgan("tiny"))
app.use(fileUpload())
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "tmp/",
//   })
// )

app.use("/api/v2/auth", authRouter)

// Only artisan can access these routes
app.use("/api/v2/artisan/product", authorize(ROLES.ARTISAN), productRouter)
app.use("/api/v2/products", productsRouter)
// app.use("/api/v2/profile", authorize(ROLES.USER), profileRouter)
app.use("/api/v2/profile", authorize(ROLES.ALL), profileRouter)

app.use("/api/v1", RBACRouter)
app.use("/api/v1", analyticsRouter)
app.use("/api/v1", cartRouter)
app.use("/api/v1", orderRouter)
app.use("/api/v1", paymentRouter)

app.use(errorHandlerMiddleware)

// Test route
app.get("/", (req, res) => {
  res.send("Testing, 123")
})

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("DB connected")
    const Port = 3000 || process.env.PORT
    app.listen(Port, process.env.IP, () => {
      console.log(`Server is running on port ${Port}`)
    })
    // sequelize.authenticate().then(() => {
    //     console.log("Connected to RDS");
    // })
  })
  .catch((err) => {
    console.log(err)
  })
