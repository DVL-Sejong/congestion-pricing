function renderOverview(filterOptions) {
    d3.json("/data/overview/status")
        .header("Content-Type", "application/json")
        .post(JSON.stringify(filterOptions), data => {
            // 현재 필터 설정과 같지 않은 경우 무시
            if (JSON.stringify(data['date_range']) != JSON.stringify(filterOptions['date_range'])
            || JSON.stringify(data['time_range']) != JSON.stringify(filterOptions['time_range']))
                return;
            
            // 시각화 렌더링
            renderRoadNetworkCongestion(data['nornn']);
            renderNetworkTCI(data['tci']);
        });
}

function renderRoadNetworkCongestion(data) {
    var margin = { top: 5, right: 5, bottom: 17, left: 30 },
        width = 425 - margin.left - margin.right,
        height = 175 - margin.top - margin.bottom;

    if ($("#no-congestion svg").length > 0)
        $("#no-congestion svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#no-congestion")
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
        .domain(Object.keys(data).map(d => +d));
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", "#555");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(data), d => +d)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text").attr("fill", "#555");

    // Add bars
    svg.selectAll("rect")
        .data(Object.keys(data))
        .enter()
        .append("rect")
        .attr("x", d => x(d))
        .attr("y", d => y(data[d]))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(data[d]))
        .attr("fill", "deepskyblue");
}

function renderNetworkTCI(data) {
    var margin = { top: 5, right: 5, bottom: 17, left: 30 },
        width = 425 - margin.left - margin.right,
        height = 175 - margin.top - margin.bottom;
    
    if ($("#network-tci svg").length > 0)
        $("#network-tci svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#network-tci")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(Object.keys(data), d => +d))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format(",.0d")))
        .selectAll("text").attr("fill", "#555");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(Object.values(data), d => +d))
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(",.2f")))
        .selectAll("text").attr("fill", "#555");

    // Add the line
    svg.append("path")
        .datum(Object.keys(data))
        .attr("fill", "none")
        .attr("stroke", "deepskyblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => x(d))
            .y(d => y(data[d]))
        );
}
