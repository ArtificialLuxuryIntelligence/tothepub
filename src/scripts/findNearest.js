import { pubs } from "./../data/pubs";

const { MAPBOX_TOKEN } = process.env;

//EXPLANTION:
// some of the geographically nearest pubs are found first in order to minimise API calls. this list is then refined by using the
// mapbox API to determine the nearest in travel time.

//find absolute distance closest
function findNearestDist(start, num_results) {
  let [s_long, s_lat] = start;

  //add abs key to pub objects (absolute distance to start)
  let pub_abs = pubs.map((pub) => {
    let [p_long, p_lat] = pub.coords;

    return {
      ...pub,
      abs: Math.sqrt(Math.pow(p_long - s_long, 2) + Math.pow(p_lat - s_lat, 2)),
    };
  });

  pub_abs.sort((a, b) => a.abs - b.abs);
  //return nearest
  return pub_abs.slice(0, num_results);
}

//find nearest in travel time from collection of location objects (pubs)
const findNearestTime = async (start, pubs, num_results) => {
  let pub_duration = await Promise.all(
    pubs.map(async (pub) => {
      let duration = await getRouteTime(start, pub.coords);
      return {
        ...pub,
        duration,
      };
    })
  );

  pub_duration.sort((a, b) => a.duration - b.duration);
  return pub_duration.slice(0, num_results);
};

//helper - get time for a given route
const getRouteTime = async (start, end) => {
  // make a directions request using cycling profile
  mapboxgl.accessToken = MAPBOX_TOKEN;
  var url =
    "https://api.mapbox.com/directions/v5/mapbox/walking/" +
    start[0] +
    "," +
    start[1] +
    ";" +
    end[0] +
    "," +
    end[1] +
    "?steps=true&geometries=geojson&access_token=" +
    mapboxgl.accessToken;

  //fetch version

  let response = await fetch(url);
  let json = await response.json();
  return json.routes[0].duration;
};

//combined closest in time and distance as explained above
export default async function findNearest(start, num_results) {
  //returns two more than results requested to allow for different order of nearest by time and nearest by distance
  let pubs_dist = findNearestDist(start, num_results + 2); 
  // console.log(pubs_dist);
  let pubs_time = await findNearestTime(start, pubs_dist, num_results);
  // console.log(pubs_time);

  return pubs_time;
}
