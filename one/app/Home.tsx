import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        // Retrieve user ID from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}`);
          setTodos(response.data);
        } else {
          console.log('No user ID found');
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

  // Filter todos based on the title or due_date
  const filteredTodos = todos.filter(todo =>
    (todo.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (todo.due_date || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              console.error('Error deleting todo:', error);
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
        <Text style={styles.listItemdue_date}>{item.due_date || 'No due_date Available'}</Text>
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
        <Text style={styles.title}>Your Todos</Text>
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
        {filteredTodos.length > 0 ? (
          <FlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTodoItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Text style={styles.noTodos}>No todos available.</Text>
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
  },
  title: {
    color: '#1D4ED8',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  addButton: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '91%',
    backgroundColor: '#dce2f1',
    borderRadius: 9,
    padding: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#BFDBFE',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    width: '90%',
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
  },
});

export default HomeScreen;
