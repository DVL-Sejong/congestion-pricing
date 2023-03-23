let data_city_tci_date;
let data_city_tci_time;

d3.csv("/static/data/sanfrancisco/city_tci_date.csv", data => {
    data_city_tci_date = data;
    renderDateFilter(data_city_tci_date);
});

d3.csv("/static/data/sanfrancisco/city_tci_time.csv", data => {
    data_city_tci_time = parseTimeSeasonality(data);
    renderTimeFilter(data_city_tci_time);
});

function parseTimeSeasonality(data) {
    // 날짜를 제외한 시간 값만 추출
    const timeData = data.map(item => ({
        'Time': parseInt(item.Time.split(" ")[1].split(":")[0]),
        'Actual': parseFloat(item.Actual) || 0.0,
    }));

    // 데이터를 시간 순으로 정렬
    timeData.sort((a, b) => a.Time - b.Time);

    // 시간 별 Actual 값 합산
    const count = new Array(24).fill(0);
    let result = timeData.reduce((acc, { Time, Actual }) => {
        const lastIndex = acc.length - 1;
        if (lastIndex < 0 || acc[lastIndex].Time !== Time)
            acc.push({ Time, Actual });
        else
            acc[lastIndex].Actual += Actual;
        if (Actual != 0.0)
            count[Time]++;
        return acc;
    }, []);

    // 시간 별 Actual 값 평균 계산
    result = result.map(item => ({
        'Time': item.Time,
        'Actual': item.Actual / count[item.Time]
    }))

    return result;
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
