//note: currently 5 mapbox API directions requests on page load

import beerPic from './../assets/beer_destination.png';
import findNearest from './../scripts/findNearest';
import { baseUrl } from './../config/url';

import { locationEditForm } from './mapboxMarker';
import { showTempModal } from './helpers';
import {
  ToggleDarkModeControl,
  ToggleDirectionsControl,
  ToggleTeleportControl,
  NavigateHomeControl,
} from './mapControls';
import allLocationInfo from './../data/allLocationInfo.js';

const { MAPBOX_TOKEN } = process.env;
const pageCont = document.querySelector('.page-container');

let darkMode = true;
let teleport = false;
let map;

pageCont.classList.add(darkMode ? 'dark' : 'light');

const colourScheme = {
  light: {
    lineColour: 'rgb(17, 35, 55)',
    startCircleColour: 'rgb(17, 35, 55)',
  },
  dark: {
    lineColour: 'rgb(255,255,255)',
    startCircleColour: 'rgb(255,255,255)',
  },
};

function toggleMapView() {
  const home = document.getElementById('welcome-page');
  home.classList.add('fade');
  const mapPage = document.getElementById('map-page');
  // mapPage.style.visibility = "visible"; // visibility used  so that map loads to size ()
  setTimeout(() => {
    const welcomePage = document.getElementById('welcome-page');
    welcomePage.style.display = 'none';
  }, 1300); // hide after fade animation has finished
}

export default function drawMap(start, nearest, allTags, tag) {
  //'nearest' is sorted array of nearest pubs
  console.log(tag, nearest);
  if (nearest.length == 0) {
    //  if home page
    const takeMeButton = document.getElementById('take-me');
    takeMeButton.classList.toggle('animate');
    const errorBox = document.getElementById('error');
    const dropDown = document.getElementById('tag-dropdown');
    errorBox.innerText = `No ${dropDown.value} nearby 😢`;

    return;
  }

  let end = nearest[0].geometry.coordinates;
  let location_name = nearest[0].properties.name;
  console.log(location_name);
  //
  mapboxgl.accessToken = MAPBOX_TOKEN;
  if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
    return;
  }
  // Clear old map from previous render: WARNING this doesn't remove event listeners  so
  //  we want to avoid too many rerenders. currently triggered darktheme is toggled and teleport is used
  // could use map.removeControl()
  document.querySelector('#map').innerHTML = '';

  map = new mapboxgl.Map({
    container: 'map',
    style: darkMode
      ? 'mapbox://styles/mapbox/dark-v10'
      : 'mapbox://styles/mapbox/streets-v10',
    center: start, // starting position
    zoom: 15,
    // pitch: 60, //pitched angle of view
  });
  // set the bounds of the map //this could be fixed (to bounds on london pubs) and not dynamic as it currently is
  const bounds = [
    [start[0] - 0.3, start[1] - 0.3],
    [start[0] + 0.3, start[1] + 0.3],
  ];
  map.setMaxBounds(bounds);
  // initialize the map canvas to interact with later
  let canvas = map.getCanvasContainer();

  map.on('load', async function () {
    // console.log("map loaded!!! (time to hide loader/button)");
    toggleMapView();
    // make an initial directions request that
    // starts and ends at the same location
    let route = await getRoute(start, start, map, ''); //seems to be neccessary for the API to init..(?)
    renderRoute(route, location_name, map);
    route = await getRoute(start, end, map, location_name);
    renderRoute(route, location_name, map);

    // Add starting point to the map

    addStartingPoint(start, map);

    //create and addmarkers for nearest pubs //alternative option is add all pubs as a feature collection
    // see: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/ [current way works fine though]
    // may be useful in future if all added in a single layer (can then toggle layer for sam smith's pubs for example)

    addMarkers(nearest, map);
  });

  function addStartingPoint(start, map) {
    if (map.getLayer('point_start')) {
      map.removeLayer('point_start');
      map.removeSource('start');
    }
    map.addSource('start', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: start,
        },
        properties: {
          title: 'start',
        },
      },
    });
    map.addLayer({
      id: 'point_start',
      type: 'circle',
      source: 'start',
      paint: {
        'circle-radius': 8,
        'circle-color': darkMode
          ? colourScheme.dark.startCircleColour
          : colourScheme.light.startCircleColour,
        'circle-opacity': 1,
      },
    });
  }

  function addMarkers(pubs, map) {
    pubs.forEach((pub) => {
      //fill in any empty properties:
      pub.properties.name = pub.properties.name
        ? pub.properties.name
        : '...name unavailable';
      //
      // pub.properties?.tags?.map((n) => console.log(n)); //only maps if tags exists

      let el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = `url(${beerPic})`;
      el.style.width = '60px';
      el.style.height = '60px';
      // el.dataset.coords = pub.geometry.coordinates;
      // el.dataset.name = pub.properties.name;
      // console.log(pub);
      el.dataset.id = pub._id;
      el.addEventListener('click', (e, pub, nearest) =>
        markerListener(e, pubs, map)
      );

      new mapboxgl.Marker(el, { anchor: 'bottom' })
        .setLngLat(pub.geometry.coordinates)
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnMove: true,
          }) // add popup
            // .setHTML('<h3>' + pub.properties.name + '</h3>')
            .setDOMContent(
              locationEditForm(
                pub,
                allTags,
                allLocationInfo,
                `${baseUrl}/api/location/edit`,
                pub._id,
                true
              )
            )
        )
        .addTo(map);
    });
  }

  async function markerListener(e, pubs, map) {
    // console.log(e.target);
    let id = e.target.dataset.id;
    // console.log(id);
    // console.log(pub);
    let pub = pubs.filter((p) => p._id == id)[0];
    // console.log(nearest); //!!! TODO use this instead of saving all data in dataset - only save id in dataset and find object in nearest
    // e.target.style.opacity = '0.4';
    // setTimeout(() => (e.target.style.opacity = '1'), 2000);
    // let coords = e.target.dataset.coords.split(',').map((n) => parseFloat(n));
    // let name = e.target.dataset.name;
    let coords = pub.geometry.coordinates;
    let name = pub.properties.name;
    canvas.style.cursor = '';
    let data = await getRoute(start, coords, map, name);
    renderRoute(data, name, map);
  }

  function toggleDarkMode() {
    darkMode = !darkMode;
    pageCont.classList.toggle('dark');
    pageCont.classList.toggle('light');

    //rerender map
    drawMap(start, nearest, allTags, tag);
    // map.setStyle('mapbox://styles/mapbox/streets-v11');
    // note map.setStyle() doesn't rerender all layers (line for route
    // ) etc so whole map rerender is needed (there may be some solutions but not really needed here?)
  }
  function toggleTeleport() {
    teleport = !teleport;
    pageCont.classList.toggle('teleport');
  }
  map.on('click', async function (e) {
    console.log(tag);
    if (!teleport) {
      return;
    }
    teleport = false;
    pageCont.classList.remove('teleport');

    const { lng, lat } = e.lngLat;
    start = [lng, lat];
    const nearest = await findNearest(start, tag, 25);
    if (nearest.length == 0) {
      showTempModal(`Sorry, no ${tag} results nearby`, 1200);
      return;
    }
    let end = nearest[0].geometry.coordinates;
    let location_name = nearest[0].properties.name;
    addStartingPoint(start, map);
    addMarkers(nearest, map);
    let data = await getRoute(start, end, map, location_name);
    renderRoute(data, name, map);

    //Draw route to pub
    // drawMap(start, nearest, allTags, tag);
  });

  //  ----------------------------------- Map controls
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })
  );
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  map.addControl(new ToggleDirectionsControl(), 'top-right');
  map.addControl(
    new ToggleDarkModeControl(toggleDarkMode, darkMode),
    'top-right'
  );

  map.addControl(
    new ToggleTeleportControl(toggleTeleport, teleport),
    'bottom-right'
  );
  map.addControl(new NavigateHomeControl(), 'bottom-right');

  // controlsAdded = true;
}

async function getRoute(start, end, map, location_name = '') {
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

//renders route and displays directions
function renderRoute(data, location_name, map) {
  let route = data.geometry.coordinates;
  let geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: route,
    },
  };
  // if the route already exists on the map, reset it using setData
  if (map.getSource('route')) {
    map.getSource('route').setData(geojson);
  } else {
    // otherwise, make a new request
    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: geojson,
          },
        },
      },
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': darkMode
          ? colourScheme.dark.lineColour
          : colourScheme.light.lineColour,
        'line-width': 6,
        'line-opacity': 0.75,
      },
    });
  }

  // get the sidebar and add the instructions
  let instructions = document.getElementById('instructions-content');

  let steps = data.legs[0].steps;
  let tripInstructions = [];
  for (let i = 0; i < steps.length; i++) {
    let symbolType = '';
    if (steps[i].maneuver.type == 'depart') {
      symbolType = 'depart';
    } else if (steps[i].maneuver.type == 'arrive') {
      symbolType = 'arrive';
    } else {
      symbolType = steps[i].maneuver.modifier.replace(/\s/g, ''); //remove spaces for css class
    }

    tripInstructions.push(
      `<br><li class="${symbolType}">` + steps[i].maneuver.instruction
    ) + '</li>';
    instructions.innerHTML =
      `<h1>${location_name}</h1><span class="duration">Trip duration: ` +
      Math.floor(data.duration / 60) +
      ' min  </span>' +
      tripInstructions;
  }
}
