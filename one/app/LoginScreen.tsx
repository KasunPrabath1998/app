import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Animated, ActivityIndicator, Dimensions } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [loading, setLoading] = useState(false); // State for loading animation
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const router = useRouter(); // Use useRouter from expo-router

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // User is already logged in, navigate to HomeScreen
          router.replace('/Home'); // Use replace to prevent going back to LoginScreen
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, [router]);

  useEffect(() => {
    let isMounted = true;
    if (showAnimation && isMounted) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotateValue, {
            toValue: 1,
            duration: 1000,
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
      isMounted = false;
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

    setLoading(true);

    try {
      const response = await axios.post('http://10.0.2.2:3001/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { token, userId } = response.data;

        // Store token and userId in AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('userId', userId.toString());

        console.log('User ID stored:', userId);

        setShowAnimation(true);
        setTimeout(() => {
          setLoading(false);
          router.replace('/Home'); // Use replace to prevent going back to LoginScreen
        }, 2000);
      } else {
        alert('Login failed. Please check your credentials and try again.');
        setLoading(false);
      }
    } catch (error) {
      alert('Login failed. Please check your credentials and try again.');
      setLoading(false);
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
        <TouchableOpacity onPress={() => router.navigate('/')} style={styles.backButton}>
          {/* Optional: Add an image or text for back button */}
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
        <TouchableOpacity onPress={() => router.navigate('/SignUpScreen')} style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.rotatingObject}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {showAnimation && (
        <Animated.View
          style={[
            styles.rotatingObject,
            { transform: [{ rotate }, { scale: scaleValue }] }
          ]}
        >
          <Image source={require('../assets/load.png')} style={styles.rotateIcon} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: width * 0.05, // 5% of screen width
    marginTop: height * 0.02, // 2% of screen height
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.03, // 3% of screen height
  },
  backButton: {
    marginRight: width * 0.05, // 5% of screen width
  },
  login: {
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: 'bold',
    color: '#2260FF',
    textAlign: 'center',
    flex: 1,
  },
  welcomeText: {
    fontSize: width * 0.06, // 6% of screen width
    fontWeight: 'bold',
    marginBottom: height * 0.02, // 2% of screen height
    color: '#2260FF',
    marginTop: height * 0.05, // 5% of screen height
  },
  welcomePara: {
    fontSize: width * 0.04, // 4% of screen width
    marginBottom: height * 0.03, // 3% of screen height
    color: 'black',
  },
  label: {
    fontSize: width * 0.05, // 5% of screen width
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
    fontSize: width * 0.04, // 4% of screen width
    marginBottom: height * 0.01, // 1% of screen height
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: height * 0.02, // 2% of screen height
    paddingHorizontal: width * 0.1, // 10% of screen width
    borderRadius: 20,
    marginTop: height * 0.05, // 5% of screen height
    alignSelf: 'center',
    width: width * 0.6, // 60% of screen width
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orText: {
    marginTop: height * 0.02, // 2% of screen height
    marginBottom: height * 0.02, // 2% of screen height
    textAlign: 'center',
  },
  bottomtext: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.03, // 3% of screen height
  },
  signuptext: {
    textAlign: 'center',
  },
  signUpButton: {},
  signUpButtonText: {
    color: '#007AFF',
    marginLeft:5,
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
    width: width * 0.25, // 25% of screen width
    height: width * 0.25, // 25% of screen width
  },
});

export default LoginScreen;
