<div align="center">

# 🏭 Industrial Buildings in Hong Kong
### Does Supply & Demand Still Work?

An interactive map presentation on why manufacturing left Hong Kong, how much industrial space is left, who still wants it, and whether converting industrial buildings is worth it.

**[▶ View the live presentation](https://thompsonexe.github.io/industrial-map/)**

![Leaflet](https://img.shields.io/badge/Leaflet-2D%20map-199900?logo=leaflet&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-3D%20view-000000?logo=threedotjs&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222222?logo=githubpages&logoColor=white)

</div>

---

## 📑 Contents

- [About](#-about)
- [Presentation outline](#-presentation-outline)
- [Features](#-features)
- [Controls](#-controls)
- [Project files](#-project-files)
- [Running it locally](#-running-it-locally)
- [Editing the 3D view](#-editing-the-3d-view)
- [Making the 3D buildings](#-making-the-3d-buildings)
- [Built with](#-built-with)
- [Sources and credits](#-sources-and-credits)

---

## 📖 About

Hong Kong still has industrial land and buildings, but manufacturing has mostly moved out. This presentation follows a map of Hong Kong's **Outline Zoning Plan (OZP) industrial zones** and asks one question: **does the normal supply and demand model still work for industrial buildings?**

> **Short answer:** not really. There's very little industrial land, but there's still more floor space than people want. Prices fell about 29% in two years, and converting buildings often doesn't pay. Instead, industrial space is slowly turning into **logistics, data and tech** space.

---

## 🗂 Presentation outline

| # | Section | What it covers |
|---|---------|----------------|
| 1 | **Why manufacturing left** | Cheaper land and labour in the Greater Bay Area, economies of scale, supply chains |
| 1 | **Case study: MiC** | Modular Integrated Construction: modules are built in Huizhou, shipped to Hong Kong, and only assembled here |
| 2 | **Supply: zoned land** | How much land is zoned I, I(D) and OU(Business), measured from Planning Department GIS data |
| 2 | **Supply: Kowloon East** | Kwun Tong, Kowloon Bay and San Po Kong were rezoned to OU(Business) |
| 2 | **Supply: floor space** | 7.6% vacancy, 1.23M m² empty, more new supply coming in 2026–27 |
| 3 | **Demand** | Prices −29% in two years, rents only slightly lower, negative take-up |
| 4 | **Conversion: land premium** | 2026 standard premium rates by region |
| 4 | **Conversion calculator** | Interactive calculator for an estimated premium |
| 4 | **Is it worth it?** | Office glut (17.6% vacancy), fragmented ownership, 80% forced-sale rule |
| 5 | **Counterpoint** | Data centres, cold storage, logistics and the Northern Metropolis, plus the **3D view** |
| ✔ | **Conclusion** | Traditional supply and demand for factories no longer works |

---

## ✨ Features

- 🗺 **Slide-driven map:** each slide moves the map to a new place and topic.
- 🟧 **Industrial zones layer:** I, I(D) and OU(Business) zones are loaded from `website1.geojson`. Click any zone to see its details.
- 📐 **Live land area stats:** zone areas are calculated from GIS shapes on the ellipsoid.
- 🧮 **Land premium calculator:** pick a region, a new use, the floor area and the extra floor area allowed, and it estimates the premium:

  ```
  Premium = After rate × After floor area − Before rate × Before floor area
  ```

- 🧊 **3D data centre view:** a Three.js model of **iTech Tower 3.1** in Fanling and the buildings around it.
  - iTech Tower 3.1 is orange and the other buildings are see-through glass.
  - Labels mark nearby places.

---

## 🎮 Controls

| Action | How |
|--------|-----|
| Next / previous slide | <kbd>→</kbd> / <kbd>←</kbd> or the on-screen arrows |
| Zone details | Click a zone on the map |
| Open 3D view | **View Data Centre in 3D** on the Counterpoint slide |
| Rotate / zoom (3D) | Drag / scroll |
| Close 3D view | <kbd>Esc</kbd> or **✕ Close 3D** |

---

## 📁 Project files

```
industrial-map/
├── index.html            Main presentation page
├── style.css             Styles for the main page
├── Script.txt            What I'll say in the Presentation
├── app.js                Map, slides, zones and calculator
├── itech3d.html          3D view of iTech Tower 3.1 (Three.js)
├── buildings.glb         3D building models used by itech3d.html
├── website1.geojson      Industrial zone shapes
├── README.md             This file
├── images/               Slide photos
│   ├── factory.jpg
│   ├── mic.jpg
│   ├── kwuntong.jpg
│   └── datacentre.jpg
└── MakeGLBwCoords/       Tool for building the 3D models
    ├── makeglb.html      Turns coordinates into .json, then .json into .glb
    ├── testindex.html    Test page for checking a .glb file
    ├── buildings.json    Building data (coordinates and heights)
    └── buildings.glb     Output model
```

---

## 💻 Running it locally

The site needs a local server. If you open `index.html` by double-clicking it, the browser blocks the zones and the 3D model from loading.

**Option 1: VS Code**
Install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.

**Option 2: Python**

```bash
# Windows
py -m http.server 8000

# Mac / Linux
python3 -m http.server 8000
```

Then open **http://localhost:8000**.

---

## 🛠 Editing the 3D view

Labels are set in the `NOTES` list near the top of `itech3d.html`:

```js
{ lat: 22.4921, lon: 114.1387, text: 'Fanling Station', h: 40, color: '#7fd1ff' },
```

| Field | Meaning |
|-------|---------|
| `lat`, `lon` | Location. Right-click a place in Google Maps to copy them. |
| `text` | Label text |
| `h` | Label height in metres |
| `color` | Label colour *(optional)* |
| `main` | `true` gives the label the orange style *(optional)* |

`MAP_BRIGHTNESS` sets how bright the ground map is. `1` is normal brightness and higher numbers make it lighter.

---

## 🏗 Making the 3D buildings

The `MakeGLBwCoords` folder holds the tool that makes `buildings.glb`.

1. Start a local server and open `MakeGLBwCoords/makeglb.html`.
2. Enter the building coordinates to create `buildings.json`.
3. Convert `buildings.json` into `buildings.glb`.
4. Open `testindex.html` to check the model looks right.
5. Copy the new `buildings.glb` into the main folder so `itech3d.html` uses it.

---

## 🧰 Built with

- **[Leaflet](https://leafletjs.com/):** interactive 2D map
- **[Three.js](https://threejs.org/):** 3D data centre view
- **[Esri](https://www.esri.com/) Canvas basemaps:** map tiles
- **GitHub Pages:** hosting

---

## 📚 Sources and credits

### Data
- **Rating and Valuation Department:** *Hong Kong Property Review 2026* (vacancy, supply, prices, rents, take-up)
- **Planning Department:** Outline Zoning Plan GIS data (industrial zone areas)
- **Lands Department:** standard land premium rates for redeveloping industrial buildings (from 1 April 2026)
- **Mingtiandi:** Amazon Data Services' purchase of iTech Tower 3.1 & 3.2

See the **Sources** slide on the [live site](https://thompsonexe.github.io/industrial-map/) for the full list.

### Photos
| Slide | Credit |
|-------|--------|
| Why manufacturing left | Marcus Wong / flickr.com |
| MiC case study | @pt_group_official / Instagram |
| Kowloon East | CUHK / [chinaculturalgeog.com](https://chinaculturalgeog.com/article_info.php?aid=199&id=56&main=56/) |
| Data centres | Christopher Caillavet / Mingtiandi |

### Maps
- Map tiles © Esri, HERE, Garmin
- Map data and buildings © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under the [Open Database License](https://opendatacommons.org/licenses/odbl/)

> Made for a school presentation. Map locations are approximate, and figures come from the sources above.

---

<div align="center">

Made by **Thompson Sit** for a presentation at **Pruden**, 2026

</div>