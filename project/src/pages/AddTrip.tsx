import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase, CloudSun, ArrowLeft } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { WEATHER_OPTIONS, PURPOSE_OPTIONS } from '../config';

export const AddTrip = () => {
  const navigate = useNavigate();
  const { addTrip } = useTrips();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    purpose: '',
    weather: '',
    trip_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await addTrip(formData);
      navigate('/');
    } catch (err) {
      setError('Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Plan New Trip</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Destination
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, destination: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Paris, France"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Duration
            </label>
            <input
              type="text"
              required
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, duration: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 7 days"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Purpose
            </label>
            <select
              required
              value={formData.purpose}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, purpose: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <CloudSun className="w-5 h-5 text-blue-500" />
              Weather
            </label>
            <select
              required
              value={formData.weather}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, weather: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select weather</option>
              {WEATHER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Trip Date
            </label>
            <input
              type="date"
              required
              value={formData.trip_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, trip_date: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};