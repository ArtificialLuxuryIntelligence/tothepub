
const mongoose = require('mongoose');
const fs = require('fs');
const PointLocation = require('../models/pointLocation');
const TagCategory = require('../models/tagCategory');

console.log(require('dotenv').config({ path: `${__dirname}/../.env` }));

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // insert all locations
    const locationJSON = await readFile('./../../data/pointLocation.json');
    const locations = JSON.parse(locationJSON);

    PointLocation.insertMany(locations, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        console.info(
          `documents successfully inserted into database: ${docs.length}`
        );
      }
    });

    // insert all tags
    const tagCatsJSON = await readFile('./../../data/tagCategory.json');
    const tagCategories = JSON.parse(tagCatsJSON);

    TagCategory.insertMany(tagCategories, (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        console.info(`${doc} entered into database`);
      }
    });

  } catch (err) {
    console.log(err);
  }
}
async function readFile(filePath) {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.log(err);
  }
}

run();
