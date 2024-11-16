import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

const AddReceiptScreen = ({ navigation }: any) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    purchase_date: '',
    store_name: '',
    price: '',
    category: '',
    warranty_period: '',
    customer_care_number: '',
  });

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'receipt.jpg',
        });

        const response = await axios.post(`${API_URL}/analyze-receipt`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData(prev => ({
          ...prev,
          ...response.data,
        }));
      } catch (error) {
        console.error('Error analyzing receipt:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/invoice/add`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigation.navigate('Receipts');
    } catch (error) {
      console.error('Error adding receipt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="contained"
        onPress={handleImagePick}
        style={styles.button}
        loading={loading}
      >
        Scan Receipt
      </Button>

      <TextInput
        label="Product Name"
        value={formData.product_name}
        onChangeText={text => setFormData(prev => ({ ...prev, product_name: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Purchase Date"
        value={formData.purchase_date}
        onChangeText={text => setFormData(prev => ({ ...prev, purchase_date: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Store Name"
        value={formData.store_name}
        onChangeText={text => setFormData(prev => ({ ...prev, store_name: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Price"
        value={formData.price}
        onChangeText={text => setFormData(prev => ({ ...prev, price: text }))}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Category"
        value={formData.category}
        onChangeText={text => setFormData(prev => ({ ...prev, category: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Warranty Period"
        value={formData.warranty_period}
        onChangeText={text => setFormData(prev => ({ ...prev, warranty_period: text }))}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Customer Care Number"
        value={formData.customer_care_number}
        onChangeText={text => setFormData(prev => ({ ...prev, customer_care_number: text }))}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
      >
        Save Receipt
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginVertical: 16,
    paddingVertical: 8,
  },
});

export default AddReceiptScreen;