import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useNavigation
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon

interface Todo {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

  return {
    date: date.toLocaleDateString('en-US', optionsDate),
    time: date.toLocaleTimeString('en-US', optionsTime),
  };
};

const TodoDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation(); // Use useNavigation to get the navigation prop
  const { todoId } = route.params as { todoId: number }; // Ensure todoId is a number
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          console.log('No user ID found');
          Alert.alert('Error', 'No user ID found.');
          return;
        }

        const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}/${todoId}`);
        if (response.status === 200) {
          setTodo(response.data);
        } else {
          console.error('Error fetching todo details:', response.statusText);
          Alert.alert('Error', 'Failed to fetch todo details. Please try again later.');
        }
      } catch (error) {
        console.error('Error fetching todo details:', error);
        Alert.alert('Error', 'An error occurred while fetching todo details.');
      } finally {
        setLoading(false);
      }
    };

    fetchTodoDetails();
  }, [todoId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!todo) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTodo}>Todo not found.</Text>
      </View>
    );
  }

  const dueDateTime = formatDateTime(todo.due_date);
  const createdAtDateTime = formatDateTime(todo.created_at);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header />
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color="blue" />
        </TouchableOpacity>
        <Text style={styles.title}>Task Details</Text>
        <Text style={styles.description}>{todo.description}</Text>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Task Allocate Date:</Text>
          <Text style={styles.dateValue}>{dueDateTime.date}</Text>
          <Text style={styles.timeLabel}>Time:</Text>
          <Text style={styles.timeValue}>{dueDateTime.time}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Task Created Date:</Text>
          <Text style={styles.dateValue}>{createdAtDateTime.date}</Text>
          <Text style={styles.timeLabel}>Time:</Text>
          <Text style={styles.timeValue}>{createdAtDateTime.time}</Text>
        </View>
      </View>
      <Footer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 16,
    textAlign:"center",
  },
  description: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  dateValue: {
    fontSize: 16,
    color: '#333333',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  timeValue: {
    fontSize: 16,
    color: '#333333',
  },
  noTodo: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TodoDetailScreen;
