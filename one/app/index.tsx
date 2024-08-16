import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';

const Index = () => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
      router.navigate("./LoginScreen");
    }, 2000); // 2 seconds

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <TouchableOpacity onPress={() => router.navigate("./LoginScreen")} style={styles.arrowButton}>
        <Text style={styles.arrow}>&#10140;</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>Powered By Kasun</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005aff',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 400,
    marginBottom: 20,
  },
  arrowButton: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  arrow: {
    fontSize: 40,
    color: 'white',
  },
  footerText: {
    fontSize: 14,
    color: 'white',
  },
});

export default Index;
