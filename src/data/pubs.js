// use https://docs.mapbox.com/search-playground/ for coordinates

let pubs = [
  { name: "Princess Louise", coords: [-0.12158759352587367,51.51737806936217] },
  { name: "The Bricklayers Arms", coords: [-0.21669108467699516,51.466075477959265] },
  { name: "Angel", coords: [-0.059105635565401826,51.50061280307207] },
  { name: "Lyceum Tavern", coords: [-0.11972930560534678,51.51129329974236] },
  { name: "Fitzroy Tavern", coords: [-0.13461719027088748,51.51861352695556] },
  { name: "The Crown", coords: [-0.12638936536700385,51.51684490338778] },
  { name: "The Champion", coords: [-0.13727587051334922,51.516871727419755] },
  { name: "The Chandos", coords: [-0.12678413515232023,51.509530002787784] },
  { name: "The Captain Kidd", coords: [-0.05807251024953075,51.503430193866336] },
  { name: "Cittie of Yorke", coords: [-0.11279127372790754,51.518523084613946] },
  { name: "Yorkshire Grey", coords: [0.14132382207696992,51.51890455605272] },
  { name: "The Crown and Sugarloaf", coords: [-0.10498661234180418,51.51408782407938] },
  { name: "Ye Olde Cheshire Cheese", coords: [-0.10717814581153107,51.51446783462424] },
];

//NOTE:

//reverse order of coordinates for mapbox API format ...

// pubs = pubs.map((pub) => {
//   return {
//     ...pub,
//     coords: [pub.coords[1], pub.coords[0]],
//   };
// });

export { pubs };
