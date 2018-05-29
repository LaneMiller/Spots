document.addEventListener("DOMContentLoaded", function(event) {

const myLocButton = document.getElementById('my-location-button')

let myLat
let myLon
let origins = {}

myLocButton.addEventListener('click', (e)=>{
  // get lat and lon of user
  navigator.geolocation.getCurrentPosition((position) => {
    myLat = position.coords.latitude
    myLon = position.coords.longitude
    origins.myLoc = [myLat,myLon]
    placePin(origins.myLoc, "<button>beep</button>")
    mymap.setView([position.coords.latitude, position.coords.longitude], 15); })

})

function placePin(coordsArray, popuptext) {
  let newMarker = new L.marker(coordsArray, title = 'Hello').addTo(mymap);
  newMarker.bindPopup(`${popuptext}`).openPopup();
}


var mymap = L.map('mapid').setView([40.704769000000006, -74.0132667], 15);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(mymap);
})
