const dataset = [
    { date: "2008-05-17", temperature: 20 },
    { date: "2008-05-18", temperature: 22 },
    { date: "2008-05-19", temperature: 18 },
    { date: "2008-05-20", temperature: 16 },
    { date: "2008-05-21", temperature: 14 },
    { date: "2008-05-22", temperature: 12 },
    { date: "2008-05-23", temperature: 10 },
    { date: "2008-05-24", temperature: 8 },
    { date: "2008-05-25", temperature: 6 },
    { date: "2008-05-26", temperature: 4 },
    { date: "2008-05-27", temperature: 2 },
    { date: "2008-05-28", temperature: 0 },
    { date: "2008-05-29", temperature: -2 },
    { date: "2008-05-30", temperature: -4 },
    { date: "2008-05-31", temperature: -6 },
    { date: "2008-06-01", temperature: -8 },
    { date: "2008-06-02", temperature: -10 },
    { date: "2008-06-03", temperature: -12 },
    { date: "2008-06-04", temperature: -14 },
    { date: "2008-06-05", temperature: -16 },
    { date: "2008-06-06", temperature: -18 },
    { date: "2008-06-07", temperature: -20 },
    { date: "2008-06-08", temperature: -22 },
    { date: "2008-06-09", temperature: -24 },
    { date: "2008-06-10", temperature: -26 },
    { date: "2008-06-11", temperature: -28 },
    { date: "2008-06-12", temperature: -30 },
    { date: "2008-06-13", temperature: -28 },
    { date: "2008-06-14", temperature: -26 },
    { date: "2008-06-15", temperature: -24 },
    { date: "2008-06-16", temperature: -22 },
    { date: "2008-06-17", temperature: -20 },
    { date: "2008-06-18", temperature: -18 },
    { date: "2008-06-19", temperature: -16 },
  ];
  

// SVG 요소의 너비와 높이를 정의합니다.
const svgWidth = 280;
const svgHeight = 136;

// SVG 요소를 생성합니다.
const svg = d3
  .select("#calendar-heatmap")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// 날짜 포맷을 정의합니다.
const dateParser = d3.timeParse("%Y-%m-%d");

// x축 스케일을 정의합니다.
const xScale = d3.scaleTime().range([0, svgWidth]);

// y축 스케일을 정의합니다.
const yScale = d3.scaleBand().range([0, svgHeight]);

// 색상 스케일을 정의합니다.
const colorScale = d3
  .scaleLinear()
  .range(["#ffffff", "#ff4500"]);

// 날짜 범위를 정의합니다.
const startDate = dateParser("2008-05-17");
const endDate = dateParser("2008-06-19");

// x축 도메인을 설정합니다.
xScale.domain([startDate, endDate]);

// y축 도메인을 설정합니다.
yScale.domain(d3.range(7));

// 데이터를 가지고 히트맵을 그립니다.
svg
  .selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", (d) => xScale(dateParser(d.date)))
  .attr("y", (d) => yScale(new Date(d.date).getDay()))
  .attr("width", svgWidth / 365)
  .attr("height", svgHeight / 7)
  .attr("fill", (d) => colorScale(d.temperature));
