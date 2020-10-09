import { pubs } from './../data/pubs';

const { MAPBOX_TOKEN } = process.env;
import { baseUrl } from './../config/url';

//find absolute distance closest
const findNearestDist = async (start, tag, num_results) => {
  let [s_long, s_lat] = start;

  let url = `${baseUrl}/api/location?long=${s_long}&lat=${s_lat}`;

  tag ? (url += `&tag=${tag}`) : null;

  let response = await fetch(url);

  let nearest = await response.json();

  //return nearest
  return nearest.doc.slice(0, num_results); //API sends all this data back... (the results are also  filtered servside by range)
};

//find nearest in travel time from collection of location objects (pubs) - pubs currently loaded clientside (API might be better if functionality/locations extended)
const findNearestTime = async (start, pubs) => {
  let pub_duration = await Promise.all(
    pubs.map(async (pub) => {
      let duration = await getRouteTime(start, pub.geometry.coordinates);
      return {
        ...pub,
        duration,
      };
    })
  );

  pub_duration.sort((a, b) => a.duration - b.duration);
  return pub_duration;
};

//helper get time for a given route
const getRouteTime = async (start, end) => {
  // make a directions request using cycling profile
  mapboxgl.accessToken = MAPBOX_TOKEN;
  var url =
    'https://api.mapbox.com/directions/v5/mapbox/walking/' +
    start[0] +
    ',' +
    start[1] +
    ';' +
    end[0] +
    ',' +
    end[1] +
    '?steps=true&geometries=geojson&access_token=' +
    mapboxgl.accessToken;

  //fetch version

  let response = await fetch(url);
  let json = await response.json();
  return json.routes[0].duration;
};

// some of the geographically nearest pubs are not nearest in travel time

//combined closest in time and distance 
export default async function findNearest(start, tag, num_results) {
  let pubs_dist = await findNearestDist(start, tag, num_results);

  // return pubs_dist;

  //sort nearest 3 to find actual nearest by time
  //this saves unneccessary mapbox api calls
  let nearest3 = await findNearestTime(start, pubs_dist.slice(0, 3));
  return [...nearest3, ...pubs_dist.slice(3)];
}
