import React, { useState } from 'react';
import MapView from './components/MapView';
import SolarChart from './components/SolarChart';

export default function App() {
  const [solarData, setSolarData] = useState(null);

  return (
    <div style={{ marginLeft: '2rem', marginTop: '0.01rem' }}>
      <h1 style={{ color: "#8DB600" }}>Solar Green-Hydrogen Tool</h1>
      <h2>Estimate the optimal electrolyzer power for your solar-powered microgrid based on<br/> location's solar irradiation and system components.</h2>
      <h2 style={{ color: "#8DB600" }}>Select the Location with double click</h2>
      <h5>
        (Markers below show the sunniest places in the world according to The World Data Center for Meteorology & NASA Power API)
      </h5>
      <MapView onBSelectData={setSolarData} />
      {solarData && <SolarChart data={solarData} />}
    </div>
  );
}


