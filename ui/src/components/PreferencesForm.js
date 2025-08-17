import React, { useState } from 'react';

function PreferencesForm({ onSubmit, loading }) {
  const [country, setCountry] = useState('Global');
  const [frequency, setFrequency] = useState('daily');
  const [themes, setThemes] = useState([]);

  const availableCountries = ['Global', 'Nepal', 'USA', 'UK']; // Expand as needed
  const availableFrequencies = ['daily', 'weekly', 'monthly', 'all'];
  const availableThemes = ['Economy', 'Humanitarian', 'Education', 'Peace', 'Sports', 'Technology', 'Health']; // Expand as needed

  const handleThemeChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setThemes((prevThemes) => [...prevThemes, value]);
    } else {
      setThemes((prevThemes) => prevThemes.filter((theme) => theme !== value));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ country, frequency, themes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country:
          </label>
          <select
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            disabled={loading}
          >
            {availableCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
            Frequency:
          </label>
          <select
            id="frequency"
            name="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            disabled={loading}
          >
            {availableFrequencies.map((f) => (
              <option key={f} value={f}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className="block text-sm font-medium text-gray-700 mb-2">Themes:</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {availableThemes.map((theme) => (
            <div key={theme} className="flex items-center">
              <input
                id={`theme-${theme}`}
                name="themes"
                type="checkbox"
                value={theme}
                checked={themes.includes(theme)}
                onChange={handleThemeChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={loading}
              />
              <label htmlFor={`theme-${theme}`} className="ml-2 block text-sm text-gray-900">
                {theme}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${
          loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Getting News...
          </span>
        ) : (
          'Get Good News!'
        )}
      </button>
    </form>
  );
}

export default PreferencesForm;
