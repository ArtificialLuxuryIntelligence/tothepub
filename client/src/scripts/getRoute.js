export default async function getRoute(start, end) {
  // make a directions request using walking profile
  let url =
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

  let response = await fetch(url);
  let json = await response.json();
  // console.log('JSON', json);
  let data = json.routes[0]; //quickest route

  return data;
}
