//note: currently 5 mapbox API directions requests on page load

import beerPic from './../assets/beer_destination.png';
import findNearest from './findNearest';
import getRoute from './getRoute';
import { baseUrl } from './../config/url';

import { locationEditForm } from './locationEditForm';
import { showTempModal, showError } from './helpers';
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
pageCont.classList.add(darkMode ? 'dark' : 'light');
let teleport = false;
let map;

const colourScheme = {
  light: {
    lineColour: 'rgb(17, 35, 55)',
    startCircleColour: 'rgb(17, 35, 55)',
  },
  dark: {
    lineColour: '#ff5b1f',
    startCircleColour: 'rgb(255,255,255)',
  },
};

export default function drawMap(start, nearest, allTags, tag) {
  //'nearest' is sorted array of nearest pubs
  if (nearest.length == 0) {
    //  if home page
    const takeMeButton = document.getElementById('take-me');
    takeMeButton.classList.toggle('animate');
    const dropDown = document.getElementById('tag-dropdown');

    //  shouldn't be needed with local tags
    showError(`No ${dropDown.value} nearby 😢`);

    return;
  }

  let end = nearest[0].geometry.coordinates;
  let location_name = nearest[0].properties.name;
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
  // set the bounds of the map
  const bounds = [
    [start[0] - 0.3, start[1] - 0.3],
    [start[0] + 0.3, start[1] + 0.3],
  ];
  map.setMaxBounds(bounds);
  let canvas = map.getCanvasContainer();

  map.on('load', async function () {
    // make an initial directions request that
    // starts and ends at the same location
    let route = await getRoute(start, start, ''); //seems to be neccessary to init..(?) from docs
    renderRoute(route, location_name, map);
    route = await getRoute(start, end, location_name);
    renderRoute(route, location_name, map);

    // Add starting point to the map
    addStartingPoint(start, map);

    //create and addmarkers for nearest pubs //alternative option is add all pubs as a feature collection
    // see: https://docs.mapbox.com/mapbox-gl-js/example/popup-on-click/ [current way works fine though]
    // may be useful in future if all added in a single layer (can then toggle layer for sam smith's pubs for example)
    addMarkers(nearest, start, allTags, map);

    // show map after all content is loaded
    toggleMapView();
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
    addMarkers(nearest, start, allTags, map);
    let data = await getRoute(start, end, location_name);
    renderRoute(data, name, map);
  });
}

function toggleMapView() {
  const home = document.getElementById('welcome-page');
  const mapPage = document.getElementById('map-page');
  home.classList.add('fade');
  setTimeout(() => {
    const welcomePage = document.getElementById('welcome-page');
    welcomePage.style.display = 'none';
  }, 1300); // remove/hide after fade animation has finished
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

function addMarkers(pubs, start, allTags, map) {
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
    el.dataset.id = pub._id;
    el.addEventListener('click', (e) => {
      markerListener(e, pubs, start, map);
    });

    new mapboxgl.Marker(el, { anchor: 'bottom' })
      .setLngLat(pub.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
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

async function markerListener(e, pubs, start, map) {
  let id = e.target.dataset.id;
  let pub = pubs.filter((p) => p._id == id)[0];
  let coords = pub.geometry.coordinates;
  let name = pub.properties.name;
  // canvas.style.cursor = '';
  let data = await getRoute(start, coords, name);
  renderRoute(data, name, map);
}
