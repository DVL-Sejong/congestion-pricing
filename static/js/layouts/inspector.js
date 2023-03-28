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

        // Pricing Cost 별 교통 정체 시각화
        renderPricingDelay();
    });

    $inspector.on("close", function() {
        $(this).addClass("hidden");
    });
    $inspector.find(".button.close").on("click", function() {
        $inspector.trigger("close");
    })
});

function renderPricingDelay() {
    d3.csv("/static/data/sanfrancisco/delay_sf.csv", data => {
        var margin = { top: 5, right: 5, bottom: 17, left: 50 },
            width = 340 - margin.left - margin.right,
            height = 175 - margin.top - margin.bottom;

        if ($("#pricing-delay svg").length > 0)
            $("#pricing-delay svg").remove();

        // append the svg object to the body of the page
        var svg = d3.select("#pricing-delay")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Add X axis
        var x = d3.scaleBand()
            .range([0, width])
            .padding(0.2)
            .domain(data.map(d => +d.Toll));
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(d => "$" + parseInt(d / 60)))
            .selectAll("text").attr("fill", "#555");

        // Add Y axis
        var yDomain = d3.extent(data, d => +d.TotalDelayTime);
        yDomain[0] -= (yDomain[1] - yDomain[0]) * 0.2;
        var y = d3.scaleLinear()
            .domain(yDomain)
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => parseInt(d / 1000) + "k"))
            .selectAll("text").attr("fill", "#555");

        // Add Y axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("fill", "#555")
            .attr("y", -margin.left+10)
            .attr("x", 0)
            .style("font-size", ".8em")
            .text("Total Delay Time (seconds)");

        // Add bars
        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", d => x(d.Toll))
            .attr("y", d => y(d.TotalDelayTime))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.TotalDelayTime))
            .attr("fill", "deepskyblue");

        // Set range input attributes
        d3.select("#pricing-cost")
            .attr("min", 0)
            .attr("max", data.length-1)
            .attr("step", 1);

        // Add range input datalist
        d3.selectAll("#pricing-cost-list > option").remove();
        d3.select("#pricing-cost-list")
            .selectAll("option")
            .data(data)
            .enter()
            .append("option")
            .attr("value", (d, i) => i)
            .attr("label", d => parseInt(d.Toll/60))
            .text(d => parseInt(d.Toll/60));
        
        // Add range ticks
        // d3.selectAll("#pricing-cost-ticks > .tick").remove();
        // d3.select("#pricing-cost-ticks")
        //     .selectAll("div")
        //     .data(data)
        //     .enter()
        //     .append("div")
        //     .attr("class", "tick")
        //     .text(d => `\$${parseInt(d.Toll/60)}`);
    });
}
