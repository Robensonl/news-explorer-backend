const mongoose = require("mongoose");
const validator = require("validator");

const articleSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, "La palabra clave es obligatoria"],
    trim: true,
  },
  title: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true,
  },
  text: {
    type: String,
    required: [true, "El texto es obligatorio"],
    maxlength: [5000, "El texto no puede exceder 5000 caracteres"],
  },
  date: {
    type: String,
    required: [true, "La fecha es obligatoria"],
  },
  source: {
    type: String,
    required: [true, "La fuente es obligatoria"],
    trim: true,
  },
  link: {
    type: String,
    required: [true, "El enlace es obligatorio"],
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
      message: "URL de enlace inválida",
    },
  },
  image: {
    type: String,
    required: [true, "La imagen es obligatoria"],
    validate: {
      validator: (value) => validator.isURL(value, { protocols: ["http", "https"], require_protocol: true }),
      message: "URL de imagen inválida",
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Article", articleSchema);
