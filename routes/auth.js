const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // for compare the psw
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator/check");

//Use User model
const User = require("../models/User");

// @route       GET api/auth
// @desc        Get Logged in user
// @access      Private
// put the auth middleware as the second parameter
router.get("/", auth, async (req, res) => {
  try {
    // after apply the auth middleware, it will assign the user object in the payload to req.user
    // so we can access it in the request route
    // but excludes the password
    const user = await User.findById(req.user.id).select("-password");

    // send the user
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route       POST api/auth
// @desc        Auth user & get token
// @access      Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    //error checking
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Auth a user
    const { email, password } = req.body;

    try {
      // find the user in the db with email
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // use bcrypt compare to compare the password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      //Json Web Token
      //Generate a jwt when log in
      const payload = {
        user: {
          id: user.id,
        },
      };

      const secret = config.get("jwtSecret");
      jwt.sign(
        payload,
        secret,
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
