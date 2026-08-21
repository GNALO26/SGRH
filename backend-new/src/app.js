const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('combined'));

app.use('/api', routes);

app.use((req, res) => res.status(404).json({ message: 'Route non trouvée.' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erreur interne du serveur.' });
});

module.exports = app;