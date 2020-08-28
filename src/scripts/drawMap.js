const { MAPBOX_TOKEN } = process.env;
// create a function to make a directions request

//style

export default function (start, end, end_message) {
  //
  mapboxgl.accessToken = MAPBOX_TOKEN;
  var map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v10",
    center: start, // starting position
    zoom: 12,
  });

  // set the bounds of the map
  var bounds = [
    [start[0] - 0.3, start[1] - 0.3],
    [start[0] + 0.3, start[1] + 0.3],
  ];

  map.setMaxBounds(bounds);

  // initialize the map canvas to interact with later
  var canvas = map.getCanvasContainer();

  // an arbitrary start will always be the same
  // only the end or destination will change

  //

  const getRoute = async (start, end, end_message = "") => {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same

    var url =
      "https://api.mapbox.com/directions/v5/mapbox/cycling/" +
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
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
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
    var instructions = document.getElementById("instructions");
    var steps = data.legs[0].steps;

    var tripInstructions = [];
    for (var i = 0; i < steps.length; i++) {
      tripInstructions.push("<br><li>" + steps[i].maneuver.instruction) +
        "</li>";
      instructions.innerHTML =
        '<br><span class="duration">Trip duration: ' +
        Math.floor(data.duration / 60) +
        " min 🚴 </span>" +
        tripInstructions;
    }
  };

  map.on("load", async function () {
    // make an initial directions request that
    // starts and ends at the same location
    await getRoute(start, start); //async not neccessary here..? - had some loading issues
    await getRoute(start, end);

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
    // map.addSource("end", {
    //   type: "geojson",
    //   data: {
    //     type: "Feature",

    //     geometry: {
    //       type: "Point",
    //       coordinates: end,
    //     },
    //     properties: {
    //       title: "end",
    //     },
    //   },
    // });

    map.addLayer({
      id: "point_start",
      type: "circle",
      source: "start",
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be",
      },
    });
    // map.addLayer({
    //   id: "point_end",
    //   type: "circle",
    //   source: "end",
    //   paint: {
    //     "circle-radius": 10,
    //     "circle-color": "#3887be",
    //   },
    // });

    //create marker for endpoint

    ///
    var el = document.createElement("div");
    el.className = "marker";
    el.style.backgroundImage = `url(./src/assets/beer_destination.png)`;
    el.style.width = "60px";
    el.style.height = "60px";

    // add marker to map
    new mapboxgl.Marker(el)
      .setLngLat(end)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // add popups
          .setHTML("<h3>" + end_message + "</h3>")
      )
      .addTo(map);

    ////

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );

    // map.addLayer({
    //   id: "point",
    //   type: "circle",
    //   source: {
    //     type: "geojson",
    //     data: {
    //       type: "FeatureCollection",
    //       features: [
    //         {
    //           type: "Feature",
    //           properties: {},
    //           geometry: {
    //             type: "Point",
    //             coordinates: start,
    //           },
    //         },
    //       ],
    //     },
    //   },
    //   paint: {
    //     "circle-radius": 10,
    //     "circle-color": "#3887be",
    //   },
    // });
    // Add end point to the map

    //allows users to click // not going to use this
    // map.on("click", function (e) {
    //   var coordsObj = e.lngLat;
    //   canvas.style.cursor = "";
    //   var coords = Object.keys(coordsObj).map(function (key) {
    //     return coordsObj[key];
    //   });
    //   var end = {
    //     type: "FeatureCollection",
    //     features: [
    //       {
    //         type: "Feature",
    //         properties: {},
    //         geometry: {
    //           type: "Point",
    //           coordinates: coords,
    //         },
    //       },
    //     ],
    //   };
    //   if (map.getLayer("end")) {
    //     map.getSource("end").setData(end);
    //   } else {
    //     // map.addLayer({
    //     //   id: "end",
    //     //   type: "circle",
    //     //   source: {
    //     //     type: "geojson",
    //     //     data: {
    //     //       type: "FeatureCollection",
    //     //       features: [
    //     //         {
    //     //           type: "Feature",
    //     //           properties: {},
    //     //           geometry: {
    //     //             type: "Point",
    //     //             coordinates: coords,
    //     //           },
    //     //         },
    //     //       ],
    //     //     },
    //     //   },
    //     //   paint: {
    //     //     "circle-radius": 10,
    //     //     "circle-color": "#f30",
    //     //   },
    //     // });
    //   }
    //   getRoute(start, coords);
    // });
  });
}
