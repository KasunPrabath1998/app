import { View, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure to use the correct icon library
import { useRouter } from 'expo-router'; // Adjust import if needed

const Footer = () => {
  const router = useRouter(); // Initialize the router

  return (
    <View style={styles.footer}>
      {/* Footer Navigation */}
      <TouchableOpacity  onPress={() => router.navigate('./Home')}>
        <Icon name="home" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('./Showtodos')}>
        <Icon name="tasks" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('./Calender')}> 
        <Icon name="calendar" size={28} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('./Profile')}>
        <Icon name="user" size={28} color="#fff" />
      </TouchableOpacity>
     
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,  

  },
});

export default Footer;
