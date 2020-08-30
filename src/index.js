import "normalize.css";
import "./styles.css";

import regeneratorRuntime from "regenerator-runtime"; // makes async await etc work
import geolocate from "./scripts/geolocate";
import findNearest from "./scripts/findNearest";
import drawMap from "./scripts/drawMap";

(async () => {
  try {
    //Get current position
    const { coords } = await geolocate();
    const { latitude, longitude } = coords;

    const start = [longitude, latitude]; //API format - production
    // const start = [-0.0701679, 51.4868583]; //for testing

    //Find nearest pubs
    const results = 6;
    const nearest = await findNearest(start, results);
    // const end = nearest[0].coords;
    // const name = nearest[0].name;

    //Draw route to pub
    drawMap(start, nearest);

    //add button to choose next pub in list of nearest
  } catch (error) {
    // Handle error
    console.error(error);
  }
})();
