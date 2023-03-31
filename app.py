# from __future__ import annotations
import csv
from dataset import Dataset
from flask import Flask, request, abort
from flask import render_template

app = Flask(__name__)
dataset = Dataset()

@app.route('/')
def index():
    """ 메인 페이지 """
    return render_template('index.html')

# @app.route('/data/congestion/roads')
# def data_congestion_roads():
#     data = csv_to_list("static/data/bAllSpeedData_Transposed.csv")
#     return data

# @app.route('/data/congestion/roads/<int:day>')
# def data_congestion_roads_day(day: int):
#     data = csv_to_list("static/data/bAllSpeedData_Transposed.csv")
#     df = pd.DataFrame(data).set_index("road_id")
#     df_day = df[df.columns[day*24:(day+1)*24]]
#     df_day.columns = range(0, 24)
#     #return df_day.to_json() # {"시간(h)": {"도로번호": "속도(km/h)", ...}}
#     return df_day.to_csv()

@app.route('/data/<string:city>/districts/road_list')
def data_districts_road_list(city: str):
    """ 행정구역별 도로 리스트 """

    city_dataset = get_city_dataset(city)
    if city_dataset is None:
        return abort(404)
    
    return city_dataset.district_roads

@app.route('/data/<string:city>/districts/center_coords')
def data_districts_center_coords(city: str):
    """ 행정구역별 중심 좌표 """

    city_dataset = get_city_dataset(city)
    if city_dataset is None:
        return abort(404)
    
    return city_dataset.center_coords

@app.route('/data/<string:city>/districts/status', methods=['POST'])
def data_districts_status(city: str) -> dict[str, str | dict[int, float] | list[str]]:
    """
    행정구역별 상태\n
    날짜, 시간 필터 적용 시 갱신되는데, 단시간에 많은 요청이 올 수 있으므로
    필터 세팅을 함께 반환하여 이전 필터 세팅에 대한 시각화를 하지 않도록 함
    """

    city_dataset = get_city_dataset(city)
    if city_dataset is None:
        return abort(404)
    
    params = request.get_json()
    date_range = params['date_range']
    time_range = params['time_range']

    # 날짜, 시간 필터
    city_dataset.set_date_filter(date_range[0], date_range[1])
    city_dataset.set_time_filter(time_range[0], time_range[1])

    return {
        'date_range': date_range,
        'time_range': time_range,
        **city_dataset.get_districts_status(),
    }

@app.route('/data/<string:city>/overview/status', methods=['POST'])
def data_overview_status(city: str) -> dict[str, str | dict[int, float | int]]:
    """
    도시 전체 상태\n
    날짜, 시간 필터 적용 시 갱신되는데, 단시간에 많은 요청이 올 수 있으므로
    필터 세팅을 함께 반환하여 이전 필터 세팅에 대한 시각화를 하지 않도록 함
    """

    city_dataset = get_city_dataset(city)
    if city_dataset is None:
        return abort(404)
    
    params = request.get_json()
    date_range = params['date_range']
    time_range = params['time_range']

    # 날짜, 시간 필터
    city_dataset.set_date_filter(date_range[0], date_range[1])
    city_dataset.set_time_filter(time_range[0], time_range[1])

    return {
        'date_range': date_range,
        'time_range': time_range,
        **city_dataset.get_overview_status(),
    }

def csv_to_list(filename: str) -> list[dict]:
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        data = list(reader)
        return data

def get_city_dataset(city: str) -> Dataset.CityDataset:
    city_datasets = {
        # "gangnam": dataset.gangnam,
        "sanfrancisco": dataset.sanfrancisco,
    }
    if city not in city_datasets:
        return None
    return city_datasets[city]

if __name__ == '__main__':
    app.run(debug=True)
