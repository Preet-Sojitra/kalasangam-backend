const jwt = require("jsonwebtoken")
const { StatusCodes } = require("http-status-codes")

const JWT_SECRET = process.env.JWT_SECRET
const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME

const issueToken = (user) => {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRE_TIME })

  return token
}

const authorize = (role) => {
  if (!Array.isArray(role)) {
    role = [role]
  }

  return (req, res, next) => {
    function sendError(msg) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg })
    }

    try {
      // Get token from header
      const token = req.headers["Authorization"] || req.headers["authorization"]

      if (!token) {
        return sendError("No token, authorization denied")
      }

      // Check token format
      if (!token.startsWith("Bearer ")) {
        return sendError("Invalid token format")
      }

      // Verify token
      const tokenValue = token.split(" ")[1]

      jwt.verify(tokenValue, JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return sendError("Token invalid or expired")
        }

        // If role is missing, then send error
        if (!decodedToken.role) {
          return sendError("Token invalid or expired")
        }

        // Check if user has required role
        const userRole = decodedToken.role
        if (!role.includes(userRole)) {
          return sendError("You are not authorized")
        }

        // If everything is ok, then attach user to req object
        // console.log(decodedToken)
        req.user = decodedToken

        next()
      })
    } catch (error) {
      next(error)
    }
  }
}

const ROLES = {
  USER: ["customer"],
  ARTISAN: ["artisan"],
  ADMIN: ["admin"],
  ALL: ["customer", "artisan", "admin"],
}

module.exports = { issueToken, authorize, ROLES }
