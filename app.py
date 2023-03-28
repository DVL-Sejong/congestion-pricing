import pandas as pd
import csv
from dataset import Dataset
from flask import Flask, request
from flask import render_template

app = Flask(__name__)
dataset = Dataset()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data/congestion/roads')
def data_congestion_roads():
    data = csv_to_list("static/data/bAllSpeedData_Transposed.csv")
    return data

@app.route('/data/districts/road_list')
def data_districts_road_list():
    return dataset.district_roads

@app.route('/data/districts/status', methods=['POST'])
def data_districts_status():
    params = request.get_json()
    date_range = params['date_range']
    time_range = params['time_range']

    dataset.set_date_filter(date_range[0], date_range[1])
    dataset.set_time_filter(time_range[0], time_range[1])
    return {
        'date_range': date_range,
        'time_range': time_range,
        **dataset.get_districts_status(),
    }

@app.route('/data/overview/status', methods=['POST'])
def data_overview_status():
    params = request.get_json()
    date_range = params['date_range']
    time_range = params['time_range']

    dataset.set_date_filter(date_range[0], date_range[1])
    dataset.set_time_filter(time_range[0], time_range[1])
    return {
        'date_range': date_range,
        'time_range': time_range,
        **dataset.get_overview_status(),
    }

@app.route('/data/congestion/roads/<int:day>')
def data_congestion_roads_day(day: int):
    data = csv_to_list("static/data/bAllSpeedData_Transposed.csv")
    df = pd.DataFrame(data).set_index("road_id")
    df_day = df[df.columns[day*24:(day+1)*24]]
    df_day.columns = range(0, 24)
    #return df_day.to_json() # {"시간(h)": {"도로번호": "속도(km/h)", ...}}
    return df_day.to_csv()

def csv_to_list(filename: str) -> list[dict]:
    with open(filename, "r") as file:
        reader = csv.DictReader(file)
        data = list(reader)
        return data

if __name__ == '__main__':
    app.run(debug=True)
