const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [2, "El nombre debe tener al menos 2 caracteres"],
      maxlength: [30, "El nombre no puede exceder 30 caracteres"],
      default: "Usuario",
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es requerido"],
      unique: [true, "Este email ya está registrado"],
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Email inválido",
      },
      index: true,
    },
    password: {
      type: String,
      required: [true, "La contraseña es requerida"],
      minlength: [8, "La contraseña debe tener al menos 8 caracteres"],
      select: false,
    },
  },

  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        const result = ret;
        delete result.password;
        return result;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        const result = ret;
        delete result.password;
        return result;
      },
    },
  },
);

userSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
