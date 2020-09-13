import "normalize.css";
import "./styles.scss";

import regeneratorRuntime from "regenerator-runtime"; // makes async await etc work
import geolocate from "./scripts/geolocate";
import findNearest from "./scripts/findNearest";
import drawMap from "./scripts/drawMap";

//load in image assets
// import beerLoader from "./assets/beer_destination.png";

//

function toggleLoader() {
  const content = document.getElementById("content");
  const loader = document.getElementById("loader");
  content.style.display = "none";
  loader.style.display = "flex";
  //toggle map display block to give it a size to load into;
  const mapPage = document.getElementById("map-page");
  mapPage.style.display = "block"; // so that map loads to size
}

async function takeMeToThePub() {
  toggleLoader();
  try {
    //Get current position
    const { coords } = await geolocate();
    const { latitude, longitude } = coords;
    const start = [longitude, latitude]; //API format - production
    // const start = [-0.0701679, 51.4868583]; //for testing if not in london
    //Find nearest pubs
    const results = 6; //set to six
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
const takeMeButton = document.getElementById("take-me");
takeMeButton.addEventListener("click", takeMeToThePub);
