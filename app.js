// ---------- Map ----------
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
const map = L.map('map', {zoomControl:false, preferCanvas:true}).setView([22.35,114.12], 11);
L.control.zoom({position:'topright'}).addTo(map);
L.tileLayer(ESRI+'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
  maxNativeZoom:16, maxZoom:19,
  attribution:'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap contributors | Zones: Planning Department'
}).addTo(map);
map.createPane('labels');
map.getPane('labels').style.zIndex = 450;
map.getPane('labels').style.pointerEvents = 'none';
L.tileLayer(ESRI+'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {pane:'labels', maxNativeZoom:16, maxZoom:19}).addTo(map);

// ---------- Zone classes ----------
const CLASSES = {
  'I':     {name:'Industrial (I)',     color:'#ff7a1a'},
  'I(D)':  {name:'Industrial Group D', color:'#ffd166'},
  'OU(B)': {name:'OU (Business)',      color:'#c084fc'},
  'OS':    {name:'Open Storage (OS)',  color:'#7dd3fc'},
  'other': {name:'Other zones',        color:'#5f6b7a'}
};
const MODES = { ind:['I','I(D)','OU(B)','OS'], oub:['OU(B)'], faint:[] };
const state = { mode:'ind', ozp:false };

function classify(p){
  const g = String(p.ZONE_LABEL_GRP||'').trim().toUpperCase();
  const lab = String(p.ZONE_LABEL||'').trim().toUpperCase();
  const sp = String(p.ZONE_SPUSE_ENG||'').toLowerCase();
  if (g.startsWith('I(D)') || lab.startsWith('I(D)')) return 'I(D)';
  if (g.startsWith('I')) return 'I';
  if (lab.startsWith('OU(B)') || g.startsWith('OU(B)') || (g.startsWith('OU') && sp.includes('business'))) return 'OU(B)';
  if (g === 'OS') return 'OS';
  return 'other';
}

function style(f){
  const p = f.properties, c = p._c, on = MODES[state.mode].includes(c);
  const col = (state.ozp && p.fill_hex) ? p.fill_hex : CLASSES[c].color;
  if (c === 'other') return {stroke:false, fillColor:col, fillOpacity: state.ozp ? 0.25 : 0.07};
  return {color:col, weight:on?0.9:0.3, opacity:on?0.95:0.3, fillColor:col, fillOpacity:on?0.6:0.1};
}

// ---------- Status ----------
const statusEl = document.getElementById('status');
function status(msg, err=false, hideAfter=0){
  statusEl.innerHTML = msg; statusEl.className = err ? 'err' : ''; statusEl.style.display = 'block';
  if (hideAfter) setTimeout(()=>statusEl.style.display='none', hideAfter);
}

// ---------- Load GeoJSON ----------
let zones = null, indBounds = null;
proj4.defs('EPSG:2326','+proj=tmerc +lat_0=22.3121333333333 +lon_0=114.178555555556 +k=1 +x_0=836694.05 +y_0=819069.8 +ellps=intl +towgs84=-162.619,-276.959,-161.764,0.067753,-2.243648,-1.158828,-1.094246 +units=m +no_defs');

if (location.protocol === 'file:') {
  status('Zones can\'t load from a local file. Open the online version: <b>thompsonexe.github.io/industrial-map</b>', true);
} else {
  fetch('website1.geojson')
    .then(r => { if (!r.ok) throw new Error(r.status+' '+r.statusText); return r.json(); })
    .then(init)
    .catch(e => status('Could not load website1.geojson: '+e.message, true));
}

function firstCoord(g){ let c = g.coordinates; while (Array.isArray(c[0])) c = c[0]; return c; }

function init(data){
  const feats = (data.features||[]).filter(f => f.geometry && f.geometry.coordinates);
  if (!feats.length) return status('GeoJSON has no features.', true);

  // Reproject from HK1980 Grid if needed
  const c0 = firstCoord(feats[0].geometry);
  let reproj = false;
  if (/2326/.test(JSON.stringify(data.crs||'')) || Math.abs(c0[0]) > 180) {
    const t = proj4('EPSG:2326','EPSG:4326');
    const rp = c => typeof c[0] === 'number' ? t.forward([c[0], c[1]]) : c.map(rp);
    feats.forEach(f => f.geometry.coordinates = rp(f.geometry.coordinates));
    reproj = true;
  }

  // Classify + area
  const ha = {}, hasFill = feats.some(f => f.properties && f.properties.fill_hex);
  feats.forEach(f => {
    f.properties = f.properties || {};
    f.properties._c = classify(f.properties);
    try { f.properties._ha = turf.area(f) / 1e4; } catch(e) { f.properties._ha = 0; }
    ha[f.properties._c] = (ha[f.properties._c]||0) + f.properties._ha;
  });

  zones = L.geoJSON({type:'FeatureCollection', features:feats}, {
    style,
    onEachFeature:(f, l) => {
      const p = f.properties;
      l.bindPopup(`<b>${p.ZONE_LABEL || p.ZONE_LABEL_GRP || 'Zone'}</b>`
        + (p.ZONE_SPUSE_ENG ? `<br>${p.ZONE_SPUSE_ENG}` : '')
        + `<br><span style="color:#aaa">${CLASSES[p._c].name}</span>`
        + `<br>${p._ha.toFixed(2)} ha`
        + (p.PLAN_NO ? `<br>Plan: ${p.PLAN_NO}` : ''));
    }
  }).addTo(map);

  // Bounds of industrial features
  const indLayer = L.geoJSON({type:'FeatureCollection', features:feats.filter(f => f.properties._c !== 'other')});
  indBounds = indLayer.getLayers().length ? indLayer.getBounds() : zones.getBounds();

  // Stats
  const fmt = v => v ? Math.round(v).toLocaleString() + ' ha' : '0 ha';
  const indTotal = (ha['I']||0) + (ha['I(D)']||0) + (ha['OU(B)']||0);
  document.getElementById('st-I').textContent = fmt(ha['I']);
  document.getElementById('st-ID').textContent = fmt(ha['I(D)']);
  document.getElementById('st-OUB').textContent = fmt(ha['OU(B)']);
  document.getElementById('st-TOT').textContent = fmt(indTotal);
  if (ha.other) {
    const all = Object.values(ha).reduce((a,b) => a+b, 0);
    document.getElementById('st-share').textContent = (indTotal/all*100).toFixed(1) + '%';
    document.getElementById('st-share-wrap').style.display = 'block';
  }

  // Legend
  const lg = document.getElementById('legend');
  lg.innerHTML = '<b>OZP zones</b>' + Object.keys(CLASSES).filter(k => ha[k]).map(k =>
    `<div class="row"><s style="background:${CLASSES[k].color}"></s>${CLASSES[k].name}<span class="ha">${Math.round(ha[k]).toLocaleString()} ha</span></div>`
  ).join('') + `<button id="ozpBtn" ${hasFill?'':'disabled title="No fill_hex column in this GeoJSON"'}>OZP colours: off</button>`;
  lg.style.display = 'block';
  document.getElementById('ozpBtn').onclick = e => {
    state.ozp = !state.ozp; e.target.textContent = 'OZP colours: ' + (state.ozp ? 'on' : 'off'); zones.setStyle(style);
  };

  status(`Loaded ${feats.length.toLocaleString()} zones` + (reproj ? ' (reprojected from EPSG:2326)' : ''), false, 4000);
  go(current, true);
}

// ---------- Story overlays ----------
const pin = (ll, txt, col='#fff') => L.circleMarker(ll, {radius:7, color:'#000', weight:1, fillColor:col, fillOpacity:1})
  .bindTooltip(txt, {permanent:true, direction:'right', className:'lbl', offset:[8,0]});
const dash = (a, b, col='#ff7a1a') => L.polyline([a, b], {color:col, weight:2.5, dashArray:'6 8', opacity:.9});
const HK = [22.32, 114.17];
const CITIES = { 'Shenzhen':[22.543,114.058], 'Dongguan':[23.02,113.75], 'Huizhou':[23.11,114.42], 'Zhuhai':[22.27,113.58] };
const EXTRAS = {
  gba: L.layerGroup([
    ...Object.values(CITIES).map(ll => dash(ll, HK)),
    ...Object.entries(CITIES).map(([n, ll]) => pin(ll, n + ': factories', '#ffd166')),
    pin(HK, 'Hong Kong: imports finished goods', '#ff7a1a')
  ]),
  mic: L.layerGroup([
    dash([23.08,114.41], [22.367,113.947]),
    dash([22.367,113.947], [22.297,114.268], '#c084fc'),
    pin([23.08,114.41], '① Huizhou: modules made', '#ffd166'),
    pin([22.367,113.947], '② River Trade Terminal, Tuen Mun: shipped in', '#ff7a1a'),
    pin([22.297,114.268], '③ Tseung Kwan O: assembled', '#c084fc')
  ]),
  counter: L.layerGroup([
    pin([22.4958,114.1435], 'Fanling: data centres (AWS, HK$2.45bn) · click for 3D', '#4ade80').on('click', () => open3D()),
    pin([22.356,114.103], 'Tsing Yi: cold storage (Brookfield, ~HK$663m)', '#7dd3fc'),
    pin([22.503,114.07],  'Northern Metropolis: I&T land', '#ffd166')
  ])
};

// ---------- Views ----------
const VIEWS = {
  hk:  [[22.17,113.83],[22.57,114.42]],
  gba: [[21.95,113.35],[23.3,114.75]],
  mic: [[22.22,113.85],[23.15,114.5]],
  kt:  [[22.300,114.195],[22.335,114.235]],
  nt:  [[22.33,113.95],[22.54,114.2]]
};

// ---------- Sources ----------
// ✏️ Edit sources here. Tag slides in index.html with data-src="key1,key2".
// The References slide (13) is built from this list automatically.
const SOURCES = {
  rvd:    '<a href="https://www.rvd.gov.hk/doc/en/HKPR2026_Preliminary_Findings_Eng.pdf" target="_blank">Rating & Valuation Department</a>: <i>Hong Kong Property Review 2025</i>; <i>2026 Preliminary Findings</i>',
  landsd: '<a href="https://www.landsd.gov.hk" target="_blank">Lands Department</a>: Practice Notes 12/2023, 5/2025, 6/2026 (standard rates, industrial building redevelopment)',
  devb:   '<a href="https://www.devb.gov.hk" target="_blank">Development Bureau</a>: LegCo brief on standard rates for industrial buildings',
  cap545: '<a href="https://www.elegislation.gov.hk/hk/cap545" target="_blank">Land (Compulsory Sale for Redevelopment) Ordinance, Cap. 545</a>',
  cic:    '<a href="https://www.cic.hk" target="_blank">Construction Industry Council</a>: <i>Logistics and Transport for MiC Projects</i>',
  kf:     '<a href="https://www.knightfrank.com.hk" target="_blank">Knight Frank</a>: <i>Hong Kong Industrial Summary</i> Q4 2025, Q2 2026, Q3 2026',
  pa:     '<a href="https://www.policyaddress.gov.hk" target="_blank">HKSAR Government</a>: 2025 Policy Address, Supplement',
  pland:  '<a href="https://www.pland.gov.hk" target="_blank">Planning Department</a>: Outline Zoning Plan zones (GIS data)',
  esri:   'Basemap: Esri World Dark Gray Canvas',
  ming:   '<a href="https://www.mingtiandi.com/real-estate/data-centres/amazon-buying-hong-kong-data-centres-from-grand-ming-for-up-to-312m/" target="_blank">Mingtiandi.com</a>: Amazon Buying Hong Kong Data Centres From Grand Ming for Up to $312M',
};
const srcBox = document.getElementById('srcbox');
function showSources(s){
  const keys = (s.dataset.src || '').split(',').map(k => k.trim()).filter(Boolean);
  srcBox.style.display = keys.length ? 'block' : 'none';
  srcBox.innerHTML = '<b>Sources for this slide</b><ol>'
    + keys.map(k => `<li>${SOURCES[k] || '⚠ Unknown source: ' + k}</li>`).join('') + '</ol>';
}
document.getElementById('reflist').innerHTML = Object.values(SOURCES).map(v => `<li>${v}</li>`).join('');

// ---------- Slides ----------
const slides = [...document.querySelectorAll('.slide')];
const dots = document.getElementById('dots');
slides.forEach((_, i) => { const b = document.createElement('b'); b.onclick = () => go(i); dots.appendChild(b); });
let current = Math.max(0, Math.min(slides.length-1, (parseInt(location.hash.slice(1))||1) - 1));

function go(i, instant=false){
  current = Math.max(0, Math.min(slides.length-1, i));
  const s = slides[current];
  showSources(s);
  slides.forEach((el, k) => el.classList.toggle('active', k === current));
  [...dots.children].forEach((d, k) => d.classList.toggle('on', k === current));
  document.getElementById('count').textContent = `${current+1} / ${slides.length}`;
  history.replaceState(null, '', '#' + (current+1));
  document.getElementById('panel').scrollTop = 0;

  state.mode = s.dataset.mode || 'ind';
  if (zones) zones.setStyle(style);
  Object.entries(EXTRAS).forEach(([k, lg]) => k === s.dataset.extra ? lg.addTo(map) : map.removeLayer(lg));
  fitView(instant);
}

function fitView(instant=false){
  const v = slides[current].dataset.view;
  const b = v === 'ind' ? indBounds : VIEWS[v];
  if (!b) return;
  const r = document.getElementById('panel').getBoundingClientRect();
  const opts = isMobile()
    ? {paddingTopLeft:[15, 15], paddingBottomRight:[15, window.innerHeight - r.top + 15]}
    : {paddingTopLeft:[r.right + 20, 30], paddingBottomRight:[30, 30]};
  instant ? map.fitBounds(b, opts) : map.flyToBounds(b, {...opts, duration:1.3});
}
document.getElementById('prev').onclick = () => go(current-1);
document.getElementById('next').onclick = () => go(current+1);
document.addEventListener('keydown', e => {
  if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
  if (['ArrowRight','PageDown',' '].includes(e.key)) { e.preventDefault(); go(current+1); }
  if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); go(current-1); }
  if (e.key === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
});
go(current, true);

// ---------- Premium calculator ----------
const RATES = {
  'HK Island':    {before:25500, com:42000, res:84000},
  'Kowloon East': {before:25500, com:36000, res:63000},
  'Kowloon West': {before:22500, com:35000, res:70000},
  'NT South':     {before:22500, com:31000, res:46000},
  'NT North':     {before:13500, com:17000, res:33000}
};
const reg = document.getElementById('c-reg');
reg.innerHTML = Object.keys(RATES).map(k => `<option ${k==='Kowloon East'?'selected':''}>${k}</option>`).join('');
function calc(){
  const r = RATES[reg.value], use = document.getElementById('c-use').value;
  const gfa = +document.getElementById('c-gfa').value || 0;
  const bonus = +document.getElementById('c-bonus').value || 0;
  const after = gfa * (1 + bonus/100);
  const prem = r[use] * after - r.before * gfa;
  document.getElementById('c-out').textContent = 'HK$' + (prem/1e6).toLocaleString(undefined, {maximumFractionDigits:0}) + ' million';
  document.getElementById('c-detail').textContent =
    `${r[use].toLocaleString()} × ${Math.round(after).toLocaleString()} m² − ${r.before.toLocaleString()} × ${gfa.toLocaleString()} m²`;
}
['c-reg','c-use','c-gfa','c-bonus'].forEach(id => document.getElementById(id).addEventListener('input', calc));
calc();
// ---------- Phone support ----------
function isMobile(){ return window.innerWidth <= 800; }
const panelEl = document.getElementById('panel');

// Sources go inside the sheet on phones, top-right on desktop
function placeSources(){
  if (isMobile()) { if (srcBox.parentNode !== panelEl) panelEl.appendChild(srcBox); }
  else if (srcBox.parentNode !== document.body) document.body.appendChild(srcBox);
}
placeSources();

// Tap the grey bar to make the sheet taller or shorter
document.getElementById('handle').onclick = () => {
  const tall = document.body.classList.toggle('tall');
  if (!tall) setTimeout(() => fitView(), 320);
};

// Swipe left/right on the sheet to change slides
let tx = 0, ty = 0;
panelEl.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, {passive:true});
panelEl.addEventListener('touchend', e => {
  if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return;
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
}, {passive:true});

// Tap "OZP zones" to open or close the legend on phones
document.getElementById('legend').addEventListener('click', e => {
  if (e.target.tagName === 'B') e.currentTarget.classList.toggle('open');
});

// Re-fit when the phone rotates or the window is resized
let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    placeSources();
    map.invalidateSize();
    if (!document.body.classList.contains('tall')) fitView(true);
  }, 250);
});
// ---------- 3D view (iTech Tower 3.1) ----------
const view3d = document.getElementById('view3d');
const frame3d = document.getElementById('frame3d');

function open3D(){
  frame3d.src = 'itech3d.html';   // only loads when opened
  view3d.hidden = false;
}
function close3D(){
  view3d.hidden = true;
  frame3d.src = 'about:blank';    // frees the 3D graphics memory
}
document.getElementById('open3d').onclick = open3D;
document.getElementById('close3d').onclick = close3D;
window.addEventListener('message', e => { if (e.data === 'close3d') close3D(); });

// While the 3D window is open: Esc closes it, and arrow keys don't change slides
document.addEventListener('keydown', e => {
  if (view3d.hidden) return;
  if (e.key === 'Escape') close3D();
  e.stopImmediatePropagation();
}, true);