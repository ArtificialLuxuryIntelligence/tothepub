import 'normalize.css';
import './styles.scss';
import regeneratorRuntime from 'regenerator-runtime'; // makes async await etc work
import geolocate from './scripts/geolocate';
import { getAllTags, getLocalTags } from './scripts/getTags';
import findNearest from './scripts/findNearest';
import drawMap from './scripts/drawMap';

// categories to include in drop down (of allTags [from database])
// reason: some tags are good to have on map but not in search
// DEPRECATED dropDownTags  -- now dropdown only shows available local tags
const dropDownTags = ['operator', 'food', 'amenity', 'real-ale'];

const dropDown = document.getElementById('tag-dropdown');
const takeMeButton = document.getElementById('take-me');
let allTags;
let longitude, latitude;

(async () => {
  const { coords } = await geolocate();
  if (process.env.MODE === 'dev') {
    longitude = -0.13703469999999998;
    latitude = 51.520621633333336;
  } else {
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  allTags = await getAllTags();
  let localTags = await getLocalTags(longitude, latitude);
  // console.log(localTags);
  populateDropDown(allTags, localTags, dropDownTags);
})();

function toggleLoading() {
  takeMeButton.classList.add('animate');
}

async function takeMeToThePub(maxResults) {
  toggleLoading();
  try {
    //Get current position
    const start = [longitude, latitude];
    const tag = dropDown.value;
    //Find nearest pubs
    const nearest = await findNearest(start, tag, maxResults);
    //Draw route to pub
    drawMap(start, nearest, allTags, tag);
    //add button to choose next pub in list of nearest
  } catch (error) {
    // TO DO //
    // Handle error (i.e. user denies geolocation)
    console.error(error);
  }
}

// Button event listener
takeMeButton.addEventListener('click', () => takeMeToThePub(25)); //note: server limit is currently 25 results

function populateDropDown(allTags, localTags, dropDownTags) {
  //call api for list of tags

  // console.log(allTags);
  //dropDownTags is hardcoded array of accepted categories for dropdown
  // let ddallTags = allTags.filter((o) => dropDownTags.includes(o.category));
  let ddallTags = allTags;
  ddallTags.forEach((cat) => {
    if (!cat.tags.some((tag) => localTags.includes(tag.tag))) {
      return; //no local tags in this category (assuming there will be at least one over the count limit)
    }
    let op = document.createElement('option');
    op.disabled = 'disabled';
    op.innerText = '---------------------';
    // capitalise(cat.category);
    dropDown.appendChild(op);
    cat.tags.forEach((tag) => {
      if (localTags.includes(tag.tag)) {
        let op = document.createElement('option');
        op.value = tag.tag;
        op.innerText = tag.tag;
        dropDown.appendChild(op);
      }
    });
  });
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
