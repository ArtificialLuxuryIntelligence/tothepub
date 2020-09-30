const { Router, response } = require('express');

const multer = require('multer');

const upload = multer();

const PointLocation = require('../../models/pointLocation');
const pointLocationEdit = require('../../models/pointLocationEdit');
const PointLocationEdit = require('../../models/pointLocationEdit');
const TagCategory = require('../../models/tagCategory');

const router = Router();
//  set high to ensure some results - the point of the query is to sort by distance
const SEARCH_RADIUS = 4000;
const MAX_RESULTS = 25;

router.get('/', async (req, res, next) => {
  const { long, lat, tag } = req.query;

  try {
    let doc;
    if (tag) {
      doc = await PointLocation.find({
        geometry: {
          $near: {
            $maxDistance: SEARCH_RADIUS,
            $geometry: {
              type: 'Point',
              coordinates: [long, lat],
            },
          },
        },
        'properties.tags': tag,
      }).limit(MAX_RESULTS);
    } else {
      doc = await PointLocation.find({
        geometry: {
          $near: {
            $maxDistance: SEARCH_RADIUS,
            $geometry: {
              type: 'Point',
              coordinates: [long, lat],
            },
          },
        },
      }).limit(MAX_RESULTS);
    }
    // console.log(doc);
    // console.log(doc);
    res.json({ doc });

    // console.log(doc);
  } catch (err) {
    next(err);
    console.error(err);
  }

  // console.log(long, lat);
  // const r = await PointLocation.find();
});

router.post('/', async (req, res, next) => {
  try {
    const pointLocation = new PointLocation(req.body);
    const newLocation = await pointLocation.save();
    res.json(newLocation);
    // console.log(req.body);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(422);
    }
    next(error);
  }
});

router.post('/edit', upload.array(), async (req, res, next) => {
  //  this is probably overly complicated. it would be easier to create template json clientside
  //  and fill it in using the form data before sending it here
  //  note: we do need to know the category so an array of tags won't work

  const {
    id,
    comments,
    name,
    phone,
    website,
    'opening-hours': openingHours,
  } = req.body;

  try {
    // ----------get original document that request is proposing to an update to
    const original = await PointLocation.findOne({
      _id: id,
    }).exec();

    // ------------ create a proposal update object (clone original and update)

    const updatedDoc = JSON.parse(JSON.stringify(original)); // copy original
    // add all of form content in correct structure

    delete updatedDoc._id;
    updatedDoc.refId = id;

    updatedDoc.properties.name = name;
    updatedDoc.properties.phone = phone;
    updatedDoc.properties.website = website;
    updatedDoc.properties['opening-hours'] = openingHours;
    updatedDoc.properties.comments = comments;
    updatedDoc.edited = true; // setting up for when the change is accepted
    //  and merged back into pointLocation collection
    console.log(updatedDoc);

    delete req.body.id;
    delete req.body.name;
    delete req.body.phone;
    delete req.body.website;
    delete req.body['opening-hours'];
    delete req.body.comments;

    // now left with just tags:
    const updatedTags = [];
    const updatedDropdowns = [];
    Object.keys(req.body).forEach((key) => {
      // add booleans
      if (req.body[key] === 'false') {
      } else if (req.body[key] === 'true') {
        updatedTags.push(key);
      }
      // add string keys (from dropdowns)
      else if (req.body[key] !== '') {
        updatedTags.push(req.body[key]);
        updatedDropdowns.push({ [key]: req.body[key] });
      }
    });
    updatedDoc.properties.tags = updatedTags;
    // res.json(updatedDropdowns);

    // ----------------------- save proposal to pointLocationEdit collection for review
    const edit = await pointLocationEdit.create(updatedDoc);
    res.status(200).json({ edit });
  } catch (err) {
    console.error(err);
    res.status(504); // service unavailable..? deal with it clientside
    next(err);
  }
});

router.get('/tags', async (req, res, next) => {
  try {
    const doc = await TagCategory.find();
    res.json({ doc });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.post('/tags', async (req, res, next) => {
  try {
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
