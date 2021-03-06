//cleans up OSM geojson data and strips out unused data for use in the apps database
// to run: node sanitizeCollection READFILE1 READFILE2 READFILE3 (etc.)
// e.g. node sanitizeCollection.js greater_london_pubs_OSM.geojson greater_london_bars_OSM.geojson

// ---------- see node file getOps for seeing all operators (or any other) property and possibly adding new tags from dataset

const fs = require('fs');
// read file and write file from arguments
const [, , ...read] = process.argv; //

const acceptedProps = ['name', 'phone', 'website', 'opening_hours', 'tags']; //properties kept as general location info for pointLocation model(except for tags -'tags' extra prop added)

////properties to be searched through (and manipulated) and turned into tag
const acceptedTagProps = [
  'operator',
  'brand',
  'brewery',
  'real_ale',
  'real_cider',
  'camra',
  'amenity',
  'food',
  'craft',
  'craft_keg',
  'craft_beer',
  'outdoor_seating',
  'live_music',
  'live_music_venue',
];

// see TagCategory model (.js file in server folder) for properties saved in DB.
// note currently homeDropdown (for whether or not to display on homepage) is NOT used/saved to DB

const accepetedTagData = [
  //  key: "ANY": will add tag if regex matches with any value in any property(from accepted list above)  (general search)
  //  key: "NONE" will add tag to tag list but will not add it to any pointLocation in database (but it will be available for users to add to places)
  //  key: someValue : will only look for regex match in the values of that specific property

  // ------------------ operators
  {
    key: 'ANY',
    regex: new RegExp('samuel s', 'gi'),
    tag: `Samuel Smith's`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'ANY',
    regex: new RegExp('wetherspoon|weatherspoon', 'gi'),
    tag: 'Wetherspoon',
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'ANY',
    regex: new RegExp('brewdog', 'gi'),
    tag: 'Brewdog',
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp(`fuller`, 'gi'),
    tag: `Fuller's`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'ANY',
    regex: new RegExp(`greene king`, 'gi'),
    tag: `Greene King`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('Shepherd Neame', 'gi'),
    tag: `Shepherd Neame`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp(`young`, 'gi'),
    tag: `Young's`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('Taylor Walker', 'gi'),
    tag: `Taylor Walker`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('Stonegate Pub Company', 'gi'),
    tag: `Stonegate Pub Company`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('antic', 'gi'),
    tag: `Antic`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('spirit pub comp', 'gi'),
    tag: `Spirit Pub Company`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('Mitchells & Butlers', 'gi'),
    tag: `Mitchells & Butlers`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  //not really an operator
  // {
  //   key: 'operator',
  //   regex: new RegExp('beefeater', 'gi'),
  //   tag: `Beefeater`,
  //   category: 'operator',
  //   editDisplay: 'dropdown',
  //   homeDropdown: true,
  // },
  {
    key: 'operator',
    regex: new RegExp('free house|freehouse', 'gi'),
    tag: `Independent`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'operator',
    regex: new RegExp('slug and lett', 'gi'),
    tag: `Slug and Lettuce`,
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  // {
  //   key: 'NONE',
  //   // regex: new RegExp('bar', 'gi'),
  //   tag: 'Independent',
  //   category: 'operator',
  //   editDisplay: 'dropdown',
  //   homeDropdown: false,
  // },
  // ------------------ amenity
  {
    key: 'amenity',
    regex: new RegExp('pub', 'gi'),
    tag: 'pub',
    category: 'amenity',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  {
    key: 'amenity',
    regex: new RegExp('bar', 'gi'),
    tag: 'bar',
    category: 'amenity',
    editDisplay: 'dropdown',
    homeDropdown: true,
  },
  // ------------------ booleans
  {
    key: 'outdoor_seating',
    regex: new RegExp(`^(?!no).*$`, 'gi'), //anything but starting with no
    tag: 'outdoor seating',
    category: 'outdoor_seating',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'food',
    regex: new RegExp(`yes`, 'gi'),
    tag: 'food',
    category: 'food',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'real_cider',
    regex: new RegExp(`yes|\d`, 'gi'),
    tag: 'real cider',
    category: 'real_cider',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'real_ale',
    regex: new RegExp(`yes|\d`, 'gi'),
    tag: 'real ale',
    category: 'real_ale',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'camra',
    regex: new RegExp('yes', 'gi'),
    tag: 'real ale',
    category: 'real_ale', // separate display for CAMRA below
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'camra',
    regex: new RegExp('yes', 'gi'),
    tag: 'CAMRA',
    category: 'camra',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'craft_beer',
    regex: new RegExp('yes', 'gi'),
    tag: 'craft beer',
    category: 'craft_beer',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'craft_keg',
    regex: new RegExp('yes', 'gi'),
    tag: 'craft beer',
    category: 'craft_beer',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'live_music',
    regex: new RegExp(`^(?!\s*$).+`, 'gi'), //anything at least one non space char
    tag: 'live music',
    category: 'live_music',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
  {
    key: 'live_music_venue',
    regex: new RegExp(`yes`, 'gi'), //anything at least one non space char
    tag: 'live music',
    category: 'live_music',
    editDisplay: 'boolean',
    homeDropdown: true,
  },
];

const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.log(err);
  }
};

let result = [];

(async () => {
  let formattedTagData = formatTagData(accepetedTagData);

  for (let i = 0; i < read.length; i++) {
    //combines all input files
    let data = await readFile(read[i]);
    let features = JSON.parse(data).features; // array of all features
    let sanitized = features.map((feature) =>
      sanitizeFeature(feature, formattedTagData)
    );
    result = [...result, ...sanitized];
  }

  fs.writeFile('pointLocation.json', JSON.stringify(result), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  fs.writeFile('tagCategory.json', JSON.stringify(formattedTagData), function (
    err
  ) {
    if (err) throw err;
    console.log('Saved!');
  });
})();

//---------------------------------------------------
//helper functions

function sanitizeFeature(feature, formattedTagData) {
  feature.properties.tags = extractTags(
    feature.properties,
    acceptedTagProps,
    accepetedTagData,
    formattedTagData
  ); // add tag property
  return {
    type: 'Feature',
    properties: filterObject(feature.properties, acceptedProps),
    geometry: reduceGeometryToPoint(feature.geometry),
  };
}

//filter out keys not in accepetedProps array
function filterObject(t, acceptedProps = []) {
  for (const prop in t) {
    // console.log(prop);
    if (!acceptedProps.includes(prop)) {
      delete t[prop];
    }
  }

  //check for required properties
  // let keys = Object.keys(t);
  // let bool = requiredProps.every((prop) => keys.includes(prop));
  // if (!bool) {
  //   console.error(t);
  //   return {};
  // }
  return t;
}

function extractTags(
  object,
  acceptedTagProps = [],
  accepetedTagData = [],
  formattedTagData
) {
  let tags = [];
  let clone = JSON.parse(JSON.stringify(object));
  filterObject(clone, acceptedTagProps); //remove unwanted properties before searching for useful tag data;
  /// useful tag data to extract..

  const accepetedTagDataByAny = accepetedTagData.filter(
    (tag) => tag.key === 'ANY'
  );
  // filter out tags that need to searched for within specific properties
  const accepetedTagDataByKey = accepetedTagData.filter(
    (tag) => tag.key !== 'ANY'
  );

  Object.values(clone).forEach((v) => {
    //loop over all accepted tag data
    accepetedTagDataByAny.forEach((o) => {
      //if it is found then add relevant tag
      if (matcher(v, o.regex)) {
        tags.push(o.tag);
        //  increment tag count
        let cat = formattedTagData.filter((t) => t.category === o.category)[0];
        let t = cat.tags.filter((p) => p.tag === o.tag)[0];
        t.count++;
      }
    });
  });

  Object.keys(clone).forEach((k) => {
    accepetedTagDataByKey.forEach((o) => {
      if (k == o.key) {
        if (matcher(clone[k], o.regex)) {
          tags.push(o.tag);
          let cat = formattedTagData.filter(
            (t) => t.category === o.category
          )[0];
          let t = cat.tags.filter((p) => p.tag === o.tag)[0];
          t.count++;
        }
      }
    });
  });

  function matcher(s, re) {
    return s.match(re) ? true : false;
  }

  return [...new Set(tags)]; //remove dupes
}

//find central point (mean) of array of 2d arrays
function centralPoint(array) {
  // console.log(array[0])
  let sum = array.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
  return sum.map((n) => n / array.length);
}

//simplify geometry object in geoJSON object to a single point
function reduceGeometryToPoint(geometry = {}) {
  let coordinates;
  switch (geometry.type.toLowerCase()) {
    case 'point':
      coordinates = geometry.coordinates;
      break;
    case 'polygon':
      coordinates = centralPoint(geometry.coordinates[0]);
      break;
    case 'linestring':
      coordinates = centralPoint(geometry.coordinates);
      break;
    case 'multipolygon':
      coordinates = centralPoint(
        geometry.coordinates.map((a) => centralPoint(a[0]))
      );
      break;
    default:
      coordinates = geometry.coordinates;
      break;
  }
  return { type: 'Point', coordinates: coordinates };
}

// formats the unstructured array of tagdata to more useable object clientside (grouped by category and stripped of regex )
// used to create TagCategory seed JSON
function formatTagData(accepetedTagData) {
  let result = [];
  let categories = []; //track all cats added so far
  accepetedTagData.forEach((tagO) => {
    if (!categories.includes(tagO.category)) {
      result.push({
        category: tagO.category,
        editDisplay: tagO.editDisplay,
        tags: [{ tag: tagO.tag, count: 0 }],
      });
      categories.push(tagO.category);
      return;
    } else {
      //category already exists
      // console.log('r', result);
      let cat = result.filter((o) => o.category == tagO.category)[0];
      if (!cat.tags.map((t) => t.tag).includes(tagO.tag)) {
        cat.tags.push({ tag: tagO.tag, count: 0 });
      }
    }
  });
  //structures the acceptedTagData -sorts by category
  return result;
}
