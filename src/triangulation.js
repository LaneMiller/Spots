const coordinates = [[40.709272, -74.011288], [40.707970, -74.013777], [40.707027, -74.010901], [40.709532, -74.014614], [40.705742, -74.017768]]



function findAverage(coordinates) {
  const lats = coordinates.map(coord => coord[0])
  const lons = coordinates.map(coord => coord[1])

  const reducer = (accumulator, currentValue) => accumulator + currentValue
  const newLat = lats.reduce(reducer) / lats.length
  const newLon = lons.reduce(reducer) / lons.length
  return [newLat, newLon]
}

console.log([findAverage(lats), findAverage(lons)])
