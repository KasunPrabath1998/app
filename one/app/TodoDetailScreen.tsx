import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import Icon from 'react-native-vector-icons/FontAwesome';

interface Todo {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

// Function to format date and time separately
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  // Formatting options for date and time
  const optionsDate: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const dateFormatted = date.toLocaleDateString('en-US', optionsDate);
  const timeFormatted = date.toLocaleTimeString('en-US', optionsTime);

  return { date: dateFormatted, time: timeFormatted };
};

const TodoDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { todoId } = route.params as { todoId: string };
  const [todo, setTodo] = useState<Todo | null>(null);

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId && todoId) {
          const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}/${todoId}`);
          setTodo(response.data);
        } else {
          console.log('No user ID or todo ID found');
        }
      } catch (error) {
        console.error('Error fetching todo details:', error);
      }
    };

    fetchTodoDetails();
  }, [todoId]);

  const dueDateTime = todo ? formatDateTime(todo.due_date) : { date: '', time: '' };
  const createdAtDateTime = todo ? formatDateTime(todo.created_at) : { date: '', time: '' };

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color="blue" />
          </TouchableOpacity>
        <View style={styles.header}>
          
          <Text style={styles.title}>Task Details</Text>
        </View>
        {todo ? (
          <>
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
          </>
        ) : (
          <Text style={styles.loadingText}>Loading...</Text>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop:20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#007BFF', // Ensure this color is visible
    paddingHorizontal: 16, // Ensure padding is added for spacing
  },
  backButton: {
    marginRight: 16, // Added margin for spacing
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: 'white', // Ensure text color contrasts with header background
    textAlign: 'center',
    flex: 1,
  },
  description: {
    fontSize: 18,
    marginBottom: 16,
    color: '#555',
    lineHeight: 24,
  },
  dateContainer: {
    marginBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#777',
    marginTop: 8,
  },
  timeValue: {
    fontSize: 16,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TodoDetailsScreen;
