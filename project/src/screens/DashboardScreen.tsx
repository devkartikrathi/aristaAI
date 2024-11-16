import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { Trip } from '../types';

const DashboardScreen = ({ navigation }: any) => {
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddTrip')}
        style={styles.addButton}
      >
        Add New Trip
      </Button>

      {trips.map((trip) => (
        <Card key={trip._id} style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge">{trip.destination}</Text>
            <Text variant="bodyMedium">Duration: {trip.duration}</Text>
            <Text variant="bodyMedium">Purpose: {trip.purpose}</Text>
            <Text variant="bodyMedium">Weather: {trip.weather}</Text>
            <Text variant="bodyMedium">Date: {new Date(trip.trip_date).toLocaleDateString()}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => navigation.navigate('TripDetails', { tripId: trip._id })}>
              View Details
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  addButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
});

export default DashboardScreen;