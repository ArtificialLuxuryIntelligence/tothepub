import 'normalize.css';
import './styles.scss';
import regeneratorRuntime from 'regenerator-runtime'; // makes async await etc work
import geolocate from './scripts/geolocate';
import findNearest from './scripts/findNearest';
import drawMap from './scripts/drawMap';

const DEV = true;
// const DEV = false;

const takeMeButton = document.getElementById('take-me');

function toggleLoading() {
  takeMeButton.classList.add('animate');
  //toggle map display block to give it a size to load into;
  const mapPage = document.getElementById('map-page');
  mapPage.style.display = 'block'; // so that map loads to size
}

async function takeMeToThePub(results) {
  toggleLoading();
  try {
    //Get current position
    const { coords } = await geolocate();
    const { latitude, longitude } = coords;

    const start = DEV ? [-0.0701679, 51.4868583] : [longitude, latitude]; //API format - production
    //Find nearest pubs
    const nearest = await findNearest(start, results);
    //Draw route to pub
    drawMap(start, nearest);
    //add button to choose next pub in list of nearest
  } catch (error) {
    // Handle error (i.e. user denies geolocation)
    console.error(error);
  }
}

// Button event listener
//

// takeMeButton.addEventListener("click", () => takeMeToThePub(6));
takeMeButton.addEventListener('click', () => takeMeToThePub(DEV ? 2 : 8)); //testing (saves api calls)
