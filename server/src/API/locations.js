const { Router, response } = require('express');

const multer = require('multer');

const upload = multer();

const PointLocation = require('../../models/pointLocation');
const pointLocationEdit = require('../../models/pointLocationEdit');
const PointLocationEdit = require('../../models/pointLocationEdit');

const TagCategory = require('../../models/tagCategory');

const router = Router();
const SEARCH_RADIUS = 1500;
const MAX_RESULTS = 25;

router.get('/', async (req, res) => {
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

router.get('/tags', async (req, res) => {
  try {
    const doc = await TagCategory.find();
    res.json({ doc });
  } catch (err) {
    console.error(err);
  }
});

router.post('/tags', upload.array(), async (req, res) => {
  // PUT METHOD ..
  // UPDATE METHOD - not POST..? //production is actually going go via
  // a moderator who will do the update

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

    delete req.body.id;
    delete req.body.name;
    delete req.body.phone;
    delete req.body.website;
    delete req.body['opening-hours'];
    delete req.body.comments;

    // now left with just tags:
    const updatedTags = [];
    Object.keys(req.body).forEach((key) => {
      // add booleans
      if (req.body[key] === 'false') {
      } else if (req.body[key] === 'true') {
        updatedTags.push(key);
      }
      // add string keys (from dropdowns)
      else if (req.body[key] !== '') {
        updatedTags.push(req.body[key]);
      }
    });
    updatedDoc.properties.tags = updatedTags;

    // ----------------------- save proposal to pointLocationEdit collection for review
    const edit = await pointLocationEdit.create(updatedDoc);
    res.status(200).json({ edit });
  } catch (err) {
    console.error(err);
    res.status(504); // service unavailable..? deal with it clientside
  }
  // get doc with id req.body.id

  // compare the two

  // update the found doc

  // DO SOME DATABASE MAGIC
  // probably save this data is a separate collection (reviewPointLocationEdits) to check manually
  // then after checking the data can be saved to a new collection (updatedPointLocations) and the
  // original can be tagged as
  // 'edited' and only the updated document can be served.
  // (i.e two collections are queried when the client searches for locations)
  //--
  // REASON:  by having a separate collection with data different from OSM, it will be easier to
  // submit changes to it.
  // setTimeout(() => {
  //   res.status(200).json({ message: 'thanks buddy' });
  // }, 1000);
});
module.exports = router;
