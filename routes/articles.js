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
      keyword: Joi.string().required().trim(),
      title: Joi.string().required().trim(),
      text: Joi.string().required().trim(),
      date: Joi.string().required(),
      source: Joi.string().required().trim(),
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
