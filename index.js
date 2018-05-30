document.addEventListener("DOMContentLoaded", function(event) {

const myLocButton = document.getElementById('my-location-button')
const myAddressSearchBox = document.getElementById('primary-input')


let myLat
let myLon
let origins = []
var markers = new L.featureGroup([]);

//Gets current location of user by Lat and Lon
myLocButton.addEventListener('click', (e)=>{
  navigator.geolocation.getCurrentPosition((position) => {
    myLat = position.coords.latitude
    myLon = position.coords.longitude
    origins.push( [myLat,myLon] )
    placePin([myLat,myLon], "<button>beep</button>")
    mymap.setView([myLat, myLon], 15); })

})

//adds address and area search functionality and sets map bounds to show all current markers
myAddressSearchBox.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    const addressQuery = e.target.value
    const myMapBoundries = mymap.getBounds() // is this line necessary? <!>
    const uri = `https://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=${encodeURIComponent(addressQuery)}&countrycodes=us&viewbox=${mymap.getBounds()._northEast.lat},${mymap.getBounds()._northEast.lng},${mymap.getBounds()._southWest.lat},${mymap.getBounds()._southWest.lng}&format=json&limit=1`

    fetch(uri).then(json=>json.json()).then(json=>placePin([json[0].lat, json[0].lon], json[0].address.postcode)).then(e.target.value = '').catch(alert("not found"))

  };
})


function getPlaceFromAddress(addressString) {
  //What are we doing here?
}

//Places pin/marker on map for given coords
function placePin(coordsArray, postcode) {
  // coordsArray = [json[0].lat, json[0].lon]

  if (postcode) {
    popuptext = postcode
  } else {
    popuptext = "My Location"
  }
  debugger
  let newMarker = new L.marker(coordsArray).addTo(mymap);
  newMarker.addTo(markers)
  newMarker.bindPopup(`${popuptext}`);
  mymap.fitBounds(markers.getBounds())
  addOriginIcon(json, newMarker)
}

function addOriginIcon(json, marker) {
  const newOriginPoint = document.createElement('div')
  const originPointsContainer = document.getElementById('origin-points-icons')
  newOriginPoint.setAttribute('id',`originMarker-${marker._leaflet_id}`)
  newOriginPoint.innerHTML = `<p>${json[0].address.postcode}</p>`
  originPointsContainer.append(newOriginPoint)

  newOriginPoint.addEventListener('click', (e)=>{
    markers.removeLayer(marker)
    marker.remove()
    newOriginPoint.remove()
  })
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
