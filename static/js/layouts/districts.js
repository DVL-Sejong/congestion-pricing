function renderParallelCoordinates(data) {
    // set the dimensions and margins of the graph
    var margin = { top: 5, right: 10, bottom: 17, left: 30 },
        width = 480 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    if ($("#average-tci svg").length > 0)
        $("#average-tci svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#average-tci")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    dimensions = d3.keys(data[0]).filter(function (d) { return d != "name" })

    // For each dimension, I build a linear scale. I store all in a y object
    const min = d3.min(dimensions, i => d3.min(data, d => +d[i]));
    const max = d3.max(dimensions, i => d3.max(data, d => +d[i]));
    var y = {}
    for (i in dimensions) {
        road_id = dimensions[i]
        y[road_id] = d3.scaleLinear()
            //.domain(d3.extent(data, function (d) { return +d[road_id]; }))
            .domain([min, max])
            .range([height, 0]);
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw Y axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function (d) {
            const axis = d3.select(this).call(d3.axisLeft().scale(y[d]));
            if (d > 0) {
                axis.select("path")
                    .style("stroke", "#aaa")
                    .attr("d", "M-6,178.5H0.5V0")
                axis.selectAll("g").remove();
            }
        })

    // Draw X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", "#555");

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "deepskyblue")
        .style("opacity", 1);
    
    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        // .on("brush", brushed);
    
    const brushobj = svg.append("g")
        .attr("class", "brush")
        .call(brush)
    brushobj
        .select(".selection")
        .attr("opacity", "0.5");
    brushobj
        .selectAll(".handle")
        .remove();
}

function highlightTimeRangeToParallelCoordinates(timeRange) {
    
}

function renderDistrictList(filterOptions) {
    const params = {
        'date_range': filterOptions['date_range'],
        'time_range': filterOptions['time_range'],
    };
    d3.json("/data/districts/status")
        .header("Content-Type", "application/json")
        .post(JSON.stringify(params), data => {
            // 현재 필터 설정과 같지 않은 경우 무시
            if (JSON.stringify(data['date_range']) != JSON.stringify(filterOptions['date_range'])
            || JSON.stringify(data['time_range']) != JSON.stringify(filterOptions['time_range']))
                return;

            // District List 렌더링
            $("#district-list-body tr").not("#district-list-template").remove();
            for (let district of data['sorted']) {
                const $row = $("#district-list-template").clone().removeAttr("id");
                const tci = data['tci'][district].toFixed(2);
                const crr = (data['crr'][district] * 100.0).toFixed(0);

                $row.find(".name").text(district);
                $row.find(".tci").text(tci);
                $row.find(".congestion-road-rate-bar").css("width", `${crr}%`);
                $row.find(".congestion-road-rate-num").text(`${crr}%`);
                $row.removeClass("hidden").appendTo("#district-list-body");

                // 클릭 시 인스펙터 열기
                $row.on("click", () => $("#inspector").trigger("open", [district]));
            }
        });
}
