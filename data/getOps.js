const fs = require('fs');

const readFile = async (filePath) => {
  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.log(err);
  }
};
const [, , ...read] = process.argv; //
console.log(read);

(async () => {
  //combines all input files
  let data = await readFile(read[0]);
  let features = await JSON.parse(data).features; // array of all features
  // console.log(features);
  let operators = features
    .map((f) => f.properties.operator)
    .filter((r) => r !== undefined);
  let count = {};
  operators.forEach((op) => {
    count[op] ? (count[op] += 1) : (count[op] = 1);
  });
  console.log(count);
})();
