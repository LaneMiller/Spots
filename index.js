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
    placePin([myLat,myLon])
    mymap.setView([myLat, myLon], 15); })

})

//adds address and area search functionality and sets map bounds to show all current markers
myAddressSearchBox.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter'){
    const addressQuery = e.target.value
    const myMapBoundries = mymap.getBounds() // is this line necessary? <!>
    const uri = `https://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=${encodeURIComponent(addressQuery)}&countrycodes=us&viewbox=${mymap.getBounds()._northEast.lat},${mymap.getBounds()._northEast.lng},${mymap.getBounds()._southWest.lat},${mymap.getBounds()._southWest.lng}&format=json&limit=1`

    fetch(uri).then(json=>json.json()).then(json=>placePin([json[0].lat, json[0].lon], json[0].address.postcode)).then(e.target.value = '')

  };
})


function getPlaceFromAddress(addressString) {
  //What are we doing here?
}

//Places pin/marker on map for given coords, passes popuptext to addOriginIcon()
function placePin(coordsArray, spotText) {
  if (spotText) {
    popuptext = spotText
  } else {
    popuptext = "MyLocation"
  }

  let newMarker = new L.marker(coordsArray).addTo(mymap);
  newMarker.addTo(markers)
  newMarker.bindPopup(`${popuptext}`);
  mymap.fitBounds(markers.getBounds())
  addOriginIcon(popuptext, newMarker)
}

//Creates div and "Spot" icon for given user input
function addOriginIcon(popuptext, marker) {
  const newOriginPoint = document.createElement('div')
  const originPointsContainer = document.getElementById('origin-points-icons')
  newOriginPoint.setAttribute('id',`originMarker-${marker._leaflet_id}`)
  newOriginPoint.innerHTML = `<p>${popuptext}</p>`
  originPointsContainer.append(newOriginPoint)

  newOriginPoint.addEventListener('click', (e)=>{
    markers.removeLayer(marker);
    marker.remove();
    newOriginPoint.remove();
  })
}



// Sets up map field
var mymap = L.map('mapid').setView([40.704769000000006, -74.0132667], 15);

L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${mapboxAPI}`, {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
    '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  id: 'mapbox.streets'
}).addTo(mymap);
// L.Control.geocoder().addTo(mymap);

///////////////////////////////////////////////////////////////
// tesing backend
  const categoryDiv = document.getElementById('category');

  function fetchCategory() {
    fetchOperations.fetchCategories().then(displayCategories);
  }

  function displayCategories(categories) {
    categories.forEach(category => {categoryDiv.innerHTML += addCategoryHTML(category)});
  }

  function addCategoryHTML(category) {
    return `<button data-id='${category.id}'>${category.name}</button>`;
  }

  function addCategoryListener() {
    categoryDiv.addEventListener('click', buttonHandler);
  }

  const testPoint = [40.706865, -74.011318];

  function buttonHandler(event) {
    if (event.target.tagName === 'BUTTON') {
      const categories = fetchOperations.fetchCategory(event.target.dataset.id).then(data => {
        const shortest = shortestDistance(data.locations, testPoint);
        fetchOperations.fetchLocation(shortest[1].id).then(data => {categoryDiv.innerHTML += addShortestHTML(data)})

        function addShortestHTML(data) {
          return `<h3>Nearest location: ${data.name}, Distance: ${shortest[0]}</h3>`
        }
      });
    }
  }

  fetchCategory();
  addCategoryListener();
})

function shortestDistance(locations, testPoint) {
  const array  = locations.map(location => distanceCalc(parseFloat(location.x_lon), testPoint[0], parseFloat(location.y_lat), testPoint[1]))
  const  shortest =  [...array].sort()[0];
  return [shortest, locations[array.indexOf(shortest)]];
}

function distanceCalc(x1, x2, y1, y2) {
  return Math.sqrt((x2 - x1)**2 +  (y2 - y1)**2);
}

const fetchOperations = {
  locationUrl: "http://localhost:3000/api/v1/locations/",
  categoryUrl: "http://localhost:3000/api/v1/categories/",
  parseJson: function(response) {
    return response.json();
  },
  fetchCategories: function() {
    return fetch(this.categoryUrl).then(this.parseJson);
  },
  fetchCategory: function(id) {
    return fetch(`${this.categoryUrl}/${id}`).then(this.parseJson);
  },
  fetchLocations: function() {
    return fetch(this.locationUrl).then(this.parseJson);
  },
  fetchLocation: function(id) {
    return fetch(`${this.locationUrl}/${id}`).then(this.parseJson);
  }
  /*
  headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
  generateConfig: function(method,body) {
    return {
      method: method,
      headers: this.headers
      body: JSON.stringify(body)
    }
  }
  */
}
