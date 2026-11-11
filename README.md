# Industrial Map – Hong Kong

An interactive map presentation about Hong Kong's industrial areas. It covers industrial zones, Kwun Tong, Multi-storey Industrial Centres (MIC), and data centres. It ends with a 3D view of **iTech Tower 3.1** in Fanling.

🔗 **Live site:** https://thompsonexe.github.io/industrial-map/

## Features

- **Interactive slide map:** each slide moves the map to a new location and topic.
- **Industrial zones layer:** zones are loaded from `website1.geojson` and shown in orange and purple.
- **3D building view (slide 11):** click **🧊 View in 3D** to open a 3D model of iTech Tower 3.1 and the buildings around it.
  - Drag to rotate, scroll to zoom, press **Esc** to close.
  - iTech Tower 3.1 is shown in orange and the other buildings are see-through glass.
  - Labels mark nearby places.

## Project files

```
industrial-map/
├── index.html          Main presentation page
├── style.css           Styles for the main page
├── app.js              Map, slides and zone loading
├── itech3d.html        3D view of iTech Tower 3.1 (Three.js)
├── buildings.glb       3D building models
├── website1.geojson    Industrial zone shapes
└── images/             Slide photos
    ├── factory.jpg
    ├── mic.jpg
    ├── kwuntong.jpg
    └── datacentre.jpg
```

## Running it on your computer

The site needs to run through a local server. If you open `index.html` by double-clicking it, the browser blocks the zones and the 3D model from loading.

**Option 1: VS Code**
Install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.

**Option 2: Python**
```
# Windows
py -m http.server 8000

# Mac / Linux
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Editing the 3D view

Labels are set in the `NOTES` list near the top of `itech3d.html`:

```js
{ lat: 22.4921, lon: 114.1387, text: 'Fanling Station', h: 40, color: '#7fd1ff' },
```

| Field   | Meaning                                       |
|---------|-----------------------------------------------|
| `lat`, `lon` | Location (right-click a place in Google Maps to copy these) |
| `text`  | Label text                                    |
| `h`     | Label height in metres                        |
| `color` | Label colour (optional)                       |
| `main`  | `true` gives the label the orange style (optional) |

`MAP_BRIGHTNESS` sets how bright the ground map is. 1 is the normal brightness and higher numbers make it lighter.

## Built with

- [Leaflet](https://leafletjs.com/): 2D map
- [Three.js](https://threejs.org/): 3D view
- [Esri Canvas basemaps](https://www.esri.com/): map tiles

## Credits and data

- Map tiles © Esri, HERE, Garmin
- Map data and buildings © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
- iTech Tower 3.1 acquisition information: *(check website)*
- Photos: *(check website)*

## Author

Made by **thompson sit** for Presentation at Pruden, 2026.