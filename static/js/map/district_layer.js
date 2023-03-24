// 샌프란시스코 하위 행정구역 드로잉
const districtLayer = L.mapbox.featureLayer(null, {
    style: {
        color: "color(srgb 0.5818 0.6931 0.895)",
        weight: 3,
        fillOpacity: 0,
    }
})
.loadURL("/static/data/sanfrancisco/Analysis Neighborhoods(b).geojson")
.addTo(map);

// 폴리곤 마우스 오버 시 강조
districtLayer.on("mouseover", function(e) {
    e.layer.setStyle({
        fillOpacity: 0.3,
    });
}).on("mouseout", function(e) {
    e.layer.setStyle({
        fillOpacity: 0,
    });
});

// 폴리곤 클릭 시 인스펙터 열기
districtLayer.on("click", function(e) {
    $("#inspector").trigger("open", [e.layer.feature.properties.nhood]);
});
