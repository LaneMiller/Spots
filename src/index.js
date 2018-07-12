document.addEventListener("DOMContentLoaded", function(event) {

  //// variable declarations
  const myLocButton = document.getElementById('my-location-button');
  const myAddressSearchBox = document.getElementById('primary-input');
  let averagePin;
  let originPins = []
  let markers = new L.featureGroup([]);

  let myLat
  let myLon
  let origins = {}
  let previous_destination

  const IconOrigin = L.Icon.extend({
    options: {
    iconUrl: 'img/orig_1.png',
    iconSize:     [44, 50], // size of the icon
    iconAnchor:   [22, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -45] // point from which the popup should open relative to the iconAnchor
  }});

  const origin1 = new IconOrigin({iconUrl: 'img/orig_1.png'}),
      origin2 = new IconOrigin({iconUrl: 'img/orig_2.png'}),
      origin3 = new IconOrigin({iconUrl: 'img/orig_3.png'}),
      origin4 = new IconOrigin({iconUrl: 'img/orig_4.png'}),
      origin5 = new IconOrigin({iconUrl: 'img/orig_5.png'}),
      origin6 = new IconOrigin({iconUrl: 'img/orig_6.png'}),
      originX = new IconOrigin({iconUrl: 'img/orig_x.png'}),
      dest = new IconOrigin({iconUrl: 'img/dest.png', iconSize: [75,75], iconAnchor: [37, 70], popupAnchor:  [0, -70]}),
      avg = new IconOrigin({iconUrl: 'img/avg.png', iconSize: [40,40], iconAnchor: [22, 48], popupAnchor:  [0, -45]});



  //Gets current location of user by Lat and Lon
  myLocButton.addEventListener('click', (e)=>{
    navigator.geolocation.getCurrentPosition((position) => {
      myLat = position.coords.latitude
      myLon = position.coords.longitude
      placePin([myLat,myLon])
    })
  })

  //adds address and area search functionality and sets map bounds to show all current markers
  myAddressSearchBox.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter'){
      const addressQuery = e.target.value
      const uri = `https://nominatim.openstreetmap.org/?format=json&addressdetails=1&q=${encodeURIComponent(addressQuery)}&countrycodes=us&viewbox=${mymap.getBounds()._northEast.lat},${mymap.getBounds()._northEast.lng},${mymap.getBounds()._southWest.lat},${mymap.getBounds()._southWest.lng}&format=json&limit=1`
      fetch(uri).then(json=>json.json()).then(json => {
        if (json.length === 0) {
          alert("Please enter a valid address");
        } else {
          placePin([parseFloat(json[0].lat), parseFloat(json[0].lon)], addressQuery)
        }
      }).then(e.target.value = '')
    };
  })


  //Places pin/marker on map for given coords, passes popuptext to addOriginIcon()
  function placePin(coordsArray, address) {
    let popuptext;
    if (address) {
      popuptext = address
    } else {
      popuptext = "My Location"
    }

    if (!origins[popuptext]) {
      let newMarker;
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
      originPins.push(newMarker)
      mymap.fitBounds(markers.getBounds())
      addOriginIcon(popuptext, newMarker)
      origins[popuptext] = coordsArray
      findAverage(origins)
    }
  }

  // places 'THE SPOT' pin
  function placeDestPin(coordsArray, popuptext){
      if (previous_destination){
        previous_destination.remove()
      }
      let newMarker = new L.marker(coordsArray, {icon: dest}).addTo(mymap)
      newMarker.bindPopup(`${popuptext}`).openPopup();
      previous_destination = newMarker
      findAverage(origins)
  }

  //Creates div and "Origin" icon for given user input
  function addOriginIcon(popuptext, marker) {
    const newOriginPoint = document.createElement('div')
    const originPointsContainer = document.getElementById('origin-points-icons')
    newOriginPoint.setAttribute('id',`originMarker-${marker._leaflet_id}`)
    newOriginPoint.innerHTML = `<p>${popuptext}</p>`
    originPointsContainer.append(newOriginPoint)

    newOriginPoint.addEventListener('mouseover', function(e) {
      // newOriginPoint.innerHTML += `<style>#origin-points-icons > div {background-image: url(https://vignette.wikia.nocookie.net/creation/images/7/7e/Red_x.png/revision/latest?cb=20160323201834)}</style>`
    })

    deleteOriginIcon(newOriginPoint, marker)
  }

  function deleteOriginIcon(OriginIcon, marker) {
    OriginIcon.addEventListener('click', (e)=>{
      delete origins[marker._popup._content]
      markers.removeLayer(marker);
      marker.remove();
      let i = 1;
      for (let key in markers._layers) {
        if (i < 7) {
          markers._layers[key]._icon.src = `img/orig_${i}.png`
        }
        else {
          markers._layers[key]._icon.src = `img/orig_x.png`
        }
        i++
      }
      OriginIcon.remove();
      findAverage(origins)
    })


  }

  // calculates average point of all origins and places a pin
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
      averagePin = new L.marker([newLat, newLon], {icon: avg}).addTo(mymap);
      averagePin.bindPopup(`Average Point`);
    }
  }
    else if (averagePin) {
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

  ///////////////////////////////////////////////////////////////
  // backend
    const categoryDiv = document.getElementById('category');

    function fetchCategory() {
      fetchOperations.fetchCategories().then(displayCategories);
    }

    function displayCategories(categories) {
      categories.forEach(category => {categoryDiv.innerHTML += addCategoryHTML(category)});
      const addNewDestCat = document.createElement('button')
      addNewDestCat.setAttribute('id', 'addNewDestCatButton')
      addNewDestCat.innerHTML = '+'
      categoryDiv.append(addNewDestCat)
    }

    function addCategoryHTML(category) {
      return `<button data-id='${category.id}'>${category.name}</button>`;
    }

    function addCategoryListener() {
      categoryDiv.addEventListener('click', buttonHandler);
    }

    function buttonHandler(event) {
      if (event.target.tagName === 'BUTTON' && averagePin && event.target.id !== 'addNewDestCatButton') {
        const avgPoint = [averagePin._latlng.lat, averagePin._latlng.lng];
        const categories = fetchOperations.fetchCategory(event.target.dataset.id).then(data => {
          const shortest = shortestDistance(data.locations, avgPoint);
          fetchOperations.fetchLocation(shortest[1].id).then(data => { placeDestPin([parseFloat(data.x_lon), parseFloat(data.y_lat)], data.name)})
          //categoryDiv.innerHTML += addShortestHTML(data)

          function addShortestHTML(data) {
            return `<h3>Nearest location: ${data.name}, Distance: ${shortest[0]}</h3>`
          }
        });
      } else if (event.target.id === 'addNewDestCatButton'){
        document.getElementById("crud-form").style.display = "block";
        fetchCategoriesForSelect();
        buildNewDestForm()
      }
    }

    function buildNewDestForm() {
      const newLocationTextField = document.getElementById('newDestForm')
      newLocationTextField.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter') {
          e.preventDefault()
          const newDestQuery = e.target.value
          const newDestCat = e.target.previousElementSibling.value
          fetch(`http://localhost:3000/api/v1/search/${newDestQuery}`).then(json=>json.json()).then(json=>buildGoogleDestList(json, newDestCat) )
        }

      })

      const cancelButton = document.createElement('button')
      cancelButton.setAttribute('id','submit')
      cancelButton.innerHTML = 'Cancel'
      cancelButton.addEventListener('click', (e)=>{
        document.getElementById("crud-form").style.display = "none";
        document.getElementById("newDestInputField").value = '';
        document.getElementById('crud-results').innerHTML = '';
        cancelButton.remove()
      })
      const overlayDiv = document.getElementById('crud-form')
      overlayDiv.append(cancelButton)
    }

    function buildGoogleDestList(listOfDests, selectedCategory) {
      const destListResults = document.getElementById('crud-results')

      for (const dest of listOfDests.results){
        const newListResultItem = document.createElement('button')
        newListResultItem.setAttribute('id', `googlePlace-${dest.place_id}`)
        newListResultItem.setAttribute('data-name', `${dest.name},${dest.geometry.location.lat},${dest.geometry.location.lng}`)
        const newListResultItemName = document.createElement('p')
        if (dest.rating){
          newListResultItemName.innerHTML = dest.name +' - '+ dest.rating
        }else{
          newListResultItemName.innerHTML = dest.name
        }
        const newListResultItemAddress = document.createElement('p')
        newListResultItemAddress.innerHTML = dest.formatted_address
        newListResultItem.append(newListResultItemName, newListResultItemAddress)

        newListResultItem.addEventListener('click', (e)=>{
          e.preventDefault()

          const selectedDestData = e.currentTarget.getAttribute('data-name').split(',')
          let locName = selectedDestData[0];
          let locLat = selectedDestData[1];
          let locLon = selectedDestData[2];

          fetchOperations.fetchLocationCreate({name: locName, x_lon: locLat, y_lat: locLon, categories: [selectedCategory]}).then( (res) => {
             document.getElementById("crud-form").style.display = "none";
             document.getElementById("newDestInputField").value = '';
             document.getElementById('crud-results').innerHTML = '';
             const cancelButton = document.getElementById('submit')
             cancelButton.remove()
             alert("Location Added!");
             console.log(res);
           })

        })
        if (destListResults.childElementCount < 5){
          destListResults.append(newListResultItem)}
        if (destListResults.childElementCount >= 5){
          console.log(destListResults.childElementCount)
          break
        }
      }

    }
//
// t.string "name"
// t.decimal "x_lon"
// t.decimal "y_lat"
// t.string "street"
// t.string "city"
// t.string "state"
// t.string "zip"


    function shortestDistance(locations, avgPoint) {
      const array  = locations.map(location => distanceCalc(parseFloat(location.x_lon), avgPoint[0], parseFloat(location.y_lat), avgPoint[1]))
      const  shortest =  [...array].sort()[0];
      return [shortest, locations[array.indexOf(shortest)]];
    }

    function distanceCalc(x1, x2, y1, y2) {
      return Math.sqrt((x2 - x1)**2 +  (y2 - y1)**2);
    }

    // for adding a new destination category button
    const select = document.getElementById("crud-category-selector");

    // fetch all existing categories from database and add to dropdown select
    function fetchCategoriesForSelect() {
      fetchOperations.fetchCategories().then(forEachCategory);
    }

    function forEachCategory(categories) {
      if (!select.children.length) {
        categories.forEach(addOptionToSelect)
      }
    }

    function addOptionToSelect(category) {
      const option = document.createElement('option');
      option.text = category.name
      select.add(option)
    }

    // turn on overlay once the page is load
    (function on() {
        document.getElementById("overlay").style.display = "block";
    })();

    // turn off overlay on click
    document.getElementById("overlay").addEventListener('click', function(event) {
      event.currentTarget.style.display = "none";
    })

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
  },
  fetchLocationCreate: function(bodyParams){
    const config = {method: 'POST',
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify(bodyParams)}
    return fetch(this.locationUrl, config).then(this.parseJson);
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
