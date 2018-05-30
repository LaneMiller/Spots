const coordinates = []



function findAverage(coordinates) {
  const lats = coordinates.map(coord => coord[0])
  const lons = coordinates.map(coord => coord[1])

  const reducer = (accumulator, currentValue) => accumulator + currentValue
  const newLat = lats.reduce(reducer) / lats.length
  const newLon = lons.reduce(reducer) / lons.length
  return [newLat, newLon]
}

console.log([findAverage(lats), findAverage(lons)])
