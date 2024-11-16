import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL, COLORS } from '../config';
import { useAuth } from '../contexts/AuthContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any, 'TripDetails'>;

const TripDetailsScreen = ({ route, navigation }: Props) => {
  const { tripId } = route.params;
  const { token } = useAuth();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading trip details...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.destination}>
            {trip.destination}
          </Text>
          <View style={styles.infoContainer}>
            <InfoItem
              icon="calendar"
              label="Duration"
              value={trip.duration}
            />
            <InfoItem
              icon="briefcase"
              label="Purpose"
              value={trip.purpose}
            />
            <InfoItem
              icon="weather-sunny"
              label="Weather"
              value={trip.weather}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Packing List
          </Text>
          {trip.packing_list.map((item: any, index: number) => (
            <List.Item
              key={index}
              title={item.name}
              left={props => (
                <MaterialCommunityIcons
                  name={item.checked ? "checkbox-marked" : "checkbox-blank-outline"}
                  size={24}
                  color={COLORS.primary}
                />
              )}
            />
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const InfoItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
  <View style={styles.infoItem}>
    <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
    <Text variant="bodyMedium" style={styles.infoLabel}>{label}</Text>
    <Text variant="bodyLarge" style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  destination: {
    color: COLORS.text,
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    marginLeft: 8,
    color: COLORS.text,
    opacity: 0.7,
    width: 80,
  },
  infoValue: {
    marginLeft: 8,
    color: COLORS.text,
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    color: COLORS.text,
  },
});

export default TripDetailsScreen;