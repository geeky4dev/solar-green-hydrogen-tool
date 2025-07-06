import requests

# Lista de ubicaciones con nombre y coordenadas
locations = {
    "Siberia": {"lat": 60.0, "lon": 105.0},
    "Scandinavia": {"lat": 59.9, "lon": 10.7},
    "Ecuador": {"lat": 0.18, "lon": -78.47},
    "Atacama Desert": {"lat": -24.5, "lon": -69.25},
    "Berlin": {"lat": 52.52, "lon": 13.405},
    "Phoenix": {"lat": 33.45, "lon": -112.07},
    "Upington": {"lat": -28.4, "lon": 21.25},
}

for name, coords in locations.items():
    print(f"Testing {name} at {coords}")
    try:
        response = requests.get("http://127.0.0.1:5000/solar", params=coords)
        response.raise_for_status()
        data = response.json()["data"]

        print(f"  Annual Solar Irradiation: {data['total_annual']} kWh/m²/year")
        print(f"  Monthly Avg: {data['average_monthly']} kWh/m²/month")
        print(f"  Daily Avg: {data['average_daily']} kWh/m²/day")
        print(f"  Distance to Coast: {data['distance_to_coast_km']} km")
    except Exception as e:
        print(f"  Exception: {e}")
    print("-" * 40)


