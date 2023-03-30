let data_city_tci_date; // 도시 전체의 날짜별 TCI
let data_city_tci_time; // 도시 전체의 날짜&시간별 TCI
let data_district_tci_time; // 하위 행정구역들의 날짜&시간별 TCI
let district_roads; // 하위 행정구역에 존재하는 도로들
let district_center; // 하위 행정구역들의 폴리곤 무게중심
let district_layers; // 하위 행정구역들의 폴리곤 레이어
let district_policy; // 하위 행정구역별로 적용된 혼잡세 정책
let pricing_cost_list; // 혼잡세 가격 옵션들
let max_pricing_cost; // 최대 혼잡세 가격

// 기본 혼잡세 정책
const defaultPolicy = {
    'scheme': 'jddt', // Zonal based
    'cost': 0, // 부과하지 않음
};

// 필터 옵션들
const filterOptions = {
    'date_range': [0, -1],
    'time_range': [0, 23],
};

// 시각화 옵션들
const visualizationOptions = {
    "RoadNetworkCongestion": {},
    "NetworkTCI": {},
    "AverageTCI": {},
}

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

function getTickWidth(selection) {
    const ticks = selection.selectAll(".tick text")
        .nodes()
        .map(function(d) {
            return +d.textContent;
        });
    return scale(ticks[1]) - scale(ticks[0]);
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

function getTCITextColor(tci) {
    if (tci > 0.8)
        return "#555";
    else if (tci > 0.6)
        return "#555";
    else if (tci > 0.4)
        return "#FFF";
    else if (tci > 0.2)
        return "#FFF";
    else if (tci > 0.0)
        return "#FFF";
}
