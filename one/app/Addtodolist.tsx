import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTodoScreen = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(storedUserId);
          console.log('Retrieved User ID:', storedUserId);
        } else {
          console.log('No user ID found in AsyncStorage.');
        }
      } catch (error) {
        console.error('Error retrieving user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  const handleAddTodo = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) {
        Alert.alert('Error', 'You need to be logged in to add todos.');
        return;
      }

      const response = await axios.post(
        'http://10.0.2.2:3001/add-todo',
        {
          title,
          description,
          date: date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
          time: date.toTimeString().split(' ')[0], // Format time as HH:MM:SS
          userId: parseInt(userId, 10),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Todo added successfully');
        setTitle('');
        setDescription('');
        setDate(new Date());
      } else {
        Alert.alert('Error', 'Failed to add todo. Please try again.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error:', error.response ? error.response.data : error.message);
        Alert.alert('Error', 'An error occurred. Please try again later.');
      } else {
       
        Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
      }
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Update the time while keeping the same date
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDate(updatedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.userId}>
          {userId ? `User ID: ${userId}` : 'Loading...'}
        </Text>

        <Text style={styles.title}>Add Todo</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
          multiline
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
          <Text>{date.toLocaleTimeString()}</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <TouchableOpacity onPress={handleAddTodo} style={styles.button}>
          <Text style={styles.buttonText}>Add Todo</Text>
        </TouchableOpacity>
      </View>
      <Footer />  
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center', 
  },
  userId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2260FF',
  },
  label: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ecf1ff',
    borderRadius: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',

  },
});

export default AddTodoScreen;
