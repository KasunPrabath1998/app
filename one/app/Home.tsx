import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

// Define the type for a TODO item
interface Todo {
  id: number;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

const HomeScreen: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}`);
          if (response.data.length > 0) {
            setTodos(response.data);
          } else {
            console.log('No todos found for this user');
            setTodos([]); // Ensure the todos state is empty
          }
        } else {
          console.log('No user ID found');
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error fetching todos:', error.message);
        } else {
          console.error('Unexpected error:', error);
        }
      }
    };
    
    fetchTodos();
  }, []);

  // Helper function to check if a date is tomorrow or the day after tomorrow
  const isTomorrowOrDayAfter = (dateString: string): boolean => {
    const dueDate = moment(dateString).startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    const dayAfterTomorrow = moment().add(2, 'days').startOf('day');
    return dueDate.isSame(tomorrow) || dueDate.isSame(dayAfterTomorrow);
  };

  // Filter todos to include only those due tomorrow or the day after tomorrow
  const filteredTodos = todos.filter(todo =>
    isTomorrowOrDayAfter(todo.due_date) && (todo.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort todos to show the latest ones first
  const sortedTodos = filteredTodos.sort((a, b) => moment(b.due_date).unix() - moment(a.due_date).unix());

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this TODO item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              // Retrieve user ID from AsyncStorage
              const userId = await AsyncStorage.getItem('userId');
              if (userId) {
                await axios.delete(`http://10.0.2.2:3001/todos/${userId}/${id}`);
                // Remove the deleted item from the local state
                setTodos(todos.filter(todo => todo.id !== id));
              } else {
                console.log('No user ID found');
              }
            } catch (error) {
              if (error instanceof Error) {
                console.error('Error deleting todo:', error.message);
              } else {
                console.error('Unexpected error:', error);
              }
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleViewDetails = (id: number) => {
    router.push(`/TodoDetailScreen?todoId=${id}`);
  };

  const renderTodoItem = ({ item }: { item: Todo }) => (
    <View style={styles.listItem}>
      <View style={styles.todoTextContainer}>
        <Text style={styles.listItemTitle}>{item.title || 'No Title Available'}</Text>
        <Text style={styles.listItemdue_date}>
          Allowcate Date: {moment(item.due_date).format('YYYY-MM-DD')}
        </Text>
        <Text style={styles.listItemdue_date}>
          Time: {moment(item.due_date).format('HH:mm')}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => handleViewDetails(item.id)}>
          <Icon name="eye" size={24} color="#007BFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Icon name="trash" size={24} color="#E53E3E" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.todoListContainer}>
        <Text style={styles.title}>Add New Tasks</Text>
        <TouchableOpacity onPress={() => router.push('/Addtodolist')} style={styles.addButton}>
          <Icon name="plus-circle" size={48} color="#000" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Icon name="search" size={20} color="#4F4F4F" />
        </View>
        <View>
          <Text style={styles.latesttitle}>My Latest Tasks</Text>
        </View>
        {sortedTodos.length > 0 ? (
          <FlatList
            data={sortedTodos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTodoItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.noTodos}>No relevant todos available.</Text>
        )}
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  todoListContainer: {
    alignItems: 'center',
    flex: 1,
    width: '100%', // Ensure the container takes full width
  },
  title: {
    color: '#1D4ED8',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  latesttitle: {
    color: '#1D4ED8',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dce2f1',
    borderRadius: 9,
    paddingHorizontal: 16, // Add padding on the sides
    paddingVertical: 8,    // Add padding on the top and bottom
    marginBottom: 16,
    width: '90%', // Same width for search bar and list items
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
  },
  listContent: {
    flexGrow: 1,
    width: '90%', // Same width for list items
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 16, // Add padding on the sides
    paddingVertical: 12,   // Add padding on the top and bottom
    marginBottom: 16,
    width: '100%', // Ensure list items take full width of their container
  },
  todoTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  listItemdue_date: {
    color: '#4B5563',
  },
  noTodos: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 20,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 60,
  },
});

export default HomeScreen;
