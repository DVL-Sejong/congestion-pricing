$(document).ready(function() {
    const $inspector = $("#inspector");

    // 인스펙터 모달의 드래그 핸들을 드래그하여 위치 조정
    $inspector.draggable({
        handle: $inspector.children(".drag-handle")
    });

    $inspector.on("add_button", function(e, map, polygon) {
        // 폴리곤 상단에 토글 버튼 추가
        const button = $("#open-inspector").clone()
            .attr("id", "")
            .removeClass("template")
            .removeClass("hidden")
            .get(0);
        const canvas = map._container;
    
        button.addEventListener("click", () => $("#inspector").trigger("open"));
        
        const coordinates = polygon.geometry.coordinates[0].map(coords => [coords[1], coords[0]]);
        const bounds = L.latLngBounds(coordinates);
    
        const buttonContainer = L.DomUtil.create("div", "button-container");
        buttonContainer.style.position = "absolute";
        buttonContainer.style.zIndex = "999";
        buttonContainer.appendChild(button);
    
        canvas.appendChild(buttonContainer);

        // 지도에서 보고 있는 위치를 이동할 시 토글 버튼의 위치도 이동
        function updateButtonPosition() {
            const northEast = bounds.getNorthEast();
            const containerPoint = map.latLngToContainerPoint(northEast);
            L.DomUtil.setPosition(buttonContainer, containerPoint);
        }
        map.on("move", updateButtonPosition);
        updateButtonPosition();
    })

    $inspector.on("open", function(e, district_name) {
        // Inspector 모달 위치 조정
        const width = $(this).width();
        const height = $(this).height();
        $(this)
            .css("left", `calc(50% - ${width/2}px`)
            .css("top", `calc(50% - ${height}px)`)
            .removeClass("hidden");
        
        // 모달 내부의 District Name 설정
        if (district_name) {
            $("#district-name").text(district_name);
        } else {
            $("#district-name").text("Custom Area");
        }
    });

    $inspector.on("close", function() {
        $(this).addClass("hidden");
    });
    $inspector.find(".button.close").on("click", function() {
        $inspector.trigger("close");
    })
});
