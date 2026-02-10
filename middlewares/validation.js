const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const mongoose = require("mongoose");

const validateEmail = (value, helpers) => {
  if (validator.isEmail(value)) {
    return value;
  }
  return helpers.error("string.email");
};


const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("string.invalid_objectid");
  }
  return value;
};


const validationSchemas = {

  signup: celebrate({
    body: Joi.object().keys({
      email: Joi.string()
        .required()
        .custom(validateEmail, "Validación de email")
        .messages({
          "string.empty": "El email es requerido",
          "any.required": "El email es requerido",
        }),
      password: Joi.string()
        .required()
        .min(8)
        .max(30)
        .messages({
          "string.empty": "La contraseña es requerida",
          "string.min": "La contraseña debe tener al menos 8 caracteres",
          "string.max": "La contraseña no puede exceder 30 caracteres",
          "any.required": "La contraseña es requerida",
        }),
      name: Joi.string()
        .optional()
        .min(2)
        .max(30)
        .messages({
          "string.min": "El nombre debe tener al menos 2 caracteres",
          "string.max": "El nombre no puede exceder 30 caracteres",
        }),
    }).required(),
  }),


  signin: celebrate({
    body: Joi.object().keys({
      email: Joi.string()
        .required()
        .custom(validateEmail, "Validación de email")
        .messages({
          "string.empty": "El email es requerido",
          "any.required": "El email es requerido",
        }),
      password: Joi.string()
        .required()
        .messages({
          "string.empty": "La contraseña es requerida",
          "any.required": "La contraseña es requerida",
        }),
    }).required(),
  }),

  userId: celebrate({
    params: Joi.object().keys({
      userId: Joi.string().required().custom(validateObjectId, "Validación de ObjectId"),
    }),
  }),

};

module.exports = validationSchemas;
