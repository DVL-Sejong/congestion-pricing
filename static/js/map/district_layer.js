// 행정구역 레이어 스타일 정의
const districtLayerDefaultStyle = { // 기본 스타일
    color: "color(srgb 0.5818 0.6931 0.895)",
    weight: 2,
    fillOpacity: 0,
};
const districtLayerMouseOverStyle = { // 마우스 오버 시 스타일
    fillOpacity: 0.1,
};
const districtLayerSelectedStyle = { // 선택했을 때 스타일
    color: "color(srgb 0.58 0.63 0.9)",
    weight: 5,
    fillOpacity: 0,
};

// 샌프란시스코 하위 행정구역 드로잉
const districtLayer = L.mapbox.featureLayer("/static/data/sanfrancisco/Analysis Neighborhoods(b).geojson", {
    style: districtLayerDefaultStyle
})
.addTo(map);

districtLayer.on("ready", function() {
    // 행정구역 이름, 레이어 번호 쌍의 해시맵 구성
    district_layers = {};
    for (let layerID in districtLayer._layers) {
        const districtName = districtLayer._layers[layerID].feature.properties['nhood'];
        district_layers[districtName] = layerID;
    }

    // 행정구역별 혼잡세 정책 초기화
    district_policy = {};
    for (let layerID in districtLayer._layers) {
        const districtName = districtLayer._layers[layerID].feature.properties['nhood'];
        district_policy[districtName] = JSON.parse(JSON.stringify(defaultPolicy));
    }
});

// 폴리곤 마우스 오버 시 강조
districtLayer.on("mouseover", function(e) {
    if (!e.layer['inspector_opened'])
        e.layer.setStyle(districtLayerMouseOverStyle);
}).on("mouseout", function(e) {
    if (!e.layer['inspector_opened'])
        e.layer.setStyle(districtLayerDefaultStyle);
});

// 폴리곤 클릭 시 인스펙터 열기
districtLayer.on("click", function(e) {
    $("#inspector").trigger("open", [e.layer.feature.properties.nhood]);
});
