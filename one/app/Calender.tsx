import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import Footer from '../layout/Footer';
import Header from '../layout/Header';
import { useRouter } from 'expo-router';

// Define the Item type
interface Item {
  _id: string;
  title: string;
  description: string;
  due_date: string;
  userId: string;
  created_at: string;
}

const ProfileScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sriLankanTime, setSriLankanTime] = useState<string>('');
  const [noTasksMessage, setNoTasksMessage] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Colombo',
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const date = new Date().toLocaleString('en-US', options);
      setSriLankanTime(date);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setNoTasksMessage(null); 
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          setNoTasksMessage("User is not authenticated.");
          return;
        }

        const utcDate = new Date(selectedDate).toISOString().split('T')[0];

        const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}/date/${utcDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          if (response.data.length === 0) {
            setNoTasksMessage("No tasks found for this user on the specified date.");
            setItems([]);
          } else {
            setItems(response.data);
          }
        } else {
          setNoTasksMessage("Failed to fetch tasks.");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data.message) {
          setNoTasksMessage(error.response.data.message);
        } else {
          setNoTasksMessage("An error occurred while fetching tasks.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedDate]);

  const handleDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  const handleItemPress = async (item: Item) => {
    try {
      await router.replace({
        pathname: '/ItemdetaisMain',
        params: {
          id: item._id,
          title: item.title,
          description: item.description,
          due_date: item.due_date,
          created_at: item.created_at,
        },
      });
    } catch (error) {
      console.error('Error navigating to item details:', error);
    }
  };

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const keyExtractor = (item: Item) => item._id || Math.random().toString();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{sriLankanTime}</Text>
      </View>
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          minDate={'2022-01-01'}
          maxDate={'2030-12-31'}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: '#1D4ED8',
              selectedTextColor: '#ffffff',
              selectedDotColor: '#ffffff',
            },
          }}
          monthFormat={'yyyy-MM'}
          hideExtraDays={true}
          enableSwipeMonths={true}
          onDayPress={handleDayPress}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#1D4ED8',
            selectedDayBackgroundColor: '#1D4ED8',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#3B82F6',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            arrowColor: '#1D4ED8',
            monthTextColor: '#1D4ED8',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>
      <View style={styles.TasktitleContainer}>
        <Text style={styles.TasktitleText}>Available Tasks</Text>
      </View>
      <View style={styles.itemsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" />
        ) : (
          <>
            {noTasksMessage ? (
              <Text style={styles.noItems}>{noTasksMessage}</Text>
            ) : (
              <FlatList
                data={items}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={styles.itemsList}
              />
            )}
          </>
        )}
      </View>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  timeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  calendarContainer: {
    flex: 4,
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  itemsList: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#BFDBFE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  itemDescription: {
    fontSize: 16,
    color: '#555555',
  },
  noItems: {
    fontSize: 18,
    color: '#888888',
    textAlign: 'center',
  },
  TasktitleContainer: {
    padding: 16,
  },
  TasktitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'blue',
  },
});

export default ProfileScreen;
