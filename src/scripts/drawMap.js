import beerPic from "./../assets/beer_destination.png";
const { MAPBOX_TOKEN } = process.env;

function toggleMapView() {
  const mapPage = document.getElementById("map-page");
  const welcomePage = document.getElementById("welcome-page");
  welcomePage.style.display = "none";
  mapPage.style.visibility = "visible"; // so that map loads to size
}

export default function drawMap(start, nearest) {
  //note arg 'nearest' is sorted array of nearest pubs
  //initial shows
  // let total = nearest.length;
  let end = nearest[0].coords;
  let end_message = nearest[0].name;
  //
  mapboxgl.accessToken = MAPBOX_TOKEN;
  let map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v10",
    center: start, // starting position
    zoom: 12,
  });
  // set the bounds of the map //this could be fixed (to bounds on london pubs) and not dynamic as it currently is
  let bounds = [
    [start[0] - 0.3, start[1] - 0.3],
    [start[0] + 0.3, start[1] + 0.3],
  ];
  map.setMaxBounds(bounds);
  // initialize the map canvas to interact with later
  let canvas = map.getCanvasContainer();
  const getRoute = async (start, end, end_message = "") => {
    // make a directions request using walking profile
    let url =
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

    let response = await fetch(url);
    let json = await response.json();
    // console.log(json);
    let data = json.routes[0]; //quickest route
    let route = data.geometry.coordinates;
    let geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: route,
      },
    };
    // if the route already exists on the map, reset it using setData
    if (map.getSource("route")) {
      map.getSource("route").setData(geojson);
    } else {
      // otherwise, make a new request
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: geojson,
            },
          },
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }

    // get the sidebar and add the instructions
    let instructions = document.getElementById("instructions");
    let steps = data.legs[0].steps;
    let tripInstructions = [];
    for (let i = 0; i < steps.length; i++) {
      tripInstructions.push("<br><li>" + steps[i].maneuver.instruction) +
        "</li>";
      instructions.innerHTML =
        `<h1>${end_message}</h1><br><span class="duration">Trip duration: ` +
        Math.floor(data.duration / 60) +
        " min  </span>" +
        tripInstructions;
    }
  };

  map.on("load", async function () {
    // console.log("map loaded!!! (time to hide loader/button)");
    toggleMapView();
    // make an initial directions request that
    // starts and ends at the same location
    await getRoute(start, start); //seems to be neccessary for the API to init..(?)
    await getRoute(start, end, end_message);

    // Add starting point to the map
    map.addSource("start", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: start,
        },
        properties: {
          title: "start",
        },
      },
    });
    map.addLayer({
      id: "point_start",
      type: "circle",
      source: "start",
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be",
      },
    });

    //create and addmarkers for nearest pubs
    nearest.forEach((pub) => {
      let el = document.createElement("div");
      el.className = "marker";
      el.style.backgroundImage = `url(${beerPic})`;
      el.style.width = "60px";
      el.style.height = "60px";
      el.dataset.coords = pub.coords;
      el.dataset.name = pub.name;

      el.addEventListener("click", (e) => markerListener(e));

      new mapboxgl.Marker(el)
        .setLngLat(pub.coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }) // add popup
            .setHTML("<h3>" + pub.name + "</h3>")
        )
        .addTo(map);
    });

    // sets new route to marker
    function markerListener(e) {
      let coords = e.target.dataset.coords.split(",").map((n) => parseFloat(n));
      let name = e.target.dataset.name;
      canvas.style.cursor = "";
      getRoute(start, coords, name);
    }

    // Geolocate button
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
  });
}
