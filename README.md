# ☀️ Green-Hydrogen-Tool – A Fullstack Web App for Renewable Hydrogen Planning

Welcome to the **Green-Hydrogen-Tool** 🌿 – a fullstack web app designed to assist engineers and planners in evaluating the solar potential and sizing hydrogen electrolyzers for smart microgrids. This project is divided into two functional parts, built step-by-step using modern tools and real-world data sources.

## 🧱 Tech Stack   

Frontend	React + Vite + Bootstrap + Leaflet + Recharts  
Backend	Flask (Python) + NASA POWER API   
Geo Tools	Overpass API (OpenStreetMap) for coast proximity   
Maps	OpenStreetMap + Leaflet.js  
Hosting	Compatible with Render, Vercel, or Netlify  


## 🚀 Features  

- 🌍 When the user clicks on the map:  
  - ☀️ A query is made to NASA POWER (as you already have) to show Solar Irradiation.  
  - 📡 A query is made to the Overpass API looking for natural=coastline nodes within a 100 km (100,000 m) radius.
  - 🌊 The minimum distance between the clicked point and the coastline nodes is calculated using the Haversine formula. 
  - 🌊 **Distance to the Coast (km)** using **OpenStreetMap Overpass API**  
- 📊 Sizing the electrolyzer using capacity factor and ratio options with the inputs: Calculated solar farm power, battery storage capacity and site-specific irradiation data (from Part 1)
  
---
![solargreenhydrogen](https://github.com/user-attachments/assets/932ff49c-f3f8-46a2-b09b-cfbb9131758d)
---

## 📦 Project Structure  
Solar-green-hydrogen-tool/  
├── backend/  
│ ├──venv  
│ ├── app.py # Flask backend with NASA API integration  
│ ├── utils/  
│ │ └── solar_utils.py # Solar data fetching and processing  
│ └── requirements.txt # Backend dependencies  
├── frontend/  
│ ├── public/  
│ ├── src/  
│ │ ├── components/  
│ │ │ ├── MapView.jsx  
│ │ │ ├── SolarChart.jsx  
│ │ │ └── ElectrolyzerSizingTool.jsx  
│ │ ├── App.jsx  
│ │ └── main.jsx  
│ └── vite.config.js # Proxy config for API calls  
├── README.md  
└── .gitignore  

---
## 🌍 Part 1:  Solar Irradiation Calculator  

### 🗺️ Features:  
- **Interactive Leaflet Map** for selecting any global location.  
- Real-time solar irradiation data from **NASA POWER API** or **PVGIS**.  
- Visualizations with:  
  - ☀️ **Average Solar Hours per Month**  
  - 📈 **Daily Solar Irradiation over 12 Months**  
  - 🌊 **Distance to the Coast (km)** using **OpenStreetMap Overpass API**  
- 🏜️ Preloaded examples of the *sunniest places in the world*:  
  - Upington, South Africa  
  - Arandis, Namibia  
  - Keetmanshoop, Namibia  
  - Yuma, Arizona, USA  
  - Phonix, Arizona, USA  
  - Aswan, Egypt  
  - Luxor, Egypt  
  - Atacama Desert, Chile  
  - And more!  

### 📊 Visualization Libraries:  
- [Chart.js](https://www.chartjs.org/) or [Recharts](https://recharts.org/)  

### 🔗 Example API used:  
```bash
GET https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude={lon}&latitude={lat}&format=JSON  
________________________________________

⚡ Part 2: Electrolyzer Sizing Tool for Smart Microgrids  
📐 Tool Capabilities:  
•	Calculate solar Capacity Factor (CF) from:  
CF = Actual Annual Energy Output (kWh) / (Rated Power × 8760 h)  
•	Dimension electrolyzer capacity based on solar production:  
o	Ratio options: 1:2, 1:4, etc.  
•	Inputs:  
o	🟡 Solar farm rated power (kW)  
o	🔋 Battery storage capacity (kWh)  
o	🌞 Site-specific irradiation data (from Part 1)  
•	Simple interactive UI in React with sliders, dropdowns and live outputs.  
________________________________________

🚀 Getting Started  

🔧 Backend (Python + Flask)  
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows  
pip install -r requirements.txt  
python app.py  

💻 Frontend (React + Vite)  
cd frontend  
npm install  
npm run dev  
Make sure to configure vite.config.js to proxy /api requests to your Flask backend.  
________________________________________
🔍 TODOs  
•	 Add PVGIS API fallback  
•	 Add CSV/PDF export for irradiation data  
•	 Enable offline map tiles caching  
•	 Add hydrogen storage volume calculator  
•	 Deploy using Docker  
________________________________________
🧠 Credits & Sources  
•	NASA POWER Project – Real solar data APIs  
•	PVGIS by JRC – EU Solar irradiation services  
•	OpenStreetMap – Geolocation & Overpass API  
•	Chart.js / Recharts – Data Visualization  
________________________________________
🙌 Contributing  
Feel free to open issues or submit pull requests! All contributions welcome.  

