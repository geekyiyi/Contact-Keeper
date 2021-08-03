const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // for generate the psw
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator/check");

//Use User model
const User = require("../models/User");

// @route       POST api/users
// @desc        Register a user
// @access      Public
router.post(
  "/",
  [
    //express validate the body data
    check("name", "Please add name").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more character"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //req.body - the data sent to the route
    // only use this for route accept data and needs validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // return an array of errors in terms of json
    }

    const { name, email, password } = req.body;

    try {
      // check whether the email already existed in the db
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: "User already exists" });
      }
      //if not exist, then create a new User instance and save in the db
      user = new User({
        name,
        email,
        password,
      });

      // encrypt the password using bcrypt

      //generate a salt
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      //save into db
      await user.save();

      // generate a json web token

      // define payload with user id
      const payload = {
        user: {
          id: user.id,
        },
      };
      const secret = config.get("jwtSecret");

      //generate a json web token
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
