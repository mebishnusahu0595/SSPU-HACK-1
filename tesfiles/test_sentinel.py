# test_sentinel.py
import requests
import numpy as np
from PIL import Image
import io
import matplotlib.pyplot as plt

# ===== CONFIG =====
ACCESS_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ3dE9hV1o2aFJJeUowbGlsYXctcWd4NzlUdm1hX3ZKZlNuMW1WNm5HX0tVIn0.eyJleHAiOjE3NjE0NzU3MjUsImlhdCI6MTc2MTQ3MjEyNSwianRpIjoiODYzYTljOTAtMDNlZC00YWU4LWFiNTItZjFmMDAzYWY4MjkzIiwiaXNzIjoiaHR0cHM6Ly9zZXJ2aWNlcy5zZW50aW5lbC1odWIuY29tL2F1dGgvcmVhbG1zL21haW4iLCJhdWQiOiJodHRwczovL2FwaS5wbGFuZXQuY29tLyIsInN1YiI6IjRkNmI0MzllLWVmNTctNGZiMi1hZWY1LTE4ODYxMDM4MWRkZiIsInR5cCI6IkJlYXJlciIsImF6cCI6ImMxMmFjNGYwLTMyYjQtNDZjMS04ODEyLWQ3NWExYWJiOWQ4NSIsInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsImNsaWVudEhvc3QiOiIyMjMuMTgxLjc2LjExIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwbF9wcm9qZWN0IjoiMTA0ZTE2NTQtZDE5MS00YWZiLTk4MjAtZWE5OTdhODA5N2M1IiwicHJlZmVycmVkX3VzZXJuYW1lIjoic2VydmljZS1hY2NvdW50LWMxMmFjNGYwLTMyYjQtNDZjMS04ODEyLWQ3NWExYWJiOWQ4NSIsImNsaWVudEFkZHJlc3MiOiIyMjMuMTgxLjc2LjExIiwiYWNjb3VudCI6IjEwNGUxNjU0LWQxOTEtNGFmYi05ODIwLWVhOTk3YTgwOTdjNSIsInBsX3dvcmtzcGFjZSI6IjI3YjVjMjU0LTM2OTctNDkxNy1iMWUxLWY4NDhkNTM5MmY2ZCIsImNsaWVudF9pZCI6ImMxMmFjNGYwLTMyYjQtNDZjMS04ODEyLWQ3NWExYWJiOWQ4NSJ9.mCwsdJcpUHx78U7y1S-UDoJXM_bohefmETYMraGHSAcWBSKMnbvX55b9xRIRvoUzobE8ry3ObMEi44hCZ3rQNqtsPD75tGohTdgkCWdvKJ_akD-ygFBjBd6grCMVGy9uGkq7Q1N1z2SAhXAaqvTtpqO_7dLKVcuwEyUPB-ABNi0EiTMl7Rkce5K1RRg2BZwyjgbCapnsbkU6A6rGh-pCEqnlweaHYdiVdEGgFoLUHzPkd136ESrHxlnd6ZCYbGYKxawtVMdNc0LSUfRGCt2zcIZhl0O2J40bG-pQFwXcdODB3YmP__GrtAtEcsOC2uZkj2QHvt-VLwvMXpQFTRvysA"
BBOX = [77.2, 21.1, 77.3, 21.2]  # [minLon, minLat, maxLon, maxLat] — change to your farm coordinates
FROM_DATE = "2025-08-01T00:00:00Z"
TO_DATE = "2025-08-31T23:59:59Z"

# ===== API Request =====
url = "https://services.sentinel-hub.com/api/v1/process"
headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

payload = {
    "input": {
        "bounds": {"bbox": BBOX},
        "data": [{
            "type": "sentinel-2-l2a",
            "dataFilter": {"timeRange": {"from": FROM_DATE, "to": TO_DATE}}
        }]
    },
    "output": {
        "width": 512,
        "height": 512,
        "responses": [{"identifier": "default", "format": {"type": "image/png"}}]
    },
    "evalscript": """
    //VERSION=3
    function setup() {
        return {
            input: ["B04", "B08"],
            output: { bands: 1 }
        };
    }

    function evaluatePixel(sample) {
        let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
        return [ndvi];
    }
    """
}

print("🔄 Requesting NDVI data from Sentinel Hub...")
response = requests.post(url, headers=headers, json=payload)

# ===== Check Response =====
print("Status:", response.status_code)
if response.status_code != 200:
    print("Error details:", response.text)
    exit()

# ===== Convert to image =====
image_data = Image.open(io.BytesIO(response.content)).convert("L")
image_array = np.array(image_data)

# ===== Normalize (0-1) =====
image_array = (image_array - image_array.min()) / (image_array.max() - image_array.min())

# ===== Show and Save =====
plt.imshow(image_array, cmap="RdYlGn")
plt.title("NDVI Map")
plt.axis("off")
plt.savefig("temp/farm_ndvi_fixed.png")
plt.show()

print("✅ NDVI image saved as temp/farm_ndvi_fixed.png")
