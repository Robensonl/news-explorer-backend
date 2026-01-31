const router = require("express").Router();
const validator = require("validator");
const { celebrate, Joi } = require("celebrate");
const { getArticles, createArticle, deleteArticle } = require("../controllers/articles");

const validateURL = (value, helpers) => {
  if (validator.isURL(value, { protocols: ["http", "https"], require_protocol: true })) {
    return value;
  }
  return helpers.error("string.uri");
};

router.get("/", getArticles);
router.post(
  "/",
  celebrate({
    body: Joi.object().keys({
      keyword: Joi.string().required().trim().max(50),
      title: Joi.string().required().trim().max(200),
      text: Joi.string().required().trim().max(5000),
      date: Joi.string().required().max(50),
      source: Joi.string().required().trim().max(100),
      link: Joi.string().required().custom(validateURL, "Validación de URL"),
      image: Joi.string().required().custom(validateURL, "Validación de URL"),
    }),
  }),
  createArticle,
);

router.delete(
  "/:articleId",
  celebrate({
    params: Joi.object().keys({
      articleId: Joi.string().hex().length(24).required(),
    }),
  }),
  deleteArticle,
);

module.exports = router;
