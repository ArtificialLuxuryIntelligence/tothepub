import 'normalize.css';
import './styles.scss';
import { baseUrl } from './config/url';
import regeneratorRuntime from 'regenerator-runtime'; // makes async await etc work
import geolocate from './scripts/geolocate';
import findNearest from './scripts/findNearest';
import drawMap from './scripts/drawMap';

// categories to include in drop down (of allTags [from database])
// some tags are good to have on map but there are too few to be a search filter (for now..)
const dropDownTags = ['operator', 'food', 'amenity', 'real-ale'];

const dropDown = document.getElementById('tag-dropdown');
const takeMeButton = document.getElementById('take-me');
let allTags;
let longitude, latitude;

(async () => {
  const { coords } = await geolocate();
  latitude = coords.latitude;
  longitude = coords.longitude;
  // longitude = -0.13703469999999998;
  // latitude = 51.520621633333336;
  allTags = await getallTags();
  let localTags = await getLocalTags(longitude, latitude);
  console.log(localTags);
  populateDropDown(allTags, localTags, dropDownTags);
})();

function toggleLoading() {
  takeMeButton.classList.add('animate');
  //toggle map display block to give it a size to load into;
  // const mapPage = document.getElementById('map-page');
  // mapPage.style.display = 'block'; // so that map loads to size
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
    // Handle error (i.e. user denies geolocation)
    console.error(error);
  }
}

// Button event listener
// takeMeButton.addEventListener("click", () => takeMeToThePub(6));
takeMeButton.addEventListener('click', () => takeMeToThePub(25)); //note: server limit is currently 25 results

// helper
async function getallTags() {
  let url = `${baseUrl}/api/location/tags`;

  let response = await fetch(url);
  let result = await response.json();
  return result.doc;
}
async function getLocalTags(lon, lat) {
  let url = `${baseUrl}/api/location/tags/local?lon=${lon}&lat=${lat}`;

  let response = await fetch(url);
  let result = await response.json();
  return result.localTags;
}

function populateDropDown(allTags, localTags, dropDownTags) {
  //call api for list of tags

  console.log(allTags);
  //dropDownTags is hardcoded array of accepted categories for dropdown
  // let ddallTags = allTags.filter((o) => dropDownTags.includes(o.category));
  let ddallTags = allTags;
  console.log('at', ddallTags);
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
