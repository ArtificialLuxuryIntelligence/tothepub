import 'normalize.css';
import './styles.scss';
import regeneratorRuntime from 'regenerator-runtime'; // makes async await etc work
import geolocate from './scripts/geolocate';
import { getAllTags, getLocalTags } from './scripts/getTags';
import findNearest from './scripts/findNearest';
import drawMap from './scripts/drawMap';
import { showError } from './scripts/helpers';


const dropDownTags = ['operator', 'food', 'amenity', 'real-ale']; // DEPRECATED dropDownTags  -- now dropdown only shows available local tags
const dropDown = document.getElementById('tag-dropdown');
const takeMeButton = document.getElementById('take-me');


let allTags, localTags;
let longitude, latitude;

// Init
(async () => {
  let coords;
  try {
    let geo = await geolocate();
    coords = geo.coords;
  } catch (error) {
    //geo locate is disabled
    showError('Please enable geolocation and refresh page');
    removeLoader(300);
    return;
  }

  if (process.env.MODE === 'dev') {
    longitude = -0.13703469999999998;
    latitude = 51.520621633333336;
  } else {
    latitude = coords.latitude;
    longitude = coords.longitude;
  }

  try {
    allTags = await getAllTags();
    localTags = await getLocalTags(longitude, latitude);
    populateDropDown(allTags, localTags, dropDownTags);
  } catch (error) {
    showError('Server errror - please refresh page or try again later');
    removeLoader(300);
  }
  takeMeButton.addEventListener('click', () => takeMeToThePub(25)); //note: server limit is currently 25 results
  removeLoader(0);
})();

// -----------------

async function takeMeToThePub(maxResults) {
  toggleMapLoading();

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
    // probably either render or mapbox error
    showError('Server errror - please refresh page or try again later');
  }
}

function toggleMapLoading() {
  takeMeButton.classList.add('animate');
}

function removeLoader(delay) {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    loader.classList.add('unload');
    setTimeout(() => {
      loader.parentNode.removeChild(loader);
    }, 350);
  }, delay);
}

function populateDropDown(allTags, localTags, dropDownTags) {
  //call api for list of tags

  //dropDownTags is hardcoded array of accepted categories for dropdown
  // let ddallTags = allTags.filter((o) => dropDownTags.includes(o.category));
  let ddallTags = allTags;
  ddallTags.forEach((cat) => {
    if (!cat.tags.some((tag) => localTags.includes(tag.tag))) {
      return; //no local tags in this category
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

// function capitalise(word) {
//   return word.charAt(0).toUpperCase() + word.slice(1);
// }
