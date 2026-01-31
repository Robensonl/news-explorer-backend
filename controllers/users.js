const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("El email ya está registrado");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      const err = new Error("Credenciales incorrectas");
      err.statusCode = 401;
      throw err;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      const err = new Error("Credenciales incorrectas");
      err.statusCode = 401;
      throw err;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("❌ JWT_SECRET no está definido en .env");
      const err = new Error("Configuración del servidor incompleta");
      err.statusCode = 500;
      throw err;
    }

    const token = jwt.sign(
      { _id: user._id },
      jwtSecret,
      { expiresIn: "120d" },
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, ...userResponse });
  } catch (err) {
    next(err);
  }
};

module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    next(err);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};
