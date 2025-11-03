import requests

CLIENT_ID = "c12ac4f0-32b4-46c1-8812-d75a1abb9d85"
CLIENT_SECRET = "NgCPggv7nZmqdQvgCiSUMAu8cz5BOXDf"

def get_token():
    url = "https://services.sentinel-hub.com/oauth/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    response = requests.post(url, data=payload)
    response.raise_for_status()
    return response.json()["access_token"]

ACCESS_TOKEN = get_token()




print("✅ Access token fetched")

with open("access_token.txt", "w") as f:
    f.write(ACCESS_TOKEN)
print("✅ Access token saved in access_token.txt")

