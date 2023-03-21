$(document).ready(function() {
    const $inspector = $("#inspector");

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

        function updateButtonPosition() {
            const northEast = bounds.getNorthEast();
            const containerPoint = map.latLngToContainerPoint(northEast);
            L.DomUtil.setPosition(buttonContainer, containerPoint);
        }
        map.on("move", updateButtonPosition);
        updateButtonPosition();
    })

    $inspector.on("open", function() {
        // Inspector 모달 height 조정
        const height = $(this).height();
        $(this)
            .css("left", "50%")
            .css("top", `calc(50% - ${height}px)`)
            .removeClass("hidden");
    });

    $inspector.on("close", function() {
        $(this).addClass("hidden");
    });
    $inspector.find(".button.close").on("click", function() {
        $inspector.trigger("close");
    })
});
