const express = require("express");

const router = express.Router();
const {
  getUsers,
  getUserById,
  getCurrentUser,
} = require("../controllers/users");
const validationSchemas = require("../middlewares/validation");
const auth = require("../middlewares/auth");

router.get("/", auth, getUsers);
router.get("/me", getCurrentUser);
router.get("/:userId", auth, validationSchemas.userId, getUserById);

module.exports = router;
