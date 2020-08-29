// use https://docs.mapbox.com/search-playground/ for coordinates
// list : http://breweryhistory.com/wiki/index.php?title=List_of_Samuel_Smith_Old_Brewery_Ltd._pubs#LONDON
// use google maps to verify? - yes it is still better..

let pubs = [
  //

  { name: "Anchor Tap", coords: [-0.07596995334426992, 51.50352133040903] },
  { name: "Anerley Arms", coords: [-0.06612563558496731, 51.412738308366244] },
  {
    name: "Angel at Rotherhithe",
    coords: [-0.05906003801840143, 51.50061614246121],
  },
  {
    name: "Angel at St. Giles",
    coords: [-0.12781053354797223, 51.51547850883347],
  },
  {
    name: "Angel in the Fields",
    coords: [0.15135852649939352, 51.518046764092816],
  },
  { name: "Blue Posts", coords: [-0.13545942532891786, 51.516973176236036] },
  {
    name: "The Bricklayers Arms",
    coords: [-0.21669108467699516, 51.466075477959265],
  },
  {
    name: "The Captain Kidd",
    coords: [-0.05807251024953075, 51.503430193866336],
  },
  { name: "Champion", coords: [-0.13727587051334922, 51.516871727419755] },
  { name: "The Chandos", coords: [-0.12678413515232023, 51.509530002787784] },
  {
    name: "Cittie of Yorke",
    coords: [-0.11279127372790754, 51.518523084613946],
  },
  { name: "Cock Tavern", coords: [-0.14140337006665504, 51.51677666997915] },
  { name: "The Crown", coords: [-0.12638936536700385, 51.51684490338778] },
  {
    name: "The Crown and Sugarloaf",
    coords: [-0.10498661234180418, 51.51408782407938],
  },
  // {name:"Dover Castle", coords:[]},
  { name: "Duke of Argyle", coords: [-0.13479861224345768, 51.51190966927334] },
  { name: "Duke of York", coords: [0.14270100283454212, 51.49665899456858] },
  // {name:"Duke of York", coords:[]},
  { name: "Eagle", coords: [-0.17918800614802421, 51.52549432586207] },
  {
    name: "Earl of Lonsdale",
    coords: [-0.20295765890750772, 51.5135356615682],
  },
  { name: "Fitzroy Tavern", coords: [-0.13461719027088748, 51.51861352695556] },
  // {name:"Freemason's Arms", coords:[]},
  { name: "Gazebo", coords: [-0.30821836439656636, 51.41009692392666] },
  {
    name: "George and Vulture",
    coords: [-0.08580797968090792, 51.5128359161821],
    description: "restaurant not pub",
  },
  {
    name: "Glasshouse Stores",
    coords: [-0.13540464707136834, 51.51152471868613],
  },
  {
    name: "Horse and Groom",
    coords: [-0.14248967882849684, 51.519860026001226],
  },
  { name: "John Snow", coords: [-0.1365868803770809, 51.51329068875771] },
  // {name:"Lord Wolseley", coords:[]},
  { name: "Lyceum Tavern", coords: [-0.11972930560534678, 51.51129329974236] },
  { name: "Ordanance", coords: [-0.17130833499390974, 51.535800699663184] },
  {
    name: "Princess Louise",
    coords: [-0.12158759352587367, 51.51737806936217],
  },
  { name: "Red Lion", coords: [-0.1392039746978071, 51.51265248203478] },
  { name: "Rising Sun", coords: [-0.09986440738498459, 51.51909030985439] },
  { name: "Rose & Crown", coords: [] }, // cant find it?
  { name: "Rose of York", coords: [-0.3004126355887138, 51.450705927207565] },
  { name: "Royal George", coords: [-0.028662909837294137, 51.471948250972304] },
  // {name:"Shades", coords:[]},
  { name: "Town Wharf", coords: [-0.3222232021594209, 51.469176729743566] },
  { name: "White Horse", coords: [-0.13344103057977463, 51.51184645804912] },
  { name: "Windsor Castle", coords: [-0.13791225641887195, 51.49519852574815] },
  {
    name: "Ye Olde Cheshire Cheese",
    coords: [-0.10717814581153107, 51.51446783462424],
  },
  {
    name: "Ye Olde Swiss Cottage",
    coords: [-0.1746888095108261, 51.54296517547806],
  },

  { name: "Yorkshire Grey", coords: [0.14132382207696992, 51.51890455605272] },
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
