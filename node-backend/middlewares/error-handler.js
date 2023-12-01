const { StatusCodes } = require("http-status-codes")

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong, try again later",
  }
  console.log(err)

  // Handle mongodb duplicate key error
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )}, please choose another value`
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  // Handle mongoose validation error
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ")
    customError.statusCode = StatusCodes.BAD_REQUEST
  }

  return res.status(customError.statusCode).json({
    msg: customError.msg,
  })
}

module.exports = errorHandlerMiddleware
