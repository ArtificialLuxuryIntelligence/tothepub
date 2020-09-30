//cleans up OSM geojson data and strips out unused data for use in the apps database
// to run: node sanitizeCollection READFILE1 READFILE2 READFILE3 (etc.)
// e.g. node sanitizeCollection.js greater_london_pubs_OSM.geojson greater_london_bars_OSM.geojson
const fs = require('fs');

// read file and write file from arguments
const [, , ...read] = process.argv; //
// console.log(read);

// *************** this coincides with allLocationInfo in drawMap.js (plus tags)
const acceptedProps = ['name', 'phone', 'website', 'opening_hours', 'tags']; //properties not deleted and displayed as general location info (except for tags) ('tags' extra prop added)

//
const acceptedTagProps = [
  'operator',
  'brand',
  'brewery',
  'real_ale',
  'real_cider',
  'camra',
  'amenity',
  'food',
]; //properties to be manipulated/searched through and turned into tags property (array)

//NOTE display and  category are used clientside

//  todo: add extra property to determine whether or not the tag will be show on the home page (for filtering)
//    -> currently filtered using hardcoded array clientside
const accepetedTagData = [
  //  key: "ANY": will add tag if regex matches with any value in any property(from accepted list above)  (general search)
  //  key: "NONE" will add tag to tag list but will not add it to any entry in database (this will make it available for users to add)
  //  key: someValue : will only look for regex match in that specific property

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
    regex: new RegExp('samuel s', 'gi'),
    tag: `Samuel Smith`,
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
    tag: `Antic London`,
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
    regex: new RegExp('free house', 'gi'),
    tag: `Free House`,
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
  {
    key: 'NONE',
    // regex: new RegExp('bar', 'gi'),
    tag: 'Independent',
    category: 'operator',
    editDisplay: 'dropdown',
    homeDropdown: false,
  },
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
  // console.log(result);
  fs.writeFile('pointLocation.json', JSON.stringify(result), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  //  ********note: these are starting values. if new tags are added that aren't in 'accepted tag data' then
  //  this list will be outdated and shouldn't overwrite the tags in the database!
  //  depends on whether or not I make a route to add new tags...
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

  const accepetedTagDataByValue = accepetedTagData.filter(
    (tag) => tag.key === 'ANY'
  ); // filter out tags that need to searched for within specific properties
  const accepetedTagDataByKey = accepetedTagData.filter(
    (tag) => tag.key !== 'ANY'
  );

  Object.values(clone).forEach((v) => {
    //loop over all accepted tag data
    accepetedTagDataByValue.forEach((o) => {
      //if it is found then add relevant tag
      if (matcher(v, o.regex)) {
        tags.push(o.tag);
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

//find central point (mean) of array of 2d arrays x
function centralPoint(array) {
  // console.log(array[0])
  let sum = array.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]);
  return sum.map((n) => n / array.length);
}

//simplify geometry object to a single point
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

function addTagInstancesCount(formattedData, allFeatures) {
  // do this for all categories // here just operat
  let operators = allFeatures
    .map((f) => f.properties.operator)
    .filter((r) => r !== undefined);
  console.log(operators);
  let count = {};
  operators.forEach((op) => {
    count[op] ? (count[op] += 1) : (count[op] = 1);
  });
  console.log(count);
}
