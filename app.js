// Global variables
const issData = 'https://api.wheretheiss.at/v1/satellites/25544'
const latSpan = document.querySelector('.lat')
const lonSpan = document.querySelector('.lon')
const stdBtn = document.querySelector('.std')
const terBtn = document.querySelector('.ter')
const satBtn = document.querySelector('.sat')
const hybBtn = document.querySelector('.hyb')
let firstTime = true
let mapType = 'm' // standard roadmap

// Creating a map in Leaflet with the standard roadmap from Google
const myMap = L.map('iss-map').setView([0, 0], 1)
const attribution = 'Map data &copy; Google'
const tileUrl = `https://mt1.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`
const tiles = L.tileLayer(tileUrl, { attribution })
tiles.addTo(myMap)

// Creating a marker with a custom icon
const issIcon = L.icon({
  iconUrl: './images/iss.webp',
  iconSize: [100, 70],
  iconAnchor: [50, 35],
})
const marker = L.marker([0, 0], { icon: issIcon }).addTo(myMap)

async function getData() {
  // Fetching ISS data

  try {
    const response = await fetch(issData)
    const data = await response.json()
    const { latitude, longitude } = data

    // Setting map and marker coordinates
    marker.setLatLng([latitude, longitude])

    if (firstTime) {
      myMap.setView([latitude, longitude], 3)
      firstTime = false
    }

    // Adding lat/lon info to the DOM elements
    latSpan.textContent = `${latitude.toFixed(2)}°`
    lonSpan.textContent = `${longitude.toFixed(2)}°`
  } catch (err) {
    console.error(err)
    latSpan.textContent = 'not available'
    lonSpan.textContent = 'not available'
  }
}

function changeMap(mapType) {
  // Changes the tiles of the map

  const tileUrl = `https://mt1.google.com/vt/lyrs=${mapType}&x={x}&y={y}&z={z}`
  const tiles = L.tileLayer(tileUrl, { attribution })
  tiles.addTo(myMap)
}

// Event listeners
stdBtn.addEventListener('click', () => changeMap('m')) // standard roadmap
terBtn.addEventListener('click', () => changeMap('p')) // terrain
satBtn.addEventListener('click', () => changeMap('s')) // satellite
hybBtn.addEventListener('click', () => changeMap('y')) // hybrid (satellite + roadmap)

// Updating the data every second
setInterval(getData, 1000)
