import React, { useEffect } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { useRouter } from "expo-router";

const WelcomeScreen = () => {
  const router = useRouter();  // Correctly use the router

  useEffect(() => {
    console.log("Setting up navigation timer...");
    const timer = setTimeout(() => {
      console.log("Navigating to LoginScreen...");
      router.push("/LoginScreen");  // Automatically navigate after 2 seconds
    }, 3000); // 2 seconds

    // Cleanup the timer when the component unmounts
    return () => {
      console.log("Cleaning up timer...");
      clearTimeout(timer);
    };
  }, [router]);  // Ensure router is a dependency to avoid stale closures

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
      </View>
      <Text style={styles.footerText}>Powered By Kasun</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#005aff',
    alignItems: 'center',
    justifyContent: 'center',
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
  footerText: {
    fontSize: 14,
    color: 'white',
    position: 'absolute',
    bottom: 20,
  },
});

export default WelcomeScreen;
