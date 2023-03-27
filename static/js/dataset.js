let data_city_tci_date;
let data_city_tci_time;
let data_district_tci_time;
let district_roads;

const filterOptions = {
    'date_range': [0, -1],
    'time_range': [0, 24],
};

$(document).ready(function() {
    d3.csv("/static/data/sanfrancisco/city_tci_date.csv", data => {
        data_city_tci_date = data;
        renderDateFilter(data_city_tci_date);
    });
    
    d3.csv("/static/data/sanfrancisco/city_tci_time.csv", data => {
        data_city_tci_time = data;
        const data_city_tci_time_grouped = parseTimeSeasonality(data);
        renderTimeFilter(data_city_tci_time_grouped);
    });

    d3.csv("/static/data/sanfrancisco/district_tci_time_transposed.csv", data => {
        data_district_tci_time = data;
        const data_district_tci_time_grouped = parseTimeSeasonality(data_district_tci_time, 1);
        renderParallelCoordinates(data_district_tci_time_grouped);
    });

    d3.json("/data/districts/road_list", data => {
        district_roads = data;
    });

    renderDistrictList(filterOptions);
});

function parseTimeSeasonality(data_, axis=0) {
    const data = JSON.parse(JSON.stringify(data_));

    if (axis === 0) {
        // 날짜를 제외한 시간 값만 추출
        const timeData = data.map(item => {
            const returns = {
                'Time': parseInt(item['Time'].split(" ")[1].split(":")[0]),
            };
            for (let key of Object.keys(item).slice(1))
                returns[key] = parseFloat(item[key]) || 0.0;
            return returns;
        });

        // 데이터를 시간 순으로 정렬
        timeData.sort((a, b) => a.Time - b.Time);

        // 시간 별 TCI 값 합산
        const count = new Array(24).fill({});
        let result = timeData.reduce((acc, item) => {
            const lastIndex = acc.length - 1;
            if (lastIndex < 0 || acc[lastIndex]['Time'] !== item['Time']) {
                acc.push(item);
                for (let key of Object.keys(item).slice(1))
                    if (item[key] !== 0.0) // 결측치는 제외하고 카운트함
                        count[item['Time']][key] = 1;
            } else {
                for (let key of Object.keys(item).slice(1)) {
                    acc[lastIndex][key] += item[key];
                    if (item[key] !== 0.0) // 결측치는 제외하고 카운트함
                        count[item['Time']][key]++;
                }
            }
            
            return acc;
        }, []);

        // 시간 별 TCI 값 평균 계산
        result = result.map(item => {
            const returns = {
                'Time': item['Time'],
            };
            for (let key of Object.keys(item).slice(1))
                returns[key] = item[key] / count[item['Time']][key];
            return returns;
        });

        return result;
    } else if (axis === 1) {
        return data.map(item => {
            // 이름 키 변경
            const name = item[Object.keys(item)[0]];
            item['name'] = name;
            delete item[''];
            
            const count = new Array(24).fill(0);
            for (datetime of Object.keys(item)) {
                if (datetime === "name")
                    continue;
                
                if (item[datetime].length > 0) {
                    // 날짜를 제외한 시간 값만 추출
                    const time = parseInt(datetime.split(" ")[1].split(":")[0]);

                    // 시간 별 TCI 값 합산
                    if (time in item)
                        item[time] += parseFloat(item[datetime]);
                    else
                        item[time] = parseFloat(item[datetime]);
                    count[time]++;
                }
                delete item[datetime];
            }

            // 시간 별 TCI 값 평균 계산
            for (time of Object.keys(item)) {
                if (time == "name")
                    continue;
                item[time] /= count[time];
            }

            return item;
        });
    }
}

function getTCIColor(tci) {
    if (tci > 0.8)
        return "#FDEDEC";
    else if (tci > 0.6)
        return "#FADBD8";
    else if (tci > 0.4)
        return "#F1948A";
    else if (tci > 0.2)
        return "#EC7063";
    else if (tci > 0.0)
        return "#E74C3C";
}
