const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator/check");

//Use User model
const User = require("../models/User");
//Contact Model
const Contact = require("../models/Contact");

// @route       GET api/contacts
// @desc        Get all users contacts
// @access      Private

// add auth middleware - authorise the user before he want to access contacts
router.get("/", auth, async (req, res) => {
  try {
    // after use auth middleware, can access user through req.user
    //after find all contacts, sort them with date property in descending order
    // contacts will be an array
    const contacts = await Contact.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(contacts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route       POST api/contacts
// @desc        Add new contact
// @access      Private

// use multiple middleware in the second parameter
router.post(
  "/",
  [
    auth,
    [
      check("name", "Name is required").not().isEmpty(),
      check("email", "Please include a valid email").isEmail(),
    ],
  ],
  async (req, res) => {
    //Check errors and send as response
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, type } = req.body;

    try {
      const newContact = new Contact({
        name,
        email,
        phone,
        type,
        user: req.user.id,
      });

      // save to the db and return the contact
      const contact = await newContact.save();
      res.json(contact);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route       PUT api/contacts/:id
// @desc        Update contact
// @access      Private
router.put("/:id", auth, async (req, res) => {
  const { name, email, phone, type } = req.body;

  //Build contact object
  const contactFields = {};
  if (name) contactFields.name = name;
  if (email) contactFields.email = email;
  if (phone) contactFields.phone = phone;
  if (type) contactFields.type = type;

  try {
    // find the contact which is gonna be edit with the id params
    // each contact has an id
    let contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    //Make sure user owns the contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorised" });
    }

    //Update the contact in the db
    contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { $set: contactFields },
      { new: true } // if the contact does not exist, then create a new one
    );
    // send back the updated contact
    res.json(contact);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route       DELETE api/users/:id
// @desc        Delete contact
// @access      Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) return res.status(404).json({ msg: "Contact not found" });

    // Make sure the user owns the contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "Not authorised" });
    }

    await Contact.findByIdAndRemove(req.params.id);
    res.json({ msg: "Contact removed" });
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
