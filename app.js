const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { isCelebrateError } = require("celebrate");
require("dotenv").config();

const auth = require("./middlewares/auth");
const { requestLogger, errorLogger } = require("./middlewares/logger");
const { createUser, login } = require("./controllers/users");
const usersRouter = require("./routes/users");
const articlesRouter = require("./routes/articles");

const app = express();
const NODE_ENV = process.env.NODE_ENV || "development";
const { PORT = 3000, MONGODB_URI } = process.env;

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5176",
  "http://localhost:5173",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10kb" }));

app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Demasiados intentos de autenticación. Intenta más tarde.",
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Demasiados intentos de autenticación. Intenta más tarde.",
    });
  },
});

if (NODE_ENV === "development") {
  app.get("/crash-test", () => {
    setTimeout(() => {
      throw new Error("Servidor caído intencionalmente para pruebas");
    }, 0);
  });
}

app.post("/signup", authLimiter, createUser);
app.post("/signin", authLimiter, login);

app.use(auth);
app.use("/users", usersRouter);
app.use("/articles", articlesRouter);

app.get("/", (req, res) => {
  res.json({
    message: "News Explorer API",
    version: "1.0.0",
    endpoints: {
      public: ["POST /signup", "POST /signin"],
      protected: ["GET /users/me", "PATCH /users/me", "GET /articles", "POST /articles", "DELETE /articles/:id"],
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `No se encontró la ruta: ${req.method} ${req.url}`,
  });
});

// Logger de errores
app.use(errorLogger);

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    console.error("Celebrate Validation Error:", err.message);
    const details = err.details.get(err.details.keys().next().value);
    const message = details?.message || "Validation failed";

    return res.status(400).json({
      error: true,
      message,
    });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? "An error has occurred on the server"
    : err.message;

  res.status(statusCode).json({
    error: true,
    message,
    ...(NODE_ENV === "development" && { stack: err.stack }),
  });
});

if (NODE_ENV !== "test") {
  mongoose.connect(MONGODB_URI || "mongodb://localhost:27017/news-explorer-db")
    .then(() => {
      console.log("✅ MongoDB conectado");
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Servidor en http://0.0.0.0:${PORT}`);
        console.log(`📁 Entorno: ${NODE_ENV || "development"}`);
      });
    })
    .catch((err) => {
      console.error("❌ Error MongoDB:", err.message);
      process.exit(1);
    });
}
module.exports = app;
