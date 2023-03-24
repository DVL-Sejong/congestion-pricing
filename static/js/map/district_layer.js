// 샌프란시스코 하위 행정구역 드로잉
const districtLayer = L.mapbox.featureLayer(null, {
    style: {
        color: "color(srgb 0.5818 0.6931 0.895)",
        weight: 5,
        fillOpacity: 0,
    }
})
.loadURL("/static/data/sanfrancisco/Analysis Neighborhoods(b).geojson")
.addTo(map);
