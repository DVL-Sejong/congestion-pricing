import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from shapely.geometry import MultiPolygon, shape

class Dataset():
    def __init__(self):
        # 혼잡으로 분류하는 기준 TCI
        self._congestion_tci = 0.4

        # 데이터셋 파일 이름
        self._file_names = {
            "ffs": "static/data/sanfrancisco/ffs_san.csv",
            "speed": "static/data/sanfrancisco/speed_san.csv",
            "districts": "static/data/sanfrancisco/Analysis Neighborhoods(b).geojson",
            "district_road_map": "static/data/sanfrancisco/districts/%s.csv",

            "road_tci_date": "static/data/sanfrancisco/road_tci_date.csv",
            "road_tci_time": "static/data/sanfrancisco/road_tci_time.csv",
            "city_tci_date": "static/data/sanfrancisco/city_tci_date.csv",
            "city_tci_time": "static/data/sanfrancisco/city_tci_time.csv",
            "district_tci_date": "static/data/sanfrancisco/district_tci_date.csv",
            "district_tci_time": "static/data/sanfrancisco/district_tci_time.csv",
            "district_tci_date_transposed": "static/data/sanfrancisco/district_tci_date_transposed.csv",
            "district_tci_time_transposed": "static/data/sanfrancisco/district_tci_time_transposed.csv",
        }

        # 데이터셋 로드
        with open(self._file_names['districts']) as file:
            geodata = json.load(file)

        # FFS 데이터 로드
        self._ffs_df = pd.read_csv(self._file_names['ffs'])

        # TCI 데이터 로드
        self._road_tci_time_df = pd.read_csv(self._file_names['road_tci_time']) # 각 도로의 시간별 TCI
        self._road_tci_time_df['Time'] = pd.to_datetime(self._road_tci_time_df['Time'])

        # District 이름 리스트
        self.district_list = [feature['properties']['nhood'] for feature in geodata['features']]

        # District 하위 도로의 리스트
        self.district_roads = {}
        for district in self.district_list:
            filename = district.replace(" ", "_").replace("/", "_")
            if not os.path.exists(self._file_names['district_road_map'] % filename):
                continue
            self.district_roads[district] = pd.read_csv(self._file_names['district_road_map'] % filename, dtype={'Road': str})['Road'].tolist()

        # District 폴리곤들의 중심 좌표 리스트
        self.center_coords = {}
        for feature in geodata['features']:
            self.center_coords[feature['properties']['nhood']] = self.__get_center_coords(feature)

        # 날짜, 시간 필터의 초기값으로 전체 범위 적용
        self._start_date = min(self._road_tci_time_df.loc[:, 'Time'])
        self._end_date = max(self._road_tci_time_df.loc[:, 'Time'])
        self._start_time = 0
        self._end_time = 24
    
    def __get_center_coords(self, feature: dict):
        geom = shape(feature['geometry'])
        if isinstance(geom, MultiPolygon):
            center = geom.centroid
            return (center.x, center.y)
        raise(ValueError)

    def _filter(self, df: pd.DataFrame, date_only=False):
        field = 'Date' if 'Date' in df.columns else 'Time' # 필터링할 필드
        filtered = df[(df[field] >= self._start_date) & (df[field] <= self._end_date)] # 날짜 필터
        if not date_only:
            filtered = df[(df[field].dt.hour >= self._start_time) & (df[field].dt.hour <= self._end_time)] # 시간 필터
        return filtered

    def set_date_filter(self, start_date: str, end_date: str):
        if start_date == 0 or end_date == -1:
            return
        if len(start_date) == len("0000-00-00"):
            self._start_date = datetime.strptime(start_date, "%Y-%m-%d")
            self._end_date = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
        else:
            self._start_date = datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
            self._end_date = datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")

    def set_time_filter(self, start_time: int, end_time: int):
        self._start_time = start_time
        self._end_time = end_time
    
    def get_districts_status(self):
        road_tci_time_df = self._filter(self._road_tci_time_df) # 날짜, 시간 필터 적용
        status = { # 초기화
            'tci': {x: np.nan for x in self.district_roads.keys()},
            'crr': {x: 0 for x in self.district_roads.keys()},
            'sorted': list(self.district_roads.keys()),
        }

        min_series = road_tci_time_df.min()
        for district in self.district_roads.keys():
            # 조건 시간대의 TCI 평균 계산
            status['tci'][district] = road_tci_time_df[self.district_roads[district]].sum().sum() / road_tci_time_df[self.district_roads[district]].count().sum()
            # 조건 시간대 안에서 한 번이라도 혼잡 상태에 해당한 도로들은 모두 혼잡 도로로 카운트
            for road in self.district_roads[district]:
                if min_series[road] <= self._congestion_tci:
                    status['crr'][district] += 1
            status['crr'][district] /= len(self.district_roads[district])

        # 혼잡 도로순 정렬
        status['sorted'] = sorted(status['sorted'], key=lambda x: status['crr'][x], reverse=True) # 내림차순
        status['sorted'] = sorted(status['sorted'], key=lambda x: round(status['tci'][x], 2)) # 오름차순

        return status

    def get_overview_status(self):
        road_tci_time_df = self._filter(self._road_tci_time_df, date_only=True) # 날짜 필터 적용
        status = { # 초기화
            'tci': {x: np.nan for x in range(0, 24)},
            'nornn': {x: 0 for x in range(0, 24)},
        }

        # 시간 단위 평균 TCI
        road_tci_time_df['Hour'] = road_tci_time_df['Time'].dt.hour
        road_tci_time_df = road_tci_time_df.groupby('Hour').mean(numeric_only=True)
        status['tci'] = road_tci_time_df.mean(axis=1).to_dict()

        # 혼잡 도로 카운트
        status['nornn'] = road_tci_time_df.applymap(lambda x: 1 if x <= self._congestion_tci else 0).sum(axis=1).to_dict()

        return status
