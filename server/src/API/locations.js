const { Router } = require('express');
const PointLocation = require('../../models/pointLocation');

const router = Router();

router.get('/', async (req, res) => {
  const r = await PointLocation.find();
  res.json(r);
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
