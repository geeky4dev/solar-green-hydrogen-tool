import ElectrolyzerSizingTool from "./ElectrolyzerSizingTool";
import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import SolarChart from "./SolarChart";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const sunnyPlaces = [
  {
    name: "Upington, South Africa",
    lat: -28.4511,
    lon: 21.256,
    data: {
      monthly: {
        Jan: 220, Feb: 210, Mar: 230, Apr: 250, May: 270, Jun: 280,
        Jul: 275, Aug: 260, Sep: 240, Oct: 230, Nov: 215, Dec: 205,
      },
      distance_to_coast_km: 350,
    },
  },
  {
    name: "Yuma, Arizona",
    lat: 32.6927,
    lon: -114.6277,
    data: {
      monthly: {
        Jan: 240, Feb: 230, Mar: 260, Apr: 280, May: 300, Jun: 310,
        Jul: 305, Aug: 290, Sep: 270, Oct: 260, Nov: 245, Dec: 235,
      },
      distance_to_coast_km: 90,
    },
  },
  {
    name: "Phoenix, Arizona",
    lat: 33.4484,
    lon: -112.074,
    data: {
      monthly: {
        Jan: 230, Feb: 220, Mar: 250, Apr: 270, May: 290, Jun: 300,
        Jul: 295, Aug: 280, Sep: 260, Oct: 250, Nov: 235, Dec: 225,
      },
      distance_to_coast_km: 120,
    },
  },
  {
    name: "Aswan, Egypt",
    lat: 24.0889,
    lon: 32.8998,
    data: {
      monthly: {
        Jan: 280, Feb: 270, Mar: 300, Apr: 320, May: 340, Jun: 350,
        Jul: 345, Aug: 330, Sep: 310, Oct: 300, Nov: 285, Dec: 275,
      },
      distance_to_coast_km: 700,
      distance_to_nile_km: 5,
    },
  },
  {
    name: "Luxor, Egypt",
    lat: 25.6872,
    lon: 32.6396,
    data: {
      monthly: {
        Jan: 275, Feb: 265, Mar: 295, Apr: 315, May: 335, Jun: 345,
        Jul: 340, Aug: 325, Sep: 305, Oct: 295, Nov: 280, Dec: 270,
      },
      distance_to_coast_km: 650,
      distance_to_nile_km: 2,
    },
  },
  {
    name: "Atacama Desert, Chile",
    lat: -24.5,
    lon: -69.25,
    data: {
      monthly: {
        Jan: 310, Feb: 300, Mar: 320, Apr: 330, May: 350, Jun: 360,
        Jul: 355, Aug: 340, Sep: 320, Oct: 310, Nov: 295, Dec: 285,
      },
      distance_to_coast_km: 60,
    },
  },
  {
    name: "Keetmanshoop, Namibia",
    lat: -26.5733,
    lon: 18.1326,
    data: {
      monthly: {
        Jan: 210, Feb: 200, Mar: 220, Apr: 240, May: 260, Jun: 270,
        Jul: 265, Aug: 250, Sep: 230, Oct: 220, Nov: 205, Dec: 195,
      },
      distance_to_coast_km: 420,
    },
  },
  {
    name: "Arandis, Erongo Region, Namibia",
    lat: -22.5767,
    lon: 14.9097,
    data: {
      monthly: {
        Jan: 220, Feb: 210, Mar: 230, Apr: 250, May: 270, Jun: 280,
        Jul: 275, Aug: 260, Sep: 240, Oct: 230, Nov: 215, Dec: 205,
      },
      distance_to_coast_km: 50,
    },
  },
];

function calculateYearlyAverage(monthlyData) {
  const monthlyValues = Object.values(monthlyData);
  const total = monthlyValues.reduce((sum, val) => sum + val, 0);
  return total.toFixed(1);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;

      try {
        const nasaUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lng}&latitude=${lat}&format=JSON`;
        const nasaResponse = await fetch(nasaUrl);
        if (!nasaResponse.ok) throw new Error("Error fetching NASA POWER data");
        const nasaJson = await nasaResponse.json();
        const monthlyDaily = nasaJson.properties.parameter.ALLSKY_SFC_SW_DWN;

        const daysInMonth = {
          Jan: 31, Feb: 28, Mar: 31, Apr: 30,
          May: 31, Jun: 30, Jul: 31, Aug: 31,
          Sep: 30, Oct: 31, Nov: 30, Dec: 31,
        };

        const monthMap = {
          JAN: "Jan", FEB: "Feb", MAR: "Mar", APR: "Apr",
          MAY: "May", JUN: "Jun", JUL: "Jul", AUG: "Aug",
          SEP: "Sep", OCT: "Oct", NOV: "Nov", DEC: "Dec",
        };

        const monthly = {};
        for (const [key, value] of Object.entries(monthlyDaily)) {
          const monthShort = monthMap[key];
          if (monthShort) {
            monthly[monthShort] = parseFloat(
              (value * daysInMonth[monthShort]).toFixed(1)
            );
          }
        }

        const query = `
          [out:json];
          (
            way(around:100000,${lat},${lng})["natural"="coastline"];
          );
          out geom;
        `.trim();

        const overpassUrl = "https://overpass-api.de/api/interpreter";
        const coastRes = await fetch(overpassUrl, {
          method: "POST",
          body: query,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        let distanceToCoast = "More than 100";

        if (coastRes.ok) {
          const coastJson = await coastRes.json();
          const ways = coastJson.elements.filter(
            (el) => el.type === "way" && el.geometry
          );

          let minDistance = Infinity;
          for (const way of ways) {
            for (const node of way.geometry) {
              const dist = haversineDistance(lat, lng, node.lat, node.lon);
              if (dist < minDistance) minDistance = dist;
            }
          }

          if (minDistance !== Infinity) {
            distanceToCoast = minDistance.toFixed(1);
          }
        }

        const newData = {
          name: `Coordinates (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
          lat,
          lon: lng,
          data: {
            monthly,
            distance_to_coast_km: distanceToCoast,
          },
        };

        onMapClick(newData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Error al obtener datos solares o de costa.");
      }
    },
  });

  return null;
}

export default function MapView() {
  const [selectedData, setSelectedData] = useState(null);

  return (
    <div style={{ marginLeft: "0.5rem" }}>
      <MapContainer center={[10, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {sunnyPlaces.map((place, idx) => (
          <Marker
            key={idx}
            position={[place.lat, place.lon]}
            icon={icon}
            eventHandlers={{ click: () => setSelectedData(place) }}
          >
            <Popup>
              <strong>{place.name}</strong>
              <br />
              Proximity to Sea: {place.data.distance_to_coast_km} km
              {place.data.distance_to_nile_km !== undefined && (
                <>
                  <br />
                  Distance to Nile: {place.data.distance_to_nile_km} km
                </>
              )}
              <br />
              Click to view solar data
            </Popup>
          </Marker>
        ))}

        <ClickHandler onMapClick={setSelectedData} />
      </MapContainer>

      {selectedData && (
        <div style={{ maxWidth: "1000px", marginTop: "2rem" }}>
          <h3>{selectedData.name}</h3>
          <p>
            <strong style={{ color: "#8DB600" }}>Average Sunlight per Year:</strong>{" "}
            {calculateYearlyAverage(selectedData.data.monthly)} kWh/m²/year
          </p>
          {selectedData.data.distance_to_coast_km !== undefined && (
            <>
              <p>
                <strong>Distance to Sea:</strong> {selectedData.data.distance_to_coast_km} km
              </p>

              {selectedData.data.distance_to_nile_km !== undefined && (
                <p>
                  <strong>Distance to Nile:</strong> {selectedData.data.distance_to_nile_km} km
                </p>
              )}

              <p>
                <strong>Water/Feedstock for Electrolyzer:</strong>
                <br />
                * Seawater within ~10 km is generally considered optimal and
                cost-effective with an integrated desalination plant onsite.
                <br />
                ** When it exceeds 10 km, it is more profitable to use freshwater
                with its respective treatment facilities & transport infrastructure.
              </p>
            </>
          )}
          <SolarChart data={selectedData} />
          <div style={{ maxWidth: "1000px", marginTop: "2rem" }}>
          {/* 🔽 Aquí insertamos el nuevo componente */}
          <ElectrolyzerSizingTool />
          </div>
        </div>
      )}
    </div>
  );
}


