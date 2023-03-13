d3.csv("/static/data/netCongestion.csv", function (data) {
    renderCalendar(data);
});

d3.csv("/static/data/connum.csv", function (data) {
    var margin = { top: 0, right: 5, bottom: 17, left: 5 },
        width = 225 - margin.left - margin.right,
        height = 75 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#filter-time")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return +d.Date; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return +d.actual; })])
        .range([height, 0]);
    // svg.append("g")
    //     .call(d3.axisLeft(y));

    // Add the line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.Date) })
            .y(function (d) { return y(d.actual) })
        )
});

// d3.csv("/static/data/netCongestion.csv", function(error, data) {
//     if (error) throw error;

//     d3.timeFormatDefaultLocale({
//         "decimal": ".",
//         "thousands": ",",
//         "grouping": [3],
//         "currency": ["$", ""],
//         "dateTime": "%a %b %e %X %Y",
//         "date": "%m/%d/%Y",
//         "time": "%H:%M:%S",
//         "periods": ["AM", "PM"],
//         "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
//         "shortDays": ["S", "M", "T", "W", "T", "F", "S"],
//         "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
//         "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
//     });

//     var chart = new Calendar(d3.select('#filter-datetime'), data, {
//         'datefield': 'Date',
//         'key': 'Actual',
//         'year': 2008,
//         'mondaystart': true,
//     })
// });

// d3.csv("/static/data/netCongestion.csv", (error, data) => {
//     var heatmap = CalendarHeatmap()
//         .data(data)
//         .colorRange(['#D8E6E7', '#218380'])
//         .dateRange([new Date('2008-05-17'), new Date('2008-06-19')]);

//     d3.select('#filter-datetime')
//         .datum(data)
//         .call(heatmap);
// });

// d3.csv("/static/data/netCongestion.csv").then(sample => {
//     sample.sort((a, b) => new Date(a.Date) - new Date(b.Date));

//     const dateValues = sample.map(dv => ({
//         date: d3.timeDay(new Date(dv.Date)),
//         value: Number(dv.Actual)
//     }));
//     console.log(dateValues);

//     const svg = d3.select("#filter-datetime");
//     const { width, height } = document
//         .getElementById("filter-datetime")
//         .getBoundingClientRect();


//     function draw() {
//         const years = d3
//             .nest()
//             .key(d => d.date.getUTCFullYear())
//             .entries(dateValues)
//             .reverse();

//         const values = dateValues.map(c => c.value);
//         const maxValue = d3.max(values);
//         const minValue = d3.min(values);

//         const cellSize = 15;
//         const yearHeight = cellSize * 7;

//         const group = svg.append("g");

//         const year = group
//             .selectAll("g")
//             .data(years)
//             .join("g")
//             .attr(
//                 "transform",
//                 (d, i) => `translate(50, ${yearHeight * i + cellSize * 1.5})`
//             );

//         year
//             .append("text")
//             .attr("x", -5)
//             .attr("y", -30)
//             .attr("text-anchor", "end")
//             .attr("font-size", 16)
//             .attr("font-weight", 550)
//             .attr("transform", "rotate(270)")
//             .text(d => d.key);

//         const formatDay = d =>
//             ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()];
//         const countDay = d => d.getUTCDay();
//         const timeWeek = d3.utcSunday;
//         const formatDate = d3.utcFormat("%x");
//         const colorFn = d3
//             .scaleSequential(d3.interpolateBuGn)
//             .domain([Math.floor(minValue), Math.ceil(maxValue)]);
//         const format = d3.format("+.2%");

//         year
//             .append("g")
//             .attr("text-anchor", "end")
//             .selectAll("text")
//             .data(d3.range(7).map(i => new Date(1995, 0, i)))
//             .join("text")
//             .attr("x", -5)
//             .attr("y", d => (countDay(d) + 0.5) * cellSize)
//             .attr("dy", "0.31em")
//             .attr("font-size", 12)
//             .text(formatDay);

//         year
//             .append("g")
//             .selectAll("rect")
//             .data(d => d.values)
//             .join("rect")
//             .attr("width", cellSize - 1.5)
//             .attr("height", cellSize - 1.5)
//             .attr(
//                 "x",
//                 (d, i) => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10
//             )
//             .attr("y", d => countDay(d.date) * cellSize + 0.5)
//             .attr("fill", d => colorFn(d.value))
//             .append("title")
//             .text(d => `${formatDate(d.date)}: ${d.value.toFixed(2)}`);

//         const legend = group
//             .append("g")
//             .attr(
//                 "transform",
//                 `translate(10, ${years.length * yearHeight + cellSize * 4})`
//             );

//         const categoriesCount = 10;
//         const categories = [...Array(categoriesCount)].map((_, i) => {
//             const upperBound = (maxValue / categoriesCount) * (i + 1);
//             const lowerBound = (maxValue / categoriesCount) * i;

//             return {
//                 upperBound,
//                 lowerBound,
//                 color: d3.interpolateBuGn(upperBound / maxValue),
//                 selected: true
//             };
//         });

//         const legendWidth = 60;

//         function toggle(legend) {
//             const { lowerBound, upperBound, selected } = legend;

//             legend.selected = !selected;

//             const highlightedDates = years.map(y => ({
//                 key: y.key,
//                 values: y.values.filter(
//                     v => v.value > lowerBound && v.value <= upperBound
//                 )
//             }));

//             year
//                 .data(highlightedDates)
//                 .selectAll("rect")
//                 .data(d => d.values, d => d.date)
//                 .transition()
//                 .duration(500)
//                 .attr("fill", d => (legend.selected ? colorFn(d.value) : "white"));
//         }

//         legend
//             .selectAll("rect")
//             .data(categories)
//             .enter()
//             .append("rect")
//             .attr("fill", d => d.color)
//             .attr("x", (d, i) => legendWidth * i)
//             .attr("width", legendWidth)
//             .attr("height", 15)
//             .on("click", toggle);

//         legend
//             .selectAll("text")
//             .data(categories)
//             .join("text")
//             .attr("transform", "rotate(90)")
//             .attr("y", (d, i) => -legendWidth * i)
//             .attr("dy", -30)
//             .attr("x", 18)
//             .attr("text-anchor", "start")
//             .attr("font-size", 11)
//             .text(d => `${d.lowerBound.toFixed(2)} - ${d.upperBound.toFixed(2)}`);

//         legend
//             .append("text")
//             .attr("dy", -5)
//             .attr("font-size", 14)
//             .attr("text-decoration", "underline")
//             .text("Click on category to select/deselect days");
//     }

//     draw();
// })
