d3.csv("/static/data/connum.csv", renderRoadNetworkCongestion);

function renderRoadNetworkCongestion(data) {
    var margin = { top: 5, right: 5, bottom: 17, left: 30 },
        width = 425 - margin.left - margin.right,
        height = 175 - margin.top - margin.bottom;

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
        .domain(data.map(function (d) { return d.Date; }));
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return +d.actual; })])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.Date); })
        .attr("y", function (d) { return y(d.actual); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.actual); })
        .attr("fill", "steelblue");
}
