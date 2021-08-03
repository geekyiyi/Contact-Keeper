// Middleware function to authenticate use with Json web token
// Use for protect routes

// check if there is a token in the header and verify it
const jwt = require("jsonwebtoken");
const config = require("config");

// next is to move on to the next middleware
module.exports = function (req, res, next) {
  //Get token from header
  // x-auth-token is where the token is from in the header
  const token = req.header("x-auth-token");

  // check if not token
  //401: not authorised
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  //If token exists
  try {
    // verify the token with secret
    // return the payload object
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    //user is the object saved inside payload
    //assign user in the req object which we can access the user info inside the route
    req.user = decoded.user;
    // go to the next middleware
    next();
  } catch (error) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
