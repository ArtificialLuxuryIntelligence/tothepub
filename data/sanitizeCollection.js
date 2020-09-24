//cleans up OSM geojson data and strips out unused data for use in the apps database
// to run: node sanitzeCollection WRITEFILE READFILE1 READFILE2 READFILE3 (etc.)

const fs = require('fs');

// read file and write file from arguments
const [, , ...read] = process.argv; //
console.log(read);

// *************** this coincides with allLocationInfo in drawMap.js (plus tags)
const acceptedProps = ['name', 'phone', 'website', 'opening_hours', 'tags']; //properties not deleted and displayed as general location info (except for tags) ('tags' extra prop added)
//
const acceptedTagProps = [
  'operator',
  'brand',
  'brewery',
  'real_ale',
  'camra',
  'amenity',
  'food',
]; //properties to be manipulated/searched through and turned into tags property (array)

//NOTE display and  category are used clientside
// *************this coincides with allTags in drawMap.js [***** NOW exported to tags.json (better name needed)]
const accepetedTagData = [
  //  key: "ANY": will add tag if regex matches with any value in any property(from accepted list above)  (general search)
  //  key: "NONE" will add tag to tag list but will not add it to any entry in database (this will make it available for users to add)
  //  key: someValue : will only look for regex match in that specific property
  {
    key: 'ANY',
    regex: new RegExp('samuel s', 'gi'),
    tag: `Samuel Smith's`,
    category: 'operator',
    editDisplay: 'dropdown',
  },
  {
    key: 'ANY',
    regex: new RegExp('wetherspoon|weatherspoon', 'gi'),
    tag: 'Wetherspoons',
    category: 'operator',
    editDisplay: 'dropdown',
  },
  {
    key: 'NONE',
    // regex: new RegExp('bar', 'gi'),
    tag: 'Independent',
    category: 'operator',
    editDisplay: 'dropdown',
  },
  {
    key: 'food',
    regex: new RegExp(`yes`, 'gi'),
    tag: 'food',
    category: 'food',
    editDisplay: 'boolean',
  },
  {
    key: 'real_ale',
    regex: new RegExp(`yes|\d`, 'gi'),
    tag: 'real ale',
    category: 'real_ale',
    editDisplay: 'boolean',
  },
  {
    key: 'camra',
    regex: new RegExp('yes', 'gi'),
    tag: 'real ale',
    category: 'real_ale', //no separate display for CAMRA ..yet
    editDisplay: 'boolean',
  },
  {
    key: 'real_cider',
    regex: new RegExp(`yes|\d`, 'gi'),
    tag: 'real cider',
    category: 'real_cider',
    editDisplay: 'boolean',
  },
  {
    key: 'amenity',
    regex: new RegExp('pub', 'gi'),
    tag: 'pub',
    category: 'amenity',
    editDisplay: 'dropdown',
  },
  {
    key: 'amenity',
    regex: new RegExp('bar', 'gi'),
    tag: 'bar',
    category: 'amenity',
    editDisplay: 'dropdown',
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
  for (let i = 0; i < read.length; i++) {
    //combines all input files
    let data = await readFile(read[i]);
    let features = JSON.parse(data).features; // array of all features
    let sanitized = features.map((feature) => sanitizeFeature(feature));
    result = [...result, ...sanitized];
  }
  // console.log(result);
  fs.writeFile('pointLocation.json', JSON.stringify(result), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

  let formattedTagData = formatTagData(accepetedTagData);
  //  ********note: these are starting values. if new tags are added that aren't in 'accepted tag data' then
  //  this list will be outdated and shouldn't overwrite the tags in the database!
  //  depends on whether or not I make a route to add new tags...
  fs.writeFile(
    'tagCategories.json',
    JSON.stringify(formattedTagData),
    function (err) {
      if (err) throw err;
      console.log('Saved!');
    }
  );
})();

//---------------------------------------------------
//helper functions

function sanitizeFeature(feature) {
  feature.properties.tags = extractTags(
    feature.properties,
    acceptedTagProps,
    accepetedTagData
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

function extractTags(object, acceptedTagProps = [], accepetedTagData = []) {
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
      matcher(v, o.regex) ? tags.push(o.tag) : null;
    });
  });

  Object.keys(clone).forEach((k) => {
    accepetedTagDataByKey.forEach((o) => {
      if (k == o.key) {
        matcher(clone[k], o.regex) ? tags.push(o.tag) : null;
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
        tags: [tagO.tag],
      });
      categories.push(tagO.category);
      return;
    } else {
      //category already exists
      console.log('r', result);
      let cat = result.filter((o) => o.category == tagO.category)[0];
      if (!cat.tags.includes(tagO.tag)) {
        cat.tags.push(tagO.tag);
      }
    }
  });
  //structures the acceptedTagData -sorts by category
  return result;
}
