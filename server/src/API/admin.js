const { Router, response } = require('express');

const multer = require('multer');

const upload = multer();

const PointLocation = require('../../models/pointLocation');
const PointLocationEdit = require('../../models/pointLocationEdit');
const TagCategory = require('../../models/tagCategory');

const router = Router();

// TODO AUTH middleware

router.get('/', (req, res, next) => {
  res.json({ welcome: 'to the admin server' });
});

router.get('/edits', async (req, res) => {
  const limit = 100;
  const { page } = req.query;

  async function fetchOriginals(edits) {
    const response = [];
    await Promise.all(
      edits.map(async (edit) => {
        const original = await PointLocation.findOne({ _id: edit.refId });
        response.push({ original, edit });
      })
    );
    return response;
  }

  try {
    const edits = await PointLocationEdit.find()
      .limit(limit)
      .skip((page - 1) * limit);

    const response = await fetchOriginals(edits);
    res.json({ response });
    // res.json({ edits });
  } catch (err) {
    console.error(err);
  }
});

router.post('/edit', upload.array(), async (req, res) => {
  //  this is probably overly complicated. it would be easier to create template json clientside
  //  and fill it in using the form data before sending it here

  const {
    id,
    comments,
    name,
    phone,
    website,
    'opening-hours': openingHours,
  } = req.body;

  console.log('hi');  

  try {
    // ----------get original document that request is proposing to an update to
    const original = await PointLocation.findOne({
      _id: id,
    }).exec();
    console.log(original);

    // ------------ create a proposal update object (clone original and update)

    const updatedDoc = JSON.parse(JSON.stringify(original)); // copy original
    // add all of form content in correct structure

    //  add properties:
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

    //  ------------------------ Deal with new tags --------------------
    // ! ! better solution: mark newly added tags clientside
    //  find if any new tags have been added
    //  only check to see if new options have been added to dropdowns
    //  (new boolean isn't implemented -TODO?)

    console.log(updatedTags);

    if (updatedDropdowns.length !== 0) {
      await Promise.all(
        updatedDropdowns.map(async (tagCat) => {
          const originalTagCat = await TagCategory.findOne({
            category: Object.keys(tagCat)[0],
          });

          if (originalTagCat.tags.includes(Object.values(tagCat)[0])) {
          } else {
            await TagCategory.findByIdAndUpdate(originalTagCat._id, {
              tags: [...originalTagCat.tags, Object.values(tagCat)[0]],
            });
          }
        })
      );
    }

    // ----------------------- save proposal to pointLocationEdit collection for review
    const updated = await PointLocation.findOneAndUpdate(
      { _id: id },
      updatedDoc,
      { new: true }
    );
    await PointLocationEdit.findOneAndDelete({ refId: id });
    // find.. editdoc (refId: updatedDoc.id) ???
    // and delete

    res.status(200).json({ updated });
  } catch (err) {
    console.error(err);
    res.status(504); // service unavailable..? deal with it clientside
  }
});

// DELETE METHOD?
router.post('/deleteedit', upload.array(), async (req, res, next) => {
  const { id } = req.query;
  try {
    const doc = await PointLocationEdit.findOneAndDelete({ refId: id });
    res.status(200).json({ message: 'success', doc, id });
    // res.redirect('/admin');
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
