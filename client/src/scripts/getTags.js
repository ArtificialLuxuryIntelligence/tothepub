import { baseUrl } from '../config/url';

//  fetch helpers
async function getAllTags() {
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

export { getLocalTags, getAllTags };
