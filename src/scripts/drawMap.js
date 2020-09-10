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
        `<h1>${end_message}</h1><span class="duration">Trip duration: ` +
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
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new ToggleDirectionsControl(), "bottom-right");
  });
}

// Control implemented as ES6 class
class ToggleDirectionsControl {
  constructor() {
    this.toggled = true;
    this.directions = document.getElementById("instructions");
  }

  toggleDisplayDirections(e) {
    this.directions.className = this.toggled ? "instructions-active" : "";
    this.toggled = !this.toggled;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    let div = document.createElement("div");
    let button = document.createElement("button");
    let span = document.createElement("span");

    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    div.className = "mapboxgl-ctrl";
    span.className = "mapboxgl-ctrl-icon";

    span.style.backgroundImage =
      "url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaGVpZ2h0PSIxMDAiIGlkPSJzdmc2NTg0IiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSIxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6Y2M9Imh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL25zIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzIGlkPSJkZWZzNjU4NiIvPjxnIGlkPSJsYXllcjEiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsLTk1Mi4zNjIpIj48cGF0aCBkPSJtIDQ3LjkxNjY2NSw5NjIuNzc4NyBjIC00LjYwMjM3LDAgLTguMzMzMzMsMy43MzA4MyAtOC4zMzMzMyw4LjMzMzMzIDAsNC42MDI0OSAzLjczMDk2LDguMzMzMzIgOC4zMzMzMyw4LjMzMzMyIDQuNjAyMzgsMCA4LjMzMzMzLC0zLjczMDgzIDguMzMzMzMsLTguMzMzMzIgMCwtNC42MDI1IC0zLjczMDk1LC04LjMzMzMzIC04LjMzMzMzLC04LjMzMzMzIHogbSAtMjMuOTU4MzMzLDE2LjY2NjY1IDIuMDgzMzMzLDguMzMzMzMgYyAxLjA0MTY3LDQuMTY2NjYgMy41Mjk4Myw0LjE2NjY2IDYuNjQwNjMsNC4xNjY2NiBsIDYuOTAxMDQsMCBjIDIuNDczOTYsNC4xNjY2NyAxLjMxMTEyLDEwLjI5OTE2IDIuMDgzMzMsMTYuNjY2NjYgbCAtMy43NzYwNCwwIGMgLTQuMTY2NjcsMCAtMTAuODA3MjksNC4xNjY3IC02LjY0MDYzLDEyLjUgbCA2LjI1LDEyLjUgYyA0LjE2NjY3LDguMzMzMyAxMC40MTY2NywyLjA4MzMgOC4zMzMzNCwtMi4wODM0IGwgLTYuMjUsLTEyLjQ5OTkgYyAtMS4wNDE2NywtMi4wODM0IDEuMTAxMjUsLTIuMDgzNCAyLjA4MzMzLC0yLjA4MzQgbCAxMC4yODMwNCwwIGMgMCwwIDQuOTMyMjUsMTAuOTQ4MyAxMC43NDIwOSwxOC40NTIxIDIuMTQ0NjYsMi43NyA0LjUyMDI1LDYuNTQ3OSA3LjQ5Mzc1LDYuNTQ3OSAyLjA4MzMzLDAgNS42NTM0OSwtMy4yMTk2IDEuODUzNzksLTcuNzU0MiAtNy4xMTU1OSwtOC40OTE2IC0xMS42MjI2NywtMTcuMjQ1OCAtMTEuNjIyNjcsLTIxLjQxMjQgMCwtNC44NDY3IC0wLjg1MTQyLC0xNS4wNTI5NSAtMi4wODMzMywtMjAuODMzMzYgbCA2LjI1LDAgYyAyLjAzMzMzLDQuMDc1NDIgNS4yMDgzMywxMC40MTY2NiA1LjIwODMzLDEwLjQxNjY2IDIuMzAzMDgsMy45ODkyIDcuMjkxNjcsMy42ODc5IDcuMjkxNjcsMCAwLC0wLjUwNjIgMCwtMS42MjA0IC0wLjU4MTM0LC0yLjgyIGwgLTYuNzEwMzMsLTEzLjg0NjY1IGMgLTAuNDI4MjUsLTAuODgzNzUgLTEuMDU1OTIsLTIuMDgzMzMgLTQuMTY2NjcsLTIuMDgzMzMgbCAtMzIuMjkxNjYsMCAtMy4xMjUsLTEwLjQxNjY2IGMgLTEuMjUsLTQuMTY2NjcgLTcuMjkxNjcsLTQuMTY2NjcgLTcuMjkxNjcsMCAwLDIuMDgzMzMgMC43MzgxNjcsNC42MTI5MSAxLjA0MTY2Nyw2LjI0OTk5IHoiIGlkPSJwYXRoMTA1MjctMSIgc3R5bGU9ImNvbG9yOiMwMDAwMDA7ZmlsbDojMDAwMDAwO2ZpbGwtb3BhY2l0eToxO2ZpbGwtcnVsZTpub256ZXJvO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDoyO21hcmtlcjpub25lO3Zpc2liaWxpdHk6dmlzaWJsZTtkaXNwbGF5OmlubGluZTtvdmVyZmxvdzp2aXNpYmxlO2VuYWJsZS1iYWNrZ3JvdW5kOmFjY3VtdWxhdGUiLz48L2c+PC9zdmc+)";
    span.style.backgroundSize = "contain";
    span.style.backgroundOrigin = "padding-box";
    div.appendChild(button);
    button.appendChild(span);

    button.addEventListener("click", (e) => {
      this.toggleDisplayDirections();
    });
    this._container.appendChild(button);
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}
