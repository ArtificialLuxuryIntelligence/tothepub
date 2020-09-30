// NOT USED IN PRODUCTION - only used to populate local database

const mongoose = require('mongoose');
const fs = require('fs');
const PointLocation = require('../models/pointLocation');
// const Tags = require('../models/tags');
const TagCategory = require('../models/tagCategory');

require('dotenv').config();

// const TAGS = ['Wetherspoons', "Samuel Smith's"]; // TODO :autodetect --->

//  see drawMap.js hardcoded allTags and allLocationInfo
//  change Tags model to take format of allTags

// in async function below pull in sanitize data and extract accepted tag data

// this is async no?
mongoose.connect('mongodb://localhost/tothepub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  const locationJSON = await readFile('./../../data/pointLocations.json');
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

  const tagCatsJSON = await readFile('./../../data/tagCategories.json');
  const tagCategories = JSON.parse(tagCatsJSON);

  // Tags.create({ tags: TAGS }, (err, doc) => {
  TagCategory.insertMany(tagCategories, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      console.info(`${doc} entered into database`);
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
