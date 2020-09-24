const { Router, response } = require('express');

const multer = require('multer');

const upload = multer();

const PointLocation = require('../../models/pointLocation');
const Tags = require('../../models/tags');
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
  // UPDATE METHOD - not POST..? //production is actually going go via 
  // a moderator who will do the update
  console.log(req.body);

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
  setTimeout(() => {
    res.status(200).json({ message: 'thanks buddy' });
  }, 4000);
});
module.exports = router;
