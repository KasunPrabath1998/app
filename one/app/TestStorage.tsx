import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestStorage = () => {
  const [storedId, setStoredId] = useState<string | null>(null);

  const testStorage = async () => {
    try {
      // Clear previous data for testing
      await AsyncStorage.removeItem('userId');
      
      // Store a test value
      await AsyncStorage.setItem('userId', '12345');
      
      // Retrieve the test value
      const id = await AsyncStorage.getItem('userId');
      setStoredId(id);
    } catch (error) {
      console.error('Error accessing AsyncStorage:', error);
    }
  };

  useEffect(() => {
    testStorage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Stored User ID: {storedId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2260FF',
  },
});

export default TestStorage;
