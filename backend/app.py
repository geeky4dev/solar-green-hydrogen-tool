from flask import Flask, request, jsonify
from flask_cors import CORS
from math import radians, cos, sin, asin, sqrt
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

def calculate_solar_irradiation(lat, lon):
    try:
        base = 1000
        attenuation = max(0.2, cos(radians(abs(lat))) ** 1.5)
        monthly = np.full(12, base * attenuation / 12)
        total_annual = monthly.sum()
        return total_annual, monthly.tolist()
    except Exception as e:
        print("Error en cálculo de irradiación:", e)
        traceback.print_exc()
        raise

def calculate_distance_to_coast(lat, lon):
    coast_points = [
        (0, 0),           # Ecuador
        (0, -78.5),       # Costa Pacífico (Ecuador)
        (52.0, 4.0),      # Holanda
        (-24.5, -70.0),   # Chile
        (33.0, -118.0),   # Los Ángeles
        (-29.0, 17.0),    # Namibia
    ]
    try:
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371  # km
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
            c = 2 * asin(sqrt(a))
            return R * c

        distances = [haversine(lat, lon, c_lat, c_lon) for c_lat, c_lon in coast_points]
        return round(min(distances), 2)
    except Exception as e:
        print("Error en cálculo de distancia a costa:", e)
        traceback.print_exc()
        raise

@app.route("/solar", methods=["GET"])
def solar_data():
    try:
        lat_str = request.args.get("lat")
        lon_str = request.args.get("lon")

        if lat_str is None or lon_str is None:
            return jsonify({"error": "Parámetros lat y lon son requeridos"}), 400

        lat = float(lat_str)
        lon = float(lon_str)

        total_annual, monthly_values = calculate_solar_irradiation(lat, lon)
        avg_monthly = total_annual / 12
        avg_daily = total_annual / 365
        distance_to_coast = calculate_distance_to_coast(lat, lon)

        return jsonify({
            "data": {
                "latitude": lat,
                "longitude": lon,
                "annual_solar_irradiation_kWh_per_m2": round(total_annual, 2),
                "average_monthly_kWh_per_m2": round(avg_monthly, 2),
                "average_daily_kWh_per_m2": round(avg_daily, 2),
                "monthly_values_kWh_per_m2": [round(v, 2) for v in monthly_values],
                "distance_to_coast_km": distance_to_coast,
            }
        })
    except Exception as e:
        print("Error en /solar:", e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
















