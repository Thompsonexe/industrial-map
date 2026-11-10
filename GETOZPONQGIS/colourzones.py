from qgis.core import QgsFillSymbol, QgsRendererCategory, QgsCategorizedSymbolRenderer
from qgis.PyQt.QtGui import QColor

lyr = iface.activeLayer()
seen = {}
for f in lyr.getFeatures():
    lab = f['legend'] or 'Other'
    if lab not in seen:
        seen[lab] = (f['fill_hex'], f['fill_alpha'], f['line_hex'])

cats = []
for lab, (fill, alpha, line) in sorted(seen.items()):
    sym = QgsFillSymbol.createSimple({'outline_color': line or '#666666', 'outline_width': '0.1'})
    c = QColor(fill or '#cccccc')
    c.setAlphaF(float(alpha) if fill else 0.5)
    sym.setColor(c)
    cats.append(QgsRendererCategory(lab, sym, lab))

lyr.setRenderer(QgsCategorizedSymbolRenderer("coalesce(\"legend\", 'Other')", cats))
lyr.triggerRepaint()
iface.layerTreeView().refreshLayerSymbology(lyr.id()) 

