const express = require("express");

const {
  loginUser,
  signupUser,
  infoUser
} = require("../controllers/userController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/signup", signupUser);
router.get("/info", infoUser);

module.exports = router;
