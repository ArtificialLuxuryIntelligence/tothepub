let pubs = [
  { name: "Princess Louise", coords: [51.5172923, -0.1238149] },
  { name: "The Bricklayers Arms", coords: [51.5177743, -0.1355814] },
  { name: "Angel", coords: [51.5006419, -0.0612343] },
  { name: "Lyceum Tavern", coords: [51.5113067, -0.1219113, 17] },
  { name: "Fitzroy Tavern", coords: [51.5186572, -0.1369183] },
  { name: "The Crown", coords: [51.5168499, -0.1285845] },
  { name: "The Champion", coords: [51.5168583, -0.1394679] },
  { name: "The Chandos", coords: [51.5095517, -0.1289697] },
  { name: "The Captain Kidd", coords: [51.5034528, -0.060197] },
  { name: "Cittie of Yorke", coords: [51.5184589, -0.1149756] },
  { name: "Yorkshire Grey", coords: [51.5189633, -0.1435736] },
  { name: "The Crown and Sugarloaf", coords: [51.5140163, -0.1071826] },
  { name: "Cittie of Yorke", coords: [51.5184589, -0.1149756] },
  { name: "Ye Olde Cheshire Cheese", coords: [51.5143141, -0.1093527] },
  { name: "Cittie of Yorke", coords: [51.5184589, -0.1149756] },
];

//NOTE:

//reverse order of coordinates for mapbox API format ...

pubs = pubs.map((pub) => {
  return {
    ...pub,
    coords: [pub.coords[1], pub.coords[0]],
  };
});

export { pubs };
