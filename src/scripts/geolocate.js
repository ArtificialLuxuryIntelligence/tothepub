

export default function geolocate(options = {}) {
  return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}


//standard call for reference: 

// export default function geolocate() {
//   function success(position) {
//     const latitude = position.coords.latitude;
//     const longitude = position.coords.longitude;
//     console.log(latitude, longitude);
//     return  [latitude,longitude]
//   }

//   function error() {
//     console.log("Unable to retrieve your location");
//   }

//   if (!navigator.geolocation) {
//     console.error("geolocation is not supported");
//   } else {
//     console.log("Locating…");
//     navigator.geolocation.getCurrentPosition(success, error);
//   }
// }

//   document.querySelector('#find-me').addEventListener('click', geoFindMe);
