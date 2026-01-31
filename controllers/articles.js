const Article = require("../models/article");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

// GET /articles - Obtener todos los artículos del usuario actual
const getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

// POST /articles - Crear un nuevo artículo
const createArticle = async (req, res, next) => {
  try {
    const {
      keyword, title, text, date, source, link, image,
    } = req.body;

    const article = await Article.create({
      keyword,
      title,
      text,
      date,
      source,
      link,
      image,
      owner: req.user._id,
    });

    res.status(201).json(article);
  } catch (err) {
    if (err.name === "ValidationError") {
      next(new BadRequestError("Datos de artículo inválidos"));
    } else {
      next(err);
    }
  }
};

// DELETE /articles/:articleId - Eliminar un artículo
const deleteArticle = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const article = await Article.findById(articleId);

    if (!article) {
      throw new NotFoundError("Artículo no encontrado");
    }

    // Verificar que el usuario sea el dueño
    if (article.owner.toString() !== req.user._id) {
      throw new ForbiddenError("No tienes permisos para eliminar este artículo");
    }

    await Article.findByIdAndDelete(articleId);
    res.json({ message: "Artículo eliminado correctamente" });
  } catch (err) {
    if (err.name === "CastError") {
      next(new BadRequestError("ID de artículo inválido"));
    } else {
      next(err);
    }
  }
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticle,
};
