d3.csv("/static/data/sanfrancisco/city_tci_date.csv", renderCalendar);
d3.csv("/static/data/connum.csv", renderLineChart);

function renderCalendar(data) {
    const dates = data.map(item => new Date(item['Date']));
    const startDate = new Date(Math.min.apply(null, dates));
    const endDate = new Date(Math.max.apply(null, dates));

    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
    const days = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];

    // Define a function to convert Actual values to floats
    function convertToFloat(actual) {
        return parseFloat(actual);
    }

    // Convert the Actual values to floats
    data.forEach(item => {
        item['Actual'] = convertToFloat(item['Actual']);
    });

    // // Find the min and max Actual values
    // let min_actual = Math.min(...data.map(item => item['Actual']));
    // let max_actual = Math.max(...data.map(item => item['Actual']));

    // // Define a function to map Actual values to a range of 0 to 1
    // function mapActualValue(actual, minActual, maxActual) {
    //     return (actual - minActual) / (maxActual - minActual);
    // }

    // // Map the Actual values to a range of 0 to 1
    // data.forEach(item => {
    //     item['Mapped'] = mapActualValue(item['Actual'], min_actual, max_actual);
    // });

    // 캘린더 렌더링
    const $calendar = $("#filter-date");
    for (let d = new Date(startDate.getTime()); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().substring(0, 10);
        const $day = $("<div class='day calendar-day'><span class='date'>" + months[d.getMonth()] + "<br>" + d.getDate() + "</span></div>")
            .data("date", dateString);
        
        if (d.getDay() === 0 || d.getDay() === 6) {
            $day.addClass("weekend");
        }
        const actualObj = data.find(obj => obj.Date === dateString);
        if (actualObj) {
            $day.addClass("actual");
            $day.css("background-color", getColor(actualObj.Actual));
        }
        $calendar.append($day);
    }

    // 여백 추가
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
        $calendar.prepend("<div class='day empty-box'></div>");
    }
    const lastDayOfWeek = endDate.getDay();
    for (let i = lastDayOfWeek; i < 6; i++) {
        $calendar.append("<div class='day empty-box'></div>");
    }

    // 요일 추가
    $calendar.prepend("<div class='dayname'></div>");
    for (let i = 6; i >= 0; i--) {
        $calendar.prepend("<div class='dayname'>" + days[i] + "</div>");
    }

    // 평균 추가
    const dayAverage = getDayOfWeekAverage(data);
    for (let i = 0; i < 7; i++) {
        // const mapped = mapActualValue(dayAverage[i].average, min_actual, max_actual);
        const avg = $("<div class='avg actual dayofweek'></div>");
        avg.css("background-color", getColor(dayAverage[i].average));
        $calendar.append(avg);
    }
    const weekAverage = getWeeklyAverages(data);
    for (let i = 0; i < weekAverage.length; i++) {
        // const mapped = mapActualValue(weekAverage[i], min_actual, max_actual);
        const avg = $("<div class='avg actual weekly'></div>");
        avg.css("background-color", getColor(weekAverage[i]));
        $calendar.find(".day").eq(6 + i * 7).after(avg);
    }
    // $calendar.append("<div class='dayname avg-dayname'>Avg.</div>");

    function getColor(d) {
        if (d > 0.8)
            return "#FDEDEC";
        else if (d > 0.6)
            return "#FADBD8";
        else if (d > 0.4)
            return "#F1948A";
        else if (d > 0.2)
            return "#EC7063";
        else if (d > 0.0)
            return "#E74C3C";
        // if (d <= 1 && d > 0.8) {
        //     return "#ff0000"
        // } else if (d <= 0.8 && d > 0.6) {
        //     return "#feafaf";
        // } else if (d <= 0.6 && d > 0.4) {
        //     return "#Fe807f";
        // } else if (d <= 0.4 && d > 0.2) {
        //     return "#Fd403f";
        // } else if (d <= 0.2 && d > 0) {
        //     return "#FD0100";
        // }
    }

    function getDayOfWeekAverage(data) {
        const dayOfWeekTotal = [0, 0, 0, 0, 0, 0, 0];
        const dayOfWeekCount = [0, 0, 0, 0, 0, 0, 0];

        data.forEach(entry => {
            const date = new Date(entry.Date);
            const dayOfWeek = date.getDay();
            if (entry.Actual > 0.0) {
                dayOfWeekTotal[dayOfWeek] += entry.Actual;
                dayOfWeekCount[dayOfWeek]++;
            }
        });

        const dayOfWeekAverage = dayOfWeekTotal.map((total, index) => {
            return {
                dayOfWeek: index,
                average: total / dayOfWeekCount[index]
            };
        });

        return dayOfWeekAverage;
    }

    function getWeeklyAverages(data) {
        const weeklyData = [];
        let sum = 0;
        let count = 0;

        // 데이터를 하나씩 돌며 주 당 평균값을 계산
        for (let i = 0; i < data.length; i++) {
            const date = new Date(data[i].Date);
            const dayOfWeek = date.getDay();

            if (data[i].Actual > 0.0) {
                sum += data[i].Actual;
                count++;
            }

            // 일요일부터 토요일까지의 데이터만 누적합과 카운트 계산
            if (dayOfWeek === 6) {
                weeklyData.push(sum / count);
                sum = 0;
                count = 0;
            }
        }

        // 마지막 주의 평균값 추가
        weeklyData.push(sum / count);

        return weeklyData;
    }

    // 캘린더 마우스 이벤트
    var isMouseDown = false;
    var selectStartDate = null;
    var selectEndDate = null;

    $(document)
        .on("mousedown", "#filter-date .calendar-day", onCalendarMouseDown)
        .on("mousemove", "#filter-date .calendar-day", onCalendarMouseMove)
        .on("mouseup", onMouseUp);

    function onCalendarMouseDown(e) {
        isMouseDown = true;
        selectStartDate = $(this).data("date");
    }
    
    function onCalendarMouseMove(e) {
        if (isMouseDown) {
            selectEndDate = $(this).data("date");
            
            if (selectStartDate && selectEndDate) {
                var dateRange = [];
                var currentDate = moment(selectStartDate);
                var rangeEndDate = moment(selectEndDate);

                if (currentDate.isAfter(selectEndDate)) {
                    currentDate = moment(selectEndDate);
                    rangeEndDate = moment(selectStartDate);
                }
                
                while (currentDate.isSameOrBefore(rangeEndDate)) {
                    dateRange.push(currentDate.format("YYYY-MM-DD"));
                    currentDate.add(1, "days");
                }
                
                onDateFilterUpdated(dateRange);
                e.preventDefault();
            }
        }
    }

    function onMouseUp(e) {
        isMouseDown = false;
        selectStartDate = null;
        selectEndDate = null;
    }
}

function renderLineChart(data) {
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
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", "#555");

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
        .attr("stroke", "deepskyblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) { return x(d.Date) })
            .y(function (d) { return y(d.actual) })
        );
}

function onDateFilterUpdated(dateRange) {
    
}
