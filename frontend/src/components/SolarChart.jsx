import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Title);

const daysInMonth = {
  Jan: 31, Feb: 28, Mar: 31, Apr: 30, May: 31, Jun: 30,
  Jul: 31, Aug: 31, Sep: 30, Oct: 31, Nov: 30, Dec: 31,
};

export default function SolarChart({ data }) {
  const months = Object.keys(data.data.monthly);
  const irradiation = months.map((month) => data.data.monthly[month]);
  const avgPerDay = months.map((month) =>
    (data.data.monthly[month] / daysInMonth[month]).toFixed(2)
  );

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Monthly Irradiation (kWh/m²)",
        backgroundColor: "#f39c12",
        data: irradiation,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const month = context.label;
            const value = context.raw;
            const avg = (value / daysInMonth[month]).toFixed(2);
            return [
              `Irradiation: ${value.toFixed(2)} kWh/m²`,
              `Avg per day: ${avg} kWh/m²/day`,
            ];
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Solar Irradiation (kWh/m² per month)",
      },
    },
  };

  return (
    <div style={{ marginLeft: "1rem" }}>
      <Bar data={chartData} options={options} />

      <h4 style={{ marginTop: "2rem" }}>Solar Irradiation Summary (kWh/m²)</h4>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left", paddingLeft: "0.5rem" }}>Month</th>
            <th style={{ textAlign: "right" }}>Avg per Month (kWh/m²/month)</th>
            <th style={{ textAlign: "right" }}>Avg per Day (kWh/m²/day)</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, idx) => (
            <tr key={month}>
              <td style={{ paddingLeft: "0.5rem" }}>{month}</td>
              <td style={{ textAlign: "right" }}>{irradiation[idx].toFixed(2)}</td>
              <td style={{ textAlign: "right" }}>{avgPerDay[idx]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "1rem" }}>
        <strong>Proximity to Sea:</strong> {data.data.distance_to_coast_km} km
        {data.data.distance_to_nile_km !== undefined && (
          <>
            <br />
            <strong>Distance to Nile:</strong> {data.data.distance_to_nile_km} km
          </>
        )}
      </p>

      {data.data.total_annual && (
        <p style={{ marginTop: "1rem" }}>
          <strong>Total Annual Irradiation:</strong> {data.data.total_annual.toFixed(2)} kWh/m²<br />
          <strong>Avg per Month:</strong> {data.data.average_monthly.toFixed(2)} kWh/m²/month<br />
          <strong>Avg per Day:</strong> {data.data.average_daily.toFixed(2)} kWh/m²/day
        </p>
      )}
    </div>
  );
}






