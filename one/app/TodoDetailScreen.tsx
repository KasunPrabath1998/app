import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

// Define the type for the route parameters
interface TodoDetailScreenParams {
  userId: string;
  todoId: string;
}

// Define the type for a TODO item
interface Todo {
  id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

// Function to format the date and time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  return {
    date: new Intl.DateTimeFormat('en-US', optionsDate).format(date),
    time: new Intl.DateTimeFormat('en-US', optionsTime).format(date),
  };
};

const TodoDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: TodoDetailScreenParams }, 'params'>>();
  const navigation = useNavigation();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodoDetails = async () => {
      const { userId, todoId } = route.params;

      console.log('User ID:', userId);
      console.log('Todo ID:', todoId);

      if (!userId || !todoId) {
        setError('Invalid parameters');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}/${todoId}`);
        setTodo(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(`Error fetching todo details: ${error.response?.statusText || error.message}`);
        } else {
          setError('Unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodoDetails();
  }, [route.params]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text>Loading...</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <Footer />
      </View>
    );
  }

  if (!todo) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.errorContainer}>
          <Text>No todo details available</Text>
        </View>
        <Footer />
      </View>
    );
  }

  const { date, time } = formatDateTime(todo.due_date);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>{todo.title}</Text>
        <Text style={styles.description}>{todo.description}</Text>
        <Text style={styles.dateTime}>Due Date: {date}</Text>
        <Text style={styles.dateTime}>Time: {time}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#007BFF" />
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 10,
  },
  dateTime: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#007BFF',
    marginLeft: 8,
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
    padding: 20,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 16,
  },
});

export default TodoDetailScreen;
