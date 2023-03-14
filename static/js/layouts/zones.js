d3.csv("/data/congestion/roads/0", renderParallelCoordinates);

function renderParallelCoordinates(data) {
    // set the dimensions and margins of the graph
    var margin = { top: 5, right: 0, bottom: 10, left: 0 },
        width = 290 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#average-tci")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Extract the list of dimensions we want to keep in the plot. Here I keep all except the column called Species
    dimensions = d3.keys(data[0]).filter(function (d) { return d != "road_id" })

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
        .padding(1)
        .domain(dimensions);

    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }

    // Draw the lines
    svg
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", "steelblue")
        .style("opacity", 0.5)

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        //.each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -5)
        .text(function (d) { return d; })
        .style("fill", "black")
}
