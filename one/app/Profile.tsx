import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Footer from '../layout/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Define the UserDetails type
interface UserDetails {
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  password: string;
  profileImage?: string;
}

const ProfileScreen = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newUserDetails, setNewUserDetails] = useState<UserDetails>({
    fullName: '',
    email: '',
    mobileNumber: '',
    address: '',
    password: '',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
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
            setUserDetails(response.data);
            setNewUserDetails(response.data); // Initialize with fetched user details
          } else {
            console.error('Error fetching user details:', response.statusText);
          }
        } else {
          console.error('No token or userId found');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      router.push('/LoginScreen');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleChange = (name: string, value: string) => {
    setNewUserDetails(prevState => ({ ...prevState, [name]: value }));
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (token && userId) {
        await axios.put(`http://10.0.2.2:3001/users/${userId}`, newUserDetails, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('User details updated successfully');
        setIsEditing(false); // Exit editing mode
      } else {
        console.error('No token or userId found');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('/Home')} style={styles.backButton}>
          <Icon name="chevron-left" size={24} color="#1D4ED8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
          <Icon name="sign-out" size={24} color="#4F4F4F" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Profile Picture and Name */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: userDetails?.profileImage || 'https://via.placeholder.com/100' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{userDetails?.fullName || 'John Doe'}</Text>
          <Text style={styles.profileEmail}>{userDetails?.email || 'john.doe@example.com'}</Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Name:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.mobileNumber}
              onChangeText={(text) => handleChange('mobileNumber', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.email}
              onChangeText={(text) => handleChange('email', text)}
              editable={isEditing}
            />
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Password:</Text>
            <TextInput
              style={styles.detailValue}
              value={newUserDetails.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              editable={isEditing}
            />
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            if (isEditing) {
              handleUpdate(); 
            } else {
              setIsEditing(prev => !prev); 
            }
          }}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Text>
          <Icon name={isEditing ? 'save' : 'edit'} size={20} color="#ffffff" />
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
  backButton: {
    marginTop: 10,
  },
  headerContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1D4ED8',
    textAlign: 'center',
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    marginHorizontal: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#ffffff',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  profileEmail: {
    fontSize: 16,
    color: 'black',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 8,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#666666',
    flex: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingVertical: 8,
  },
  logoutIcon: {
    marginTop: 10,
  },
});

export default ProfileScreen;
