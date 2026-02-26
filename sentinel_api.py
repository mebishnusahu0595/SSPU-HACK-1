import random
import numpy as np

class SentinelHubAPI:
    def __init__(self):
        pass

    def calculate_area_hectares(self, coordinates):
        return 10.5

    def get_field_images(self, coordinates, event_date):
        return {
            'current': b'mock_current_image_data',
            'baseline': b'mock_baseline_image_data'
        }
