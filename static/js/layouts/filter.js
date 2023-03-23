function renderDateFilter(data) {
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
            .data("date", dateString)
            .addClass("date-" + dateString);
        
        if (d.getDay() === 0 || d.getDay() === 6) {
            $day.addClass("weekend");
        }
        const actualObj = data.find(obj => obj.Date === dateString);
        if (actualObj) {
            $day.addClass("actual");
            $day.css("background-color", getTCIColor(actualObj.Actual));
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
        avg.css("background-color", getTCIColor(dayAverage[i].average));
        $calendar.append(avg);
    }
    const weekAverage = getWeeklyAverages(data);
    for (let i = 0; i < weekAverage.length; i++) {
        // const mapped = mapActualValue(weekAverage[i], min_actual, max_actual);
        const avg = $("<div class='avg actual weekly'></div>");
        avg.css("background-color", getTCIColor(weekAverage[i]));
        $calendar.find(".day").eq(6 + i * 7).after(avg);
    }
    // $calendar.append("<div class='dayname avg-dayname'>Avg.</div>");

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
        .on("click", "#filter-date .empty-box", onEmptyCellClicked)
        .on("mousedown", "#filter-date .calendar-day", onCalendarMouseDown)
        .on("mousemove", "#filter-date .calendar-day", onCalendarMouseMove)
        .on("mousemove", "#filter-date", e => e.preventDefault())
        .on("mouseup", onMouseUp);
    onEmptyCellClicked();

    function onEmptyCellClicked() {
        isMouseDown = false;
        selectStartDate = null;
        selectEndDate = null;
        onDateFilterUpdated([moment(startDate).format("YYYY-MM-DD"), moment(endDate).format("YYYY-MM-DD")], true);
    }

    function onCalendarMouseDown(e) {
        isMouseDown = true;
        selectStartDate = $(this).data("date");
        onDateFilterUpdated([selectStartDate]);
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
            }
        }
    }

    function onMouseUp(e) {
        isMouseDown = false;
        selectStartDate = null;
        selectEndDate = null;
    }
}

function renderTimeFilter(data) {
    var margin = { top: 0, right: 5, bottom: 17, left: 5 },
        width = 325 - margin.left - margin.right,
        height = 75 - margin.top - margin.bottom;

    if ($("#filter-time svg").length > 0)
        $("#filter-time svg").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#filter-time")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1)
        .domain(data.map(function (d) { return d.Time; }));
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text").attr("fill", "#555");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(data, function (d) { return +d.Actual; }), d3.max(data, function (d) { return +d.Actual; })])
        .range([height, 0]);
    // svg.append("g")
    //     .call(d3.axisLeft(y));

    // Add bars
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.Time); })
        .attr("y", function (d) { return y(d.Actual); })
        .attr("width", x.bandwidth())
        .attr("height", function (d) { return height - y(d.Actual); })
        .attr("fill", d => getTCIColor(d.Actual));
}

function onDateFilterUpdated(dateRange, isReset=false) {
    const startDate = dateRange[0];
    const endDate = dateRange.slice(-1)[0];
    
    let value = startDate + " ~ " + endDate;
    if (dateRange.length === 1)
        value = startDate;

    $("#filter-period").val(value);

    // 선택 기간 시각화
    $("#filter-date .day").removeClass("selected").removeClass("start-date").removeClass("end-date");
    if (!isReset) {
        for (dateString of dateRange)
            $("#filter-date .day.date-" + dateString).addClass("selected");
        $("#filter-date .day.date-" + startDate).addClass("start-date");
        $("#filter-date .day.date-" + endDate).addClass("end-date");
    }

    // 데이터 필터링
    filteredData = data_city_tci_time.filter(item => {
        const date = moment(item.Time.split(" ")[0]);
        return date >= moment(startDate) && date <= moment(endDate);
    });

    // 시간 필터 렌더링
    const data_city_tci_time_grouped = parseTimeSeasonality(filteredData);
    renderTimeFilter(data_city_tci_time_grouped);
}
