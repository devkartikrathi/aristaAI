import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Briefcase, CloudSun, PlusCircle } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';

export const Dashboard = () => {
  const { trips, loading, error, fetchTrips } = useTrips();

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchTrips()}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
        <Link
          to="/add-trip"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Trip</span>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No trips planned yet</p>
          <Link
            to="/add-trip"
            className="text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Plan your first trip</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {trips.map((trip, index) => (
            <motion.div
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/trip/${trip._id}`}
                className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trip.destination}
                  </h3>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{trip.purpose}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4" />
                    <span>{trip.weather}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};