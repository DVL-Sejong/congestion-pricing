// 샌프란시스코 하위 행정구역 드로잉
const districtLayer = L.mapbox.featureLayer("/static/data/sanfrancisco/Analysis Neighborhoods(b).geojson", {
    style: {
        color: "color(srgb 0.5818 0.6931 0.895)",
        weight: 3,
        fillOpacity: 0,
    }
})
.addTo(map);

// District 이름, 레이어 번호 쌍의 해시맵 구성
districtLayer.on("ready", function() {
    district_layers = {};
    for (let layerID in districtLayer._layers) {
        districtName = districtLayer._layers[layerID].feature.properties['nhood']
        district_layers[districtName] = layerID;
    }
});

// 폴리곤 마우스 오버 시 강조
districtLayer.on("mouseover", function(e) {
    if (!e.layer['inspector_opened'])
        e.layer.setStyle({
            fillOpacity: 0.3,
        });
}).on("mouseout", function(e) {
    if (!e.layer['inspector_opened'])
        e.layer.setStyle({
            fillOpacity: 0,
        });
});

// 폴리곤 클릭 시 인스펙터 열기
districtLayer.on("click", function(e) {
    $("#inspector").trigger("open", [e.layer.feature.properties.nhood]);
});
