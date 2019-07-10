const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.get("/", async (req, res) => {
  const users = await User.find().select("-password");
  res.send(users);
});

router.get("/managers", async (req, res) => {
  const { query } = req.query;

  if (query === undefined) return res.send([]);

  const managers = await User.find({
    $or: [{ name: new RegExp(query, "i") }, { email: new RegExp(query, "i") }],
    roles: "manager"
  }).select({
    _id: 1,
    name: 1,
    email: 1
  });

  res.send(managers);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (id === undefined) return res.status(400).send("No user ID provided.");

  const user = await User.findOne({ _id: id }).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.balance = 10;
  user.isAdmin = true;
  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
