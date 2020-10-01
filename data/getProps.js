//EXAMPLE USAGE : list all 'cuisine' properties:
// node getProps.js cuisine greater_london_pubs_OSM.geojson

const fs = require('fs');

const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.log(err);
  }
};
const [, , property, ...read] = process.argv; //
console.log(read);

(async () => {
  //combines all input files
  let data = await readFile(read[0]);
  let features = await JSON.parse(data).features; // array of all features
  // console.log(features);
  let operators = features

    .map(
      (f) =>
        // f.properties.operator ? tidy(f.properties.operator.toLowerCase()) : null
        f.properties[property] ? f.properties[property].toLowerCase() : null
      //
    )
    .filter((r) => r !== null);
  let count = {};
  operators.forEach((op) => {
    count[op] ? (count[op] += 1) : (count[op] = 1);
  });
  console.log(orderByKey(count));
  // console.log(Object.keys(count).sort());
  console.log('total: ', Object.keys(count).length);
})();

function tidy(operator) {
  return operator.match(new RegExp('wethers|weathersp|jd we', 'gi'))
    ? 'Wetherspoon'
    : operator;
}

function orderByKey(unordered) {
  let ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach(function (key) {
      ordered[key] = unordered[key];
    });
  return ordered;
}
