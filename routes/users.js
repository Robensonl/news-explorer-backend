const express = require("express");

const router = express.Router();
const {
  getUsers,
  getUserById,
  getCurrentUser,
} = require("../controllers/users");
const validationSchemas = require("../middlewares/validation");

router.get("/", getUsers);
router.get("/me", getCurrentUser);
router.get("/:userId", validationSchemas.userId, getUserById);

module.exports = router;
