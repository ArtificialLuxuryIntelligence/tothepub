// to run: node sanitzeCollection WRITEFILE READFILE1 READFILE2 READFILE3 (etc.)

const fs = require('fs');

// read file and write file from arguments
const [, , write, ...read] = process.argv; //
// console.log('write', write, 'read', read[0]);

const acceptedProps = ['amenity', 'phone', 'name']; //what else -add to model
// const requiredProps = ['name'];

// import file

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
  fs.writeFile(write, JSON.stringify(result), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
})();

//---------------------------------------------------
//helper functions

function sanitizeFeature(feature) {
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
