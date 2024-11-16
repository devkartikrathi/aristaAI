import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { COLORS } from '../config';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const AddTripScreen = ({ navigation }: Props) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    purpose: 'leisure',
    weather: 'mild',
    trip_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/trips`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigation.navigate('Trips');
    } catch (error) {
      console.error('Error adding trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Plan New Trip</Text>
      
      <TextInput
        label="Destination"
        value={formData.destination}
        onChangeText={text => setFormData(prev => ({ ...prev, destination: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Duration"
        value={formData.duration}
        onChangeText={text => setFormData(prev => ({ ...prev, duration: text }))}
        mode="outlined"
        style={styles.input}
        placeholder="e.g., 5 days"
      />

      <Text style={styles.label}>Purpose</Text>
      <SegmentedButtons
        value={formData.purpose}
        onValueChange={value => setFormData(prev => ({ ...prev, purpose: value }))}
        buttons={[
          { value: 'leisure', label: 'Leisure' },
          { value: 'business', label: 'Business' },
          { value: 'family', label: 'Family' },
        ]}
        style={styles.segmentedButton}
      />

      <Text style={styles.label}>Weather</Text>
      <SegmentedButtons
        value={formData.weather}
        onValueChange={value => setFormData(prev => ({ ...prev, weather: value }))}
        buttons={[
          { value: 'hot', label: 'Hot' },
          { value: 'mild', label: 'Mild' },
          { value: 'cold', label: 'Cold' },
        ]}
        style={styles.segmentedButton}
      />

      <TextInput
        label="Trip Date"
        value={formData.trip_date}
        onChangeText={text => setFormData(prev => ({ ...prev, trip_date: text }))}
        mode="outlined"
        style={styles.input}
        placeholder="YYYY-MM-DD"
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
      >
        Create Trip
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  title: {
    marginBottom: 24,
    color: COLORS.text,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    marginBottom: 40,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
  },
});

export default AddTripScreen;