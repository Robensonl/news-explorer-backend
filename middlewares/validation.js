const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const mongoose = require("mongoose");

// Validación personalizada para URLs
const validateURL = (value, helpers) => {
  if (validator.isURL(value, { protocols: ["http", "https"], require_protocol: true })) {
    return value;
  }
  return helpers.error("string.uri");
};

// Validación personalizada para emails
const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error("string.email");
};

// Validación personalizada para ObjectId
const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("string.invalid_objectid");
  }
  return value;
};

// 🧾 ESQUEMAS DE VALIDACIÓN
const validationSchemas = {
  // Registro de usuario
  signup: celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail, "Validación de email"),
      password: Joi.string().required().min(8).max(30),
      name: Joi.string().min(2).max(30),
    }),
  }),

  // Login
  signin: celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().custom(validateEmail, "Validación de email"),
      password: Joi.string().required(),
    }),
  }),

  userId: celebrate({
    params: Joi.object().keys({
      userId: Joi.string().required().custom(validateObjectId, "Validación de ObjectId"),
    }),
  }),

};

module.exports = validationSchemas;
