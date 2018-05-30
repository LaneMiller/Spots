const coordinates = []

const lats = coordinates.map(coord => coord[0])
const lons = coordinates.map(coord => coord[1])

function findAverage(array) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue
  return array.reduce(reducer) / array.length
}

console.log([findAverage(lats), findAverage(lons)])
