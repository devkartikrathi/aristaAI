import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../config';
import { Trip } from '../types';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  fetchTrips: () => Promise<void>;
  addTrip: (tripData: Omit<Trip, '_id' | 'packing_list' | 'total_weight'>) => Promise<Trip>;
}

export const useTrips = create<TripsState>((set) => ({
  trips: [],
  loading: false,
  error: null,
  fetchTrips: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ trips: response.data, error: null });
    } catch (error) {
      set({ error: 'Failed to fetch trips' });
    } finally {
      set({ loading: false });
    }
  },
  addTrip: async (tripData) => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/trips`, tripData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        trips: [...state.trips, response.data],
        error: null,
      }));
      return response.data;
    } catch (error) {
      set({ error: 'Failed to add trip' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));