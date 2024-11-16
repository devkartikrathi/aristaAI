import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Briefcase,
  CloudSun,
  ArrowLeft,
  Check,
  Package,
} from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { Trip, PackingItem } from '../types';

export const TripDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrip(response.data);
      } catch (err) {
        setError('Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleCheckItem = async (item: PackingItem) => {
    if (!trip) return;

    const updatedItems = trip.packing_list.map((i) =>
      i.name === item.name ? { ...i, checked: !i.checked } : i
    );

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/edit_packing_list`,
        {
          trip_id: trip._id,
          items: updatedItems,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTrip((prev) =>
        prev ? { ...prev, packing_list: updatedItems } : null
      );
    } catch (err) {
      console.error('Failed to update item status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Trip not found'}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{trip.destination}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>{trip.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <span>{trip.purpose}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CloudSun className="w-5 h-5 text-blue-500" />
                <span>{trip.weather}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-600">
                Trip Date: {new Date(trip.trip_date).toLocaleDateString()}
              </div>
              <div className="text-gray-600">
                Total Weight: {trip.total_weight.toFixed(2)} kg
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Packing List
          </h2>
          <div className="space-y-4">
            {trip.packing_list.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => handleCheckItem(item)}
                  className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    item.checked
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                >
                  {item.checked && <Check className="w-4 h-4 text-white" />}
                </button>
                <span
                  className={`flex-grow ${
                    item.checked ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}
                >
                  {item.name}
                </span>
                <div className="flex items-center gap-2 text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{item.compartment}</span>
                  <span className="text-sm">({item.weight} kg)</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};