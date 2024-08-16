import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Animated } from 'react-native';
import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;
    if (showAnimation && isMounted) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 1000, // Duration of one full rotation
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleValue, {
              toValue: 1.2,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
    return () => {
      isMounted = false; // Cleanup when component unmounts
      rotateValue.stopAnimation();
      scaleValue.stopAnimation();
    };
  }, [showAnimation, rotateValue, scaleValue]);

  const validateInputs = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email address is invalid.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    try {
      const response = await axios.post('http://10.0.2.2:3001/login', {
        email: email,
        password: password,
      });

      if (response.status === 200) {
        const { token, userId } = response.data;

        // Store token and userId in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', userId.toString());

        console.log('User ID stored:', userId); // Ensure this line prints the ID

        // Trigger animation and navigate
        setShowAnimation(true);
        setTimeout(() => {
          router.navigate("/Home");
        }, 2000);
      } else {
        alert('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
     
      alert('Login failed. Please check your credentials and try again.');
    }
  };

  // Rotate interpolation
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.navigate("/")} style={styles.backButton}>
          {/* Add an image or text for back button if needed */}
        </TouchableOpacity>
        <Text style={styles.login}>LOGIN</Text>
      </View>

      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.welcomePara}>Please log in to continue accessing your account and personalized features. Your session awaits!</Text>

      <Text style={styles.label}>Email or Mobile Number</Text>
      <TextInput
        style={[styles.input, emailError ? styles.errorInput : null]}
        placeholder="Email or Mobile Number"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={[styles.input, passwordError ? styles.errorInput : null]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or sign up with</Text>
      <View style={styles.bottomtext}>
        <Text style={styles.signuptext}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.navigate("/SignUpScreen")} style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {showAnimation && (
        <Animated.View
          style={[
            styles.rotatingObject,
            { transform: [{ rotate }, { scale: scaleValue }] }
          ]}
        >
          <Image source={require("../assets/load.png")} style={styles.rotateIcon} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center content horizontally
    marginBottom: 20,
  },
  backButton: {
    marginRight: 20,
  },
  login: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2260FF',
    textAlign: 'center', // Center text horizontally
    flex: 1, // Allow the text to use available space
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2260FF',
    marginTop: 40,
  },
  welcomePara: {
    fontSize: 14,
    marginBottom: 30,
    color: 'black',
  },
  label: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ecf1ff',
    borderRadius: 13,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 40,
    alignSelf: 'center', // Center the button horizontally
    width: 210,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orText: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  bottomtext: {
    flexDirection: 'row',
    justifyContent: 'center', // Center bottom text horizontally
    marginBottom: 20,
  },
  signuptext: {
    textAlign: 'center',
  },
  signUpButton: {},
  signUpButtonText: {
    color: '#007AFF',
  },
  rotatingObject: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotateIcon: {
    width: 100,
    height: 100,
  },
});

export default LoginScreen;
