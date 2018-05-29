document.addEventListener("DOMContentLoaded", function(event) {

const myLocButton = document.getElementById('my-location-button')
const myAddressSearchBox = document.getElementById('primary-input')

let myLat
let myLon
let origins = {}
var markers = new L.featureGroup([]);


myLocButton.addEventListener('click', (e)=>{
  // get lat and lon of user
  navigator.geolocation.getCurrentPosition((position) => {
    myLat = position.coords.latitude
    myLon = position.coords.longitude
    origins.myLoc = [myLat,myLon]
    placePin(origins.myLoc, "<button>beep</button>")
    mymap.setView([position.coords.latitude, position.coords.longitude], 15); })

})

myAddressSearchBox.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    const addressQuery = e.target.value
    const myMapBoundries = mymap.getBounds()
     const uri = `https://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=${encodeURIComponent(addressQuery)}&countrycodes=us&viewbox=${mymap.getBounds()._northEast.lat},${mymap.getBounds()._northEast.lng},${mymap.getBounds()._southWest.lat},${mymap.getBounds()._southWest.lng}&format=json&limit=1`

     fetch(uri).then(json=>json.json()).then(json=>placePin([json[0].lat,json[0].lon], json[0].display_name));

  };
})


function getPlaceFromAddress(addressString) {

}


function placePin(coordsArray, popuptext) {
  console.log(coordsArray, popuptext)
  let newMarker = new L.marker(coordsArray).addTo(mymap);
  newMarker.addTo(markers)
  newMarker.bindPopup(`${popuptext}`);
  mymap.fitBounds(markers.getBounds())
}


var mymap = L.map('mapid').setView([40.704769000000006, -74.0132667], 15);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(mymap);
// L.Control.geocoder().addTo(mymap);
})
