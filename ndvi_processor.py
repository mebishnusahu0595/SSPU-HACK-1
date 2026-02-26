import numpy as np

class NDVIProcessor:
    def __init__(self):
        pass

    def process_field_analysis(self, current_path, baseline_path, polygon_geojson):
        return {
            'damage_mask': np.zeros((10, 10)),
            'current_ndvi': np.zeros((10, 10)),
            'baseline_ndvi': np.ones((10, 10)),
            'damage_statistics': {
                'damage_percent': 15.0,
                'risk_score': 0.5
            },
            'area_statistics': {
                'total_area_ha': 10.5,
                'damaged_area_ha': 1.5
            }
        }
