import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Calendar, CloudSun, Briefcase, ChevronRight, Beaker } from 'lucide-react';

interface InfoScreenProps {
  destination: string;
  setDestination: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  weather: string;
  setWeather: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const InfoScreen: React.FC<InfoScreenProps> = ({
  destination,
  setDestination,
  duration,
  setDuration,
  purpose,
  setPurpose,
  weather,
  setWeather,
  loading,
  onSubmit,
}) => {
  const loadTestData = () => {
    setDestination('New York City');
    setDuration('7 days');
    setPurpose('Business');
    setWeather('Cold');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Travel Planner</h1>
        <p className="text-gray-600">Plan your perfect trip with ease</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Destination</label>
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., New York City"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Duration</label>
          </div>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 7 days"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Purpose</label>
          </div>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select purpose</option>
            <option value="Business">Business</option>
            <option value="Leisure">Leisure</option>
            <option value="Family">Family</option>
            <option value="Adventure">Adventure</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <CloudSun className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">Weather</label>
          </div>
          <select
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select weather</option>
            <option value="Hot">Hot</option>
            <option value="Cold">Cold</option>
            <option value="Mild">Mild</option>
            <option value="Rainy">Rainy</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadTestData}
            className="flex-none bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Beaker className="w-5 h-5" />
            <span>Test Data</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Plan My Trip</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};