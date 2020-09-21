// NOT USED IN PRODUCTION - only used to populate local database

const mongoose = require('mongoose');
const fs = require('fs');
const PointLocations = require('../models/pointLocation');
require('dotenv').config();

mongoose.connect('mongodb://localhost/tothepub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  const json = await readFile('./../../data/pointLocations.js');
  const locations = JSON.parse(json);
  PointLocations.insertMany(locations, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.info(
        `documents successfully inserted into database: ${docs.length}`
      );
    }
  });
})();

async function readFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.log(err);
  }
}
