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
    // const start = [longitude, latitude];
    const start = [-0.021526, 51.50243];

    //Find nearest pubs
    const nearest = await findNearest(start, 3);
    const end = nearest[0].coords;

    //Draw route to pub
    drawMap(start, end);

    //add button to choose next pub in list of nearest
  } catch (error) {
    // Handle error
    console.error(error);
  }
})();

// (async () => {
//   let nearest = await findNearest([-0.121526, 51.517243], 2);
//   console.log(nearest);
// })();

