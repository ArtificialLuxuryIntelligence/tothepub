const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const locationsRouter = require('./API/locations');
const adminRouter = require('./API/admin');

mongoose.set('useCreateIndex', true); // stops 'DeprecationWarning: collection.ensureIndex is deprecated.' error (from definining indexes in schema)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(morgan('common'));
app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API - please see docs for more information',
  }); // TODO docs
});

app.use('/api/location', locationsRouter);
app.use('/api/admin', adminRouter);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`listening on http://localhost:${port}`);
});
