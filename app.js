/* app.js */

// DOM elements
const latSpan = document.querySelector('.lat') // Latitude
const lonSpan = document.querySelector('.lon') // Longitude
const altSpan = document.querySelector('.alt') // Altitude
const velSpan = document.querySelector('.vel') // Velocity
const issInfo = document.querySelectorAll('span')
const mapOptions = document.querySelectorAll('.map-options > * button')
const unitOptions = document.querySelectorAll('.unit-options > * button')

// Global variables
const issData = 'https://api.wheretheiss.at/v1/satellites/25544'
const initialTiles = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
const attribution = 'Map data &copy; Google'
const iconOptions = {
  iconUrl: './assets/iss_dark.png',
  iconSize: [100, 70],
  iconAnchor: [50, 35],
}

let initialLoad = true
let unit = 'miles'
let alt, lat, lon, map, marker, tiles, vel

// Functions
const createMap = () => {
  // Creates a map with tiles from Google and marker with ISS image

  // Tiles
  map = L.map('map').setView([0, 0], 1)
  tiles = L.tileLayer(initialTiles, { attribution })
  tiles.addTo(map)

  // Marker
  const issIcon = L.icon({ ...iconOptions })
  marker = L.marker([0, 0], { icon: issIcon }).addTo(map)
}

const fetchIss = async () => {
  // Fetches ISS data

  try {
    const response = await fetch(issData)
    const data = await response.json()
    return data
  } catch (err) {
    console.error(err)
  }
}

const refreshInfo = async () => {
  // Updates the global variables with new data

  try {
    const { altitude, latitude, longitude, velocity } = await fetchIss()

    lat = latitude
    lon = longitude
    alt = altitude
    vel = velocity

    marker.setLatLng([lat, lon]) // Sets marker coordinates
    refreshDom()
    checkInitialLoad()
  } catch (err) {
    console.error(err)
    issInfo.forEach((item) => (item.textContent = 'not available'))
  }
}

const refreshDom = () => {
  // Updates the DOM elements

  // Altitude is given in KILOMETERS
  // Velocity is given in KILOMETERS PER HOUR

  const KILOMETER_TO_MILE = 0.621371
  const HOUR_TO_SECOND = 0.000277778

  latSpan.textContent = `${lat.toFixed(2)}°`
  lonSpan.textContent = `${lon.toFixed(2)}°`

  // prettier-ignore
  switch (unit) {
    case 'miles':
      altSpan.textContent = (alt * KILOMETER_TO_MILE).toFixed(2) + ' miles'
      velSpan.textContent = (vel * KILOMETER_TO_MILE * HOUR_TO_SECOND).toFixed(2) + ' miles/s'
      break

    case 'kilometers':
      altSpan.textContent = alt.toFixed(2) + ' km'
      velSpan.textContent = (vel * HOUR_TO_SECOND).toFixed(2) + ' km/s'
      break
  }
}

const checkInitialLoad = () => {
  // Sets map location to match the ISS location when the app starts

  if (!initialLoad) return

  map.setView([lat, lon], 3)
  initialLoad = false
}

const changeMap = (e) => {
  // Changes the map tiles and marker based in the selected style

  const button = e.target
  const mapStyle = button.dataset.map
  const iconTheme = mapStyle === 'm' ? 'dark' : 'light'

  // Layer cleanup (map and marker)
  tiles.remove()
  marker.remove()

  // New tiles and marker
  const tileUrl = `https://mt1.google.com/vt/lyrs=${mapStyle}&x={x}&y={y}&z={z}`
  const issIcon = L.icon({
    ...iconOptions,
    iconUrl: `./assets/iss_${iconTheme}.png`,
  })

  tiles = L.tileLayer(tileUrl, { attribution }).addTo(map)
  marker = L.marker([lat, lon], { icon: issIcon }).addTo(map)

  // Highlights the active button
  mapOptions.forEach((button) => button.classList.remove('active'))
  button.classList.add('active')
}

const changeUnit = (e) => {
  // Changes between miles and kilometers

  const button = e.target
  unit = button.dataset.unit

  refreshDom()

  // Highlights the active button
  unitOptions.forEach((button) => button.classList.remove('active'))
  button.classList.add('active')
}

const init = () => {
  // Initiates the application

  createMap()

  setInterval(refreshInfo, 1000) // Updates data every second
}

// Event listeners
mapOptions.forEach((button) => button.addEventListener('click', (e) => changeMap(e)))

unitOptions.forEach((button) => button.addEventListener('click', (e) => changeUnit(e)))

document.addEventListener('DOMContentLoaded', () => init())
