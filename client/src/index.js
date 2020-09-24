import 'normalize.css';
import './styles.scss';
import regeneratorRuntime from 'regenerator-runtime'; // makes async await etc work
import geolocate from './scripts/geolocate';
import findNearest from './scripts/findNearest';
import drawMap from './scripts/drawMap';

const DEV = true;
// const DEV = false;

const dropDown = document.getElementById('tag-dropdown');
const takeMeButton = document.getElementById('take-me');
const dropDownTags = ['operator', 'food'];
let tagData;

(async () => {
  tagData = await getTagData();
  populateDropDown(tagData, dropDownTags);
})();

function toggleLoading() {
  takeMeButton.classList.toggle('animate');
  //toggle map display block to give it a size to load into;
  // const mapPage = document.getElementById('map-page');
  // mapPage.style.display = 'block'; // so that map loads to size
}

async function takeMeToThePub(maxResults) {
  toggleLoading();
  try {
    //Get current position
    const { coords } = await geolocate();
    const { latitude, longitude } = coords;

    const start = DEV
      ? [-0.13703469999999998, 51.510621633333336]
      : [longitude, latitude]; //API format - production
    const tag = dropDown.value;
    //Find nearest pubs
    const nearest = await findNearest(start, tag, maxResults);
    //Draw route to pub
    drawMap(start, nearest, tagData);
    //add button to choose next pub in list of nearest
  } catch (error) {
    // Handle error (i.e. user denies geolocation)
    console.error(error);
  }
}

// Button event listener
// takeMeButton.addEventListener("click", () => takeMeToThePub(6));
takeMeButton.addEventListener('click', () => takeMeToThePub(25)); //note: server limit is currently 25 results

// helper
async function getTagData() {
  let url = `http://localhost:5000/api/location/tags`;
  let response = await fetch(url);
  let result = await response.json();
  return result.doc;
}

function populateDropDown(tagData, dropDownTags) {
  //call api for list of tags

  function capitalise(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  console.log(tagData);
  let ddTagData = tagData.filter((o) => dropDownTags.includes(o.category));
  ddTagData.forEach((cat) => {
    let op = document.createElement('option');
    op.disabled = 'disabled';
    op.innerText = capitalise(cat.category);
    dropDown.appendChild(op);
    cat.tags.forEach((tag) => {
      let op = document.createElement('option');
      op.value = tag;
      op.innerText = tag;
      dropDown.appendChild(op);
    });
  });
  // let tags = result.doc.tags;
  // tags.forEach((tag) => {
  //   let op = document.createElement('option');
  //   op.value = tag;
  //   op.innerText = tag;
  //   dropDown.appendChild(op);
  // });

  //populate list with these tags
}
