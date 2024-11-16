export interface Trip {
  _id: string;
  destination: string;
  purpose: string;
  duration: string;
  weather: string;
  trip_date: string;
  packing_list: PackingItem[];
  total_weight: number;
}

export interface PackingItem {
  name: string;
  checked: boolean;
  compartment: string;
  weight: number;
}

export interface AuthResponse {
  token: string;
  username: string;
}

export interface User {
  username: string;
}