import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Header = () => {
  const [userName, setUserName] = useState('Fetching name...');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (token && userId) {
          const response = await axios.get(`http://10.0.2.2:3001/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 200) {
            setUserName(response.data.fullName || 'No name available');
          } else {
            setUserName('No name available');
          }
        } else {
          setUserName('No name available');
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
        setUserName('No name available');
      } finally {
        setLoading(false);
      }
    };

    fetchUserName();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Logout cancelled"),
          style: "cancel"
        },
        {
          text: "Yes", 
          onPress: async () => {
            try {
              // Clear AsyncStorage
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('userId');

              // Navigate to the login screen
              router.push('/LoginScreen');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image source={require('../assets/kasun.jpeg')} style={styles.profileImage} />
        <View style={styles.greetingContainer}>
          {loading ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <>
              <Text style={styles.greetingText}>Hi, Welcome Back</Text>
              <Text style={styles.userName}>{userName}</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.iconsContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="gear" size={24} color="#4F4F4F" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Icon name="sign-out" size={24} color="#4F4F4F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    height: 120,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  greetingContainer: {
    marginLeft: 8,
  },
  greetingText: {
    color: '#3B82F6',
    fontSize: 16,
  },
  userName: {
    fontWeight: 'bold',
    color: '#1D4ED8',
    fontSize: 15,
  },
  iconsContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    marginRight: 16,
  },
});

export default Header;
