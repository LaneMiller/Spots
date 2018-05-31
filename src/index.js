document.addEventListener("DOMContentLoaded", function(event) {
  const myLocButton = document.getElementById('my-location-button');
  const myAddressSearchBox = document.getElementById('primary-input');
  let averagePin;
  let markers = new L.featureGroup([]);

  var IconOrigin = L.Icon.extend({
    options: {
    iconUrl: 'img/orig_1.png',
    // shadowUrl: 'leaf-shadow.png',

    iconSize:     [44, 50], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 48], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [0, -45] // point from which the popup should open relative to the iconAnchor
}});

var origin1 = new IconOrigin({iconUrl: 'img/orig_1.png'}),
    origin2 = new IconOrigin({iconUrl: 'img/orig_2.png'}),
    origin3 = new IconOrigin({iconUrl: 'img/orig_3.png'});
    origin4 = new IconOrigin({iconUrl: 'img/orig_4.png'});
    origin5 = new IconOrigin({iconUrl: 'img/orig_5.png'});
    origin6 = new IconOrigin({iconUrl: 'img/orig_6.png'});
    originX = new IconOrigin({iconUrl: 'img/orig_x.png'});
    dest = new IconOrigin({iconUrl: 'img/dest.png', iconSize: [75,75], iconAnchor: [37, 70], popupAnchor:  [0, -70]});

  let myLat
  let myLon
  let origins = {}
  let previous_destination

  //Gets current location of user by Lat and Lon
  myLocButton.addEventListener('click', (e)=>{
    navigator.geolocation.getCurrentPosition((position) => {
      myLat = position.coords.latitude
      myLon = position.coords.longitude
      // origins.push( [myLat,myLon] ) this now happens inside of placePin()
      placePin([myLat,myLon])
      // mymap.setView([myLat, myLon], 15);
    })
  })

  //adds address and area search functionality and sets map bounds to show all current markers
  myAddressSearchBox.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      const addressQuery = e.target.value
      // const myMapBoundries = mymap.getBounds() // is this line necessary? <!>
      const uri = `https://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=${encodeURIComponent(addressQuery)}&countrycodes=us&viewbox=${mymap.getBounds()._northEast.lat},${mymap.getBounds()._northEast.lng},${mymap.getBounds()._southWest.lat},${mymap.getBounds()._southWest.lng}&format=json&limit=1`

      fetch(uri).then(json=>json.json()).then(json=>placePin([parseFloat(json[0].lat), parseFloat(json[0].lon)], addressQuery)).then(e.target.value = '')
    };
  })


  function getPlaceFromAddress(addressString) {
    //What are we doing here?
  }

  //Places pin/marker on map for given coords, passes popuptext to addOriginIcon()
  function placePin(coordsArray, address) {
    let popuptext;
    if (address) {
      popuptext = address
    } else {
      popuptext = "MyLocation"
    }

    if (!origins[popuptext]) {
      let newMarker
      switch (Object.keys(origins).length) {
        case 0:
          newMarker = new L.marker(coordsArray, {icon: origin1}).addTo(mymap);
          break;
        case 1:
          newMarker = new L.marker(coordsArray, {icon: origin2}).addTo(mymap);
          break;
        case 2:
          newMarker = new L.marker(coordsArray, {icon: origin3}).addTo(mymap);
          break;
        case 3:
          newMarker = new L.marker(coordsArray, {icon: origin4}).addTo(mymap);
          break;
        case 4:
          newMarker = new L.marker(coordsArray, {icon: origin5}).addTo(mymap);
          break;
        case 5:
          newMarker = new L.marker(coordsArray, {icon: origin6}).addTo(mymap);
          break;
        default:
          newMarker = new L.marker(coordsArray, {icon: originX}).addTo(mymap);
          break;
      }
      newMarker.addTo(markers)
      newMarker.bindPopup(`${popuptext}`);
      mymap.fitBounds(markers.getBounds())
      addOriginIcon(popuptext, newMarker)
      origins[popuptext] = coordsArray
      findAverage(origins)
    }
  }

  function placeDestPin(coordsArray, popuptext){
      if (previous_destination){
        previous_destination.remove()
      }
      let newMarker = new L.marker(coordsArray, {icon: dest}).addTo(mymap)
      newMarker.bindPopup(`${popuptext}`).openPopup();
      previous_destination = newMarker
      findAverage(origins)
  }

  //Creates div and "Spot" icon for given user input
  function addOriginIcon(popuptext, marker) {
    const newOriginPoint = document.createElement('div')
    const originPointsContainer = document.getElementById('origin-points-icons')
    newOriginPoint.setAttribute('id',`originMarker-${marker._leaflet_id}`)
    newOriginPoint.innerHTML = `<p>${popuptext}</p>`
    originPointsContainer.append(newOriginPoint)

    newOriginPoint.addEventListener('click', (e)=>{
      delete origins[marker._popup._content]
      markers.removeLayer(marker);
      marker.remove();
      newOriginPoint.remove();
      findAverage(origins)
    })
  }

  function findAverage(coordinatesObj) {
    if (Object.keys(coordinatesObj).length !== 0) {
      const coordinates = Object.values(coordinatesObj)
      const lats = coordinates.map(coord => coord[0]);
      const lons = coordinates.map(coord => coord[1]);

      const reducer = (accumulator, currentValue) => accumulator + currentValue
      const newLat = lats.reduce(reducer) / lats.length
      const newLon = lons.reduce(reducer) / lons.length


      if (averagePin) {
        averagePin.remove()
      }

      if (Object.keys(origins).length > 1){
      averagePin = new L.marker([newLat, newLon]).addTo(mymap);
      averagePin.bindPopup(`Average Point`);
    }
  }
    else {
      debugger
      averagePin.remove()
      averagePin = undefined;
    }
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

    function buttonHandler(event) {
      if (event.target.tagName === 'BUTTON' && averagePin) {
        const avgPoint = [averagePin._latlng.lat, averagePin._latlng.lng];
        const categories = fetchOperations.fetchCategory(event.target.dataset.id).then(data => {
          const shortest = shortestDistance(data.locations, avgPoint);
          fetchOperations.fetchLocation(shortest[1].id).then(data => { placeDestPin([parseFloat(data.x_lon), parseFloat(data.y_lat)], data.name)})
          //categoryDiv.innerHTML += addShortestHTML(data)

          function addShortestHTML(data) {
            return `<h3>Nearest location: ${data.name}, Distance: ${shortest[0]}</h3>`
          }
        });
      }
    }

    function shortestDistance(locations, avgPoint) {
      const array  = locations.map(location => distanceCalc(parseFloat(location.x_lon), avgPoint[0], parseFloat(location.y_lat), avgPoint[1]))
      const  shortest =  [...array].sort()[0];
      return [shortest, locations[array.indexOf(shortest)]];
    }

    function distanceCalc(x1, x2, y1, y2) {
      return Math.sqrt((x2 - x1)**2 +  (y2 - y1)**2);
    }

    fetchCategory();
    addCategoryListener();
  }) // End of DOMContentLoaded event


//fetch Adapter
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
