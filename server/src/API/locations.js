const { Router, response } = require('express');
const PointLocation = require('../../models/pointLocation');

const router = Router();
const SEARCH_RADIUS = 3000;

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
      });
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
      });
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

module.exports = router;
