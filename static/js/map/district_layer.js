// 행정구역 레이어 스타일 정의
const districtLayerDefaultStyle = { // 기본 스타일
    color: "#aaa",
    weight: 1,
    fillOpacity: 0.1,
};
const districtLayerMouseOverStyle = { // 마우스 오버 시 스타일
    color: "#aaa",
    weight: 1,
    fillOpacity: 0,
};
const districtLayerSelectedStyle = { // 선택했을 때 스타일
    color: "#aaa",
    weight: 2,
    fillOpacity: 0,
};
const districtLayerPolicyStyle = cost => cost > 0 ? { // 혼잡세 적용 시 스타일
    color: "color(srgb 0.61 0.9 0.58)",
    fillOpacity: 0.1 + pricing_cost_list[cost] / max_pricing_cost * 0.4,
} : {};

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
    console.log(district_layers);

    // 행정구역별 혼잡세 정책 초기화
    district_policy = {};
    for (let layerID in districtLayer._layers) {
        const districtName = districtLayer._layers[layerID].feature.properties['nhood'];
        district_policy[districtName] = JSON.parse(JSON.stringify(defaultPolicy));
    }
});

districtLayer
    .on("mouseover", e => focusDistrict(e.layer.feature.properties.nhood)) // 폴리곤 마우스 오버 시 강조
    .on("mouseout", e => unfocusDistrict(e.layer.feature.properties.nhood)); // 폴리곤 마우스 아웃 시 강조 해제

// 폴리곤 클릭 시 인스펙터 열기
districtLayer.on("click", function(e) {
    $("#inspector").trigger("open", [e.layer.feature.properties.nhood]);
});

// 폴리곤에 혼잡세 가격 정책 시각화
districtLayer.on("policy_heatmap", function(e) {
    const layer = districtLayer._layers[district_layers[e.districtName]];
    const policy = district_policy[e.districtName];

    if ($("#inspector").data("current_district") === e.districtName)
        layer.setStyle({
            ...districtLayerSelectedStyle,
            ...districtLayerPolicyStyle(policy['cost']),
        });
    else
        layer.setStyle({
            ...districtLayerDefaultStyle,
            ...districtLayerPolicyStyle(policy['cost']),
        });
});
