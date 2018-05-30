const coordinates = [[40.709272, -74.011288], [40.707970, -74.013777], [40.707027, -74.010901], [40.709532, -74.014614], [40.705742, -74.017768]]

const lats = coordinates.map(coord => coord[0])
const lons = coordinates.map(coord => coord[1])

function findAverage(array) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue
  return array.reduce(reducer) / array.length
}

console.log([findAverage(lats), findAverage(lons)])
