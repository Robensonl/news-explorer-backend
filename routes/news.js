const router = require('express').Router();
const fetch = require('node-fetch');
const { celebrate, Joi } = require('celebrate');

const getLastWeekDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
};

router.get('/', celebrate({
  query: Joi.object().keys({
    q: Joi.string().required().trim().max(100),
  }),
}), async (req, res) => {
  try {
    const { q } = req.query;
    const fromDate = getLastWeekDate();
    const API_KEY = process.env.VITE_NEWS_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        status: 'error',
        message: 'API key no configurada',
      });
    }

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&from=${fromDate}&sortBy=publishedAt&language=es&apiKey=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        status: 'error',
        message: data.message || `Error HTTP: ${response.status}`,
      });
    }

    if (data.status === 'error') {
      return res.status(400).json({
        status: 'error',
        message: data.message || 'Error al buscar noticias',
      });
    }

    res.json({
      status: 'ok',
      articles: data.articles || [],
      totalResults: data.totalResults || 0,
    });
  } catch (error) {
    console.error('Error al buscar noticias:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
    });
  }
});

module.exports = router;
