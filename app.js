/* app.js */

// Global variables
const issData = 'https://api.wheretheiss.at/v1/satellites/25544'
const latSpan = document.querySelector('.lat')
const lonSpan = document.querySelector('.lon')
const buttons = document.querySelectorAll('.button')
let initialLoad = true

// Creating a map in Leaflet with the roadmap from Google
const myMap = L.map('iss-map').setView([0, 0], 1)
const attribution = 'Map data &copy; Google'
const tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
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
  // Fetches ISS data

  try {
    const response = await fetch(issData)
    const data = await response.json()
    const { latitude, longitude } = data

    // Sets map and marker coordinates
    marker.setLatLng([latitude, longitude])

    if (initialLoad) {
      myMap.setView([latitude, longitude], 3)
      initialLoad = false
    }

    // Adds lat/lon info to the DOM elements
    latSpan.textContent = `${latitude.toFixed(2)}°`
    lonSpan.textContent = `${longitude.toFixed(2)}°`
  } catch (err) {
    console.error(err)
    latSpan.textContent = 'not available'
    lonSpan.textContent = 'not available'
  }
}

function changeMap(event) {
  // Changes the tiles of the map based on the clicked button

  const button = event.target
  const mapStyle = button.dataset.map
  const tileUrl = `https://mt1.google.com/vt/lyrs=${mapStyle}&x={x}&y={y}&z={z}`
  const tiles = L.tileLayer(tileUrl)
  tiles.addTo(myMap)

  // Highlights the active button
  buttons.forEach((button) => button.classList.remove('active'))
  button.classList.add('active')
}

// Event listeners
buttons.forEach((button) => button.addEventListener('click', (event) => changeMap(event)))

// Updating the data every second
setInterval(getData, 1000)
