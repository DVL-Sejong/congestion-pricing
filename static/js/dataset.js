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
        renderParallelCoordinates(data_district_tci_time_grouped, filterOptions);
    });

    d3.json("/data/districts/road_list", data => {
        district_roads = data;
    });

    d3.json("/data/districts/center_coords", data => {
        district_center = data;
    });

    renderDistrictList(filterOptions);

    renderOverview(filterOptions);

    d3.csv("/static/data/sanfrancisco/delay_sf.csv", data => {
        pricing_cost_list = data.map(d => parseInt(+d.Toll / 60));
        max_pricing_cost = Math.max.apply(Math, data.map(d => parseInt(+d.Toll / 60)));
    });
});
