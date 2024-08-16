import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import Footer from '../layout/Footer';
import Header from '../layout/Header';

interface Item {
  id: number;
  title: string;
  description: string;
  due_date: string; // Date in 'YYYY-MM-DD HH:MM:SS' format
  userId: number;
  created_at: string; // Timestamp
}

const ProfileScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sriLankanTime, setSriLankanTime] = useState<string>('');

  useEffect(() => {
    // Function to update the Sri Lankan time
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

    // Update the time immediately
    updateTime();

    // Set an interval to update the time every second
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Assume userId is 21 for this example; replace with the actual userId if needed
        const userId = 21;
        const response = await axios.get(`http://10.0.2.2:3001/todos/${userId}/date/${selectedDate}`);
        if (response.status === 200) {
          setItems(response.data);
        } else {
          Alert.alert('Error', 'Failed to fetch items.');
        }
      } catch (error) {
        Alert.alert('Error', 'An error occurred while fetching items.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedDate]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemDescription}>{item.description}</Text>
    </View>
  );

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
            },
          }}
          monthFormat={'yyyy-MM'}
          hideExtraDays={false}  // Temporarily set to false for debugging
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

      <View style={styles.itemsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1D4ED8" />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.itemsList}
            ListEmptyComponent={<Text style={styles.noItems}>No items for this date.</Text>}
          />
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
    flex: 1,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  itemsContainer: {
    flex: 1,
    padding: 16,
  },
  itemsList: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#ffffff',
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
});

export default ProfileScreen;
