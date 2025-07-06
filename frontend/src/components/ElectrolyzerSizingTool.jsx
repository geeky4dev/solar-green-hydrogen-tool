import React, { useState, useMemo } from 'react';
import { Sun, BatteryCharging, Power, FlaskConical, Calculator } from 'lucide-react'; // Importing icons

// Main App component
function ElectrolyzerSizingTool() {
  // State variables for inputs
  const [solarFarmPeakPowerMW, setSolarFarmPeakPowerMW] = useState('');
  const [batteryStorageCapacityMWh, setBatteryStorageCapacityMWh] = useState('');
  const [annualSolarIrradiationKWhM2, setAnnualSolarIrradiationKWhM2] = useState('');
  const [systemPerformanceRatio, setSystemPerformanceRatio] = useState('0.80'); // Default PR

  // State variables for calculated outputs
  const [solarCapacityFactor, setSolarCapacityFactor] = useState(null);
  const [suggestedElectrolyzerPowerMW, setSuggestedElectrolyzerPowerMW] = useState(null);
  const [sizingRatioUsed, setSizingRatioUsed] = useState(null);
  const [recommendationReason, setRecommendationReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Constants for calculation
  const TOTAL_HOURS_IN_YEAR = 8760;
  // Note: STANDARD_IRRADIANCE_WM2 was mistakenly used in the CF calculation previously.
  // The corrected formula for CF from Annual Irradiation (kWh/m²/year) directly uses total hours in a year.

  // Threshold for high/low solar capacity factor (based on previous analysis: ~18%)
  const CF_THRESHOLD_FOR_RATIO = 0.18; // 18%

  // Function to handle the calculation
  const calculateElectrolyzerPower = () => {
    // Clear previous results and errors
    setSolarCapacityFactor(null);
    setSuggestedElectrolyzerPowerMW(null);
    setSizingRatioUsed(null);
    setRecommendationReason('');
    setErrorMessage('');

    // Input validation
    const solarFarmPower = parseFloat(solarFarmPeakPowerMW);
    const batteryCapacity = parseFloat(batteryStorageCapacityMWh);
    const annualIrradiation = parseFloat(annualSolarIrradiationKWhM2);
    const performanceRatio = parseFloat(systemPerformanceRatio);

    if (isNaN(solarFarmPower) || solarFarmPower <= 0) {
      setErrorMessage('Please enter a valid positive number for Solar Farm Peak Power (MW).');
      return;
    }
    if (isNaN(batteryCapacity) || batteryCapacity < 0) { // Battery capacity can be 0 for simplicity
      setErrorMessage('Please enter a valid non-negative number for Battery Storage Capacity (MWh).');
      return;
    }
    if (isNaN(annualIrradiation) || annualIrradiation <= 0) {
      setErrorMessage('Please enter a valid positive number for Average Annual Solar Irradiation (kWh/m²/year).');
      return;
    }
    if (isNaN(performanceRatio) || performanceRatio <= 0 || performanceRatio > 1) {
      setErrorMessage('Please enter a valid System Performance Ratio (between 0 and 1).');
      return;
    }

    try {
      // 1. Calculate Solar Capacity Factor (CF) - CORRECTED FORMULA
      // CF = (Annual Irradiation (kWh/m^2/year) * System Performance Ratio (%)) / Total Hours in a Year
      const calculatedCF = (annualIrradiation * performanceRatio) / TOTAL_HOURS_IN_YEAR;
      setSolarCapacityFactor(calculatedCF);

      // 2. Determine the Electrolyzer Sizing Ratio
      let electrolyzerRatio;
      let reason;

      if (calculatedCF >= CF_THRESHOLD_FOR_RATIO) {
        // High solar capacity factor (e.g., desert locations like Arandis)
        electrolyzerRatio = 0.5; // 1:2 ratio (Electrolyzer Power : Solar Farm Peak Power)
        reason = `Your location has a high Solar Capacity Factor (${(calculatedCF * 100).toFixed(1)}%). This indicates abundant and relatively consistent solar irradiation. A 1:2 ratio for the electrolyzer allows for higher overall hydrogen production by utilizing more of the available solar energy, which is cost-effective in such sunny regions. Battery storage provides a valuable buffer to optimize electrolyzer operation.`;
      } else {
        // Low solar capacity factor (e.g., temperate locations like Munich)
        electrolyzerRatio = 0.25; // 1:4 ratio (Electrolyzer Power : Solar Farm Peak Power)
        reason = `Your location has a lower Solar Capacity Factor (${(calculatedCF * 100).toFixed(1)}%). This suggests more variability and lower average sunlight. A 1:4 ratio for the electrolyzer is more economically sound in this scenario. It prioritizes the efficient utilization of the expensive electrolyzer by running it more consistently on the available power, even if it means curtailing some peak solar output. The battery helps smooth the power input to the electrolyzer.`;
      }
      setSizingRatioUsed(electrolyzerRatio);

      // 3. Calculate Suggested Electrolyzer Power
      const suggestedPower = solarFarmPower * electrolyzerRatio; // in MW
      setSuggestedElectrolyzerPowerMW(suggestedPower);
      setRecommendationReason(reason);

    } catch (error) {
      setErrorMessage('An error occurred during calculation. Please check your inputs.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-inter">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center"
              style={{ color: "#8DB600" }}
          >
            Electrolyzer Sizing for Smart Microgrids
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Estimate the optimal electrolyzer power for your solar-powered microgrid based on location's solar irradiation and system components.
          </p>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Sun className="h-6 w-6 text-yellow-500 mr-2" /> Solar Farm & Battery
              </h2>
              <div className="mb-4">
                <label htmlFor="solarPower" className="block text-sm font-medium text-gray-700 mb-1">
                  Solar Farm Peak Power (MW)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="solarPower"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={solarFarmPeakPowerMW}
                    onChange={(e) => setSolarFarmPeakPowerMW(e.target.value)}
                    placeholder="e.g., 25"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">MW</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="batteryCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Battery Storage Capacity (MWh)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="batteryCapacity"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={batteryStorageCapacityMWh}
                    onChange={(e) => setBatteryStorageCapacityMWh(e.target.value)}
                    placeholder="e.g., 13.4"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">MWh</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl shadow-inner border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Power className="h-6 w-6 text-green-500 mr-2" /> Location Details
              </h2>
              <div className="mb-4">
                <label htmlFor="annualIrradiation" className="block text-sm font-medium mb-1" style={{ color: "#8DB600" }}>
                  <strong>Avg. Sunnlight per Year (kWh/m²/year)</strong>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="annualIrradiation"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={annualSolarIrradiationKWhM2}
                    onChange={(e) => setAnnualSolarIrradiationKWhM2(e.target.value)}
                    placeholder="e.g., 1150 (Munich), 2333 (Arandis)"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-xs sm:text-sm">kWh/m²/year</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="performanceRatio" className="block text-sm font-medium text-gray-700 mb-1">
                  System Performance Ratio (0-1)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="performanceRatio"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={systemPerformanceRatio}
                    onChange={(e) => setSystemPerformanceRatio(e.target.value)}
                    placeholder="e.g., 0.80"
                    min="0"
                    max="1"
                    step="0.01"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Accounts for system losses (e.g., temperature, soiling, inverter efficiency). Typical: 0.75 - 0.85.
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
              <p className="font-bold">Input Error</p>
              <p>{errorMessage}</p>
            </div>
          )}

          <div className="text-center">
            <button
              style={{ backgroundColor: "#8DB600", color: "white", padding: "12px 24px", borderRadius: "9999px", fontWeight: "600", boxShadow: "0 0 8px #8DB600" }}
              onClick={calculateElectrolyzerPower}
            >
              <Calculator className="h-5 w-5 mr-2" /> Calculate Electrolyzer Power
            </button>
          </div>

          {/* Output Section */}
          {(solarCapacityFactor !== null || suggestedElectrolyzerPowerMW !== null) && (
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                <FlaskConical className="h-7 w-7 text-purple-600 mr-3" /> Results and Recommendation
              </h2>

              <div className="bg-purple-50 p-6 rounded-xl shadow-lg border border-purple-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Solar Capacity Factor (CF):</h3>
                <p className="text-2xl font-bold text-purple-700">
                  {solarCapacityFactor !== null ? `${(solarCapacityFactor * 100).toFixed(2)}%` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This represents the average power output of your solar farm relative to its peak capacity over a year, considering your location's sunlight and system efficiency.
                </p>
              </div>

              {suggestedElectrolyzerPowerMW !== null && (
                <div className="bg-green-50 p-6 rounded-xl shadow-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggested Electrolyzer Power:</h3>
                  <p className="text-3xl font-extrabold text-green-700">
                    {suggestedElectrolyzerPowerMW.toFixed(2)} MW
                  </p>
                  <p className="text-base text-gray-700 mt-4">
                    Based on a **1:{1 / sizingRatioUsed} ratio** (Electrolyzer Power : Solar Farm Peak Power).
                  </p>
                  <p className="text-sm text-gray-600 mt-2">{recommendationReason}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ElectrolyzerSizingTool;