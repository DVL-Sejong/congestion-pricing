function renderCalendar(data) {
    let startDate = new Date("2008-05-17");
    let endDate = new Date("2008-06-09");

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

    // Find the min and max Actual values
    let min_actual = Math.min(...data.map(item => item['Actual']));
    let max_actual = Math.max(...data.map(item => item['Actual']));

    // Define a function to map Actual values to a range of 0 to 1
    function mapActualValue(actual, minActual, maxActual) {
        return (actual - minActual) / (maxActual - minActual);
    }

    // Map the Actual values to a range of 0 to 1
    data.forEach(item => {
        item['Mapped'] = mapActualValue(item['Actual'], min_actual, max_actual);
    });

    // 캘린더 렌더링
    const $calendar = $("#filter-datetime");
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().substring(0, 10);
        const day = $("<div class='day'><span class='date'>" + months[d.getMonth()+1] + "<br>" + d.getDate() + "</span></div>");
        if (d.getDay() === 0 || d.getDay() === 6) {
            day.addClass("weekend");
        }
        const actualObj = data.find(obj => obj.Date === dateString);
        if (actualObj) {
            day.addClass("actual");
            day.css("background-color", getColor(actualObj.Mapped));
        }
        $calendar.append(day);
    }

    startDate = new Date("2008-05-17");
    endDate = new Date("2008-06-09");

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
        const mapped = mapActualValue(dayAverage[i].average, min_actual, max_actual);
        const avg = $("<div class='avg actual dayofweek'></div>");
        avg.css("background-color", getColor(mapped));
        $calendar.append(avg);
    }
    const weekAverage = getWeeklyAverages(data);
    for (let i = 0; i < weekAverage.length; i++) {
        const mapped = mapActualValue(weekAverage[i], min_actual, max_actual);
        const avg = $("<div class='avg actual weekly'></div>");
        avg.css("background-color", getColor(mapped));
        $calendar.find(".day").eq(6 + i * 7).after(avg);
    }
    // $calendar.append("<div class='dayname avg-dayname'>Avg.</div>");

    function getColor(d) {
        return "rgba(255, 50, 50, " + d + ")";
        if (d <= 1 && d > 0.8) {
            return "#ff0000"
        } else if (d <= 0.8 && d > 0.6) {
            return "#feafaf";
        } else if (d <= 0.6 && d > 0.4) {
            return "#Fe807f";
        } else if (d <= 0.4 && d > 0.2) {
            return "#Fd403f";
        } else if (d <= 0.2 && d > 0) {
            return "#FD0100";
        }
    }

    function getDayOfWeekAverage(data) {
        const dayOfWeekTotal = [0, 0, 0, 0, 0, 0, 0];
        const dayOfWeekCount = [0, 0, 0, 0, 0, 0, 0];

        data.forEach(entry => {
            const date = new Date(entry.Date);
            const dayOfWeek = date.getDay();
            dayOfWeekTotal[dayOfWeek] += parseInt(entry.Actual);
            dayOfWeekCount[dayOfWeek]++;
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

            sum += data[i].Actual;
            count++;

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
}

class Calendar{
    constructor(selection, data, config = {}) {
        let self = this;
        this.selection = selection;
        this.data = data;

        // Graph configuration
        this.cfg = {
            'margin': {'top': 30, 'right': 30, 'bottom': 10, 'left': 50},
            'key': 'key',
            'datefield': 'date',
            'dateformat': '%d-%m-%Y', // https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
            'title': false,
            'source': false,
            'rectsize': 10,
            'colorScale': d3.interpolateRdBu,
            'emptycolor': '#EEE',
            'year': false,
            'mondaystart': false,
            'weekdayformat': '%a',
            'monthformat': '%m'
        };
        Object.keys(config).forEach(function(key) {
            if(config[key] instanceof Object && config[key] instanceof Array === false){
                Object.keys(config[key]).forEach(function(sk) {
                    self.cfg[key][sk] = config[key][sk];
                });
            } else self.cfg[key] = config[key];
        });

        this.cfg.width = parseInt(this.selection.node().offsetWidth) - this.cfg.margin.left - this.cfg.margin.right,
        this.cfg.height = parseInt(this.selection.node().offsetHeight)- this.cfg.margin.top - this.cfg.margin.bottom;

        this.extentdates = d3.extent(this.data, function(d){ return d[self.cfg.datefield]});
        this.year = self.cfg.year ? self.cfg.year : + self.extentdates[0].substr(0,4);
        this.cfg.rectsize = this.cfg.width/53 < this.cfg.height/7 ? this.cfg.width/53 : this.cfg.height/7;
        this.dayCalc = this.cfg.mondaystart ? function(d) { return (d.getDay() + 6) % 7; } : function(d) { return d.getDay(); }
        this.weekCalc = this.cfg.mondaystart ? d3.timeFormat("%W") : d3.timeFormat("%U");
        this.cScale = d3.scaleSequential(this.cfg.colorScale);

        this.weekDay = d3.timeFormat(self.cfg.weekdayformat);
        this.monthName = d3.timeFormat(self.cfg.monthformat);


        this.initGraph();
    }
    initGraph() {
        var self = this;

        this.cScale.domain(d3.extent(this.data, function(d){ return +d[self.cfg.key]}).reverse())

        this.svg = this.selection.append('svg')
            .attr("class", "chart calendar")
            .attr("viewBox", "0 0 "+(this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)+" "+(this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom))
            .attr("width", this.cfg.width + this.cfg.margin.left + this.cfg.margin.right)
            .attr("height", this.cfg.height + this.cfg.margin.top + this.cfg.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + (self.cfg.margin.left) + "," + (self.cfg.margin.top) + ")");

        // TITLE
        if(self.cfg.title){
            this.svg.append('text')
                .attr('class', 'title label')
                .attr('text-anchor', 'middle')
                .attr('transform', 'translate('+ (self.cfg.width/2) +',20)')
                .text(self.cfg.title)
        }

        // SOURCE
        if(self.cfg.source){
            this.svg.append('text')
                .attr('class', 'source label')
                .attr('transform', 'translate('+ (self.cfg.margin.left) +','+(self.cfg.height + self.cfg.margin.top + self.cfg.margin.bottom - 5)+')')
                .html(self.cfg.source)

        }

        this.rects = this.g.selectAll("rect")
            .data(function(d) { return d3.timeDays(new Date(self.year, 0, 1), new Date(self.year + 1, 0, 1)); })
            .enter().append("rect")
            .attr("width", self.cfg.rectsize)
            .attr("height", self.cfg.rectsize)
            .attr("x", function(d) { return self.weekCalc(d) * self.cfg.rectsize; })
            .attr("y", function(d) { return self.dayCalc(d) * self.cfg.rectsize; })
            .attr("fill", self.cfg.emptycolor)

        var nesteddata = d3.nest()
            .key(function(d) { return d[self.cfg.datefield]; })
            .rollup(function(d) { return +d[0][self.cfg.key]; })
            .object(this.data);

        this.rects.filter(function(d) { return d.yyyymmdd() in nesteddata; })
            .attr("fill", function(d) { return self.cScale(nesteddata[d.yyyymmdd()]); })
            .append("title")
            .text(function(d) { return d.yyyymmdd() + ": " + nesteddata[d.yyyymmdd()]; });


        self.drawLabels();
    }

    drawLabels() {
        var self = this;

        var j_start = this.cfg.mondaystart ? 1 : 0;

        for(var j = j_start; j < j_start+7; j++){
            self.g.append("text")
                .attr("class", 'label')
                .style("text-anchor", "end")
                .attr("dy", self.cfg.rectsize * (j - j_start) + self.cfg.rectsize*0.7)
                .attr("dx", "-1em")
                .text(self.weekDay(new Date(2018, 0, j)));
        }
        for(var j = 0; j < 12; j++){
            self.g.append("text")
                .attr("class", 'label')
                .style("text-anchor", "middle")
                .attr("dy", -5)
                .attr("dx", (j*self.cfg.rectsize*4.4) + (self.cfg.rectsize*2.2))
                .text(self.monthName(new Date(2018, j, 1)));
        }
    }

}

Date.prototype.yyyymmdd = function(joinchar='-') {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
          (mm>9 ? '' : '0') + mm,
          (dd>9 ? '' : '0') + dd
         ].join(joinchar);
};
