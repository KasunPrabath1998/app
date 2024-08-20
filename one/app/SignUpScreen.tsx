import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert, Dimensions, ScrollView } from 'react-native';
import axios from 'axios';
import { useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

interface Errors {
  fullName?: string;
  email?: string;
  mobileNumber?: string;
  password?: string;
}

const SignUpScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<Errors>({});

  // Google Sign-In setup
  const [request, response, promptAsync] = useAuthRequest({
    clientId: '642181976671-q1gu7a1omr4k0ohavd2s6ftd83f1ssti.apps.googleusercontent.com', // Replace with your Google Client ID
    scopes: ['profile', 'email'],
    redirectUri: 'http://localhost:3001/redirect', 
  }, {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;

      axios.post('http://10.0.2.2:3001/google-signin', { id_token })
        .then((res) => {
          if (res.status === 200) {
            Alert.alert('Success', 'Google Sign-In successful!');
            router.replace("/Home"); 
          } else {
            Alert.alert('Sign-In failed', 'Please try again.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          Alert.alert('Error', 'An error occurred. Please try again later.');
        });
    }
  }, [response]);

  const validateInputs = () => {
    const newErrors: Errors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'A valid email is required.';
    }
    if (!mobileNumber.trim() || !/^\d{10}$/.test(mobileNumber)) {
      newErrors.mobileNumber = 'A valid 10-digit mobile number is required.';
    }
    if (!password.trim() || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      const response = await axios.post('http://10.0.2.2:3001/signup', {
        fullName,
        email,
        mobileNumber,
        password,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Registration successful! Please check your email to verify your account.');
        router.replace("/LoginScreen"); 
      } else {
        Alert.alert('Registration failed', 'Please try again.');
      }
    } catch (error) {
      Alert.alert(
        'Email Already In Use',
        'The email address is already taken. Please use a different one.'
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/LoginScreen")} style={styles.backButton}>
          <Image source={require("../assets/arrow.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.signuptitle}>New Account</Text>
      </View>

      {/* Input fields */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={[styles.input, errors.fullName ? styles.errorInput : {}]}
        placeholder="Full Name"
        value={fullName}
        onChangeText={(text) => setFullName(text)}
      />
      {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, errors.email ? styles.errorInput : {}]}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Mobile Number</Text>
      <TextInput
        style={[styles.input, errors.mobileNumber ? styles.errorInput : {}]}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={(text) => setMobileNumber(text)}
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={[styles.input, errors.password ? styles.errorInput : {}]}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.googlecontainer}>
      <Text style={styles.orText}>or sign up with</Text>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => {
          if (request) {
            promptAsync(); 
          }
        }}
        disabled={!request}
      >
        <Image source={require('../assets/google.png')} style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Sign Up with Google</Text>
      </TouchableOpacity>
      </View>
      <View style={styles.bottomtext}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/LoginScreen")} style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: width * 0.05, 
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.03, 
  },
  backButton: {
    position: 'absolute',
    left: width * 0.03, 
    top: 0,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  signuptitle: {
    fontSize: width * 0.06, 
    fontWeight: 'bold',
    color: '#2260FF',
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: width * 0.05, 
    color: 'black',
    fontWeight: 'bold',
    marginTop: height * 0.02, 
  },
  input: {
    width: '100%',
    height: height * 0.07, 
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#ecf1ff',
    borderRadius: 13,
    paddingHorizontal: width * 0.04, 
    marginBottom: height * 0.02, 
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.04, 
    marginBottom: height * 0.01, 
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: height * 0.02, 
    paddingHorizontal: width * 0.05, 
    borderRadius: 20,
    marginTop: height * 0.05, 
    alignSelf: 'center',
    width: width * 0.6, 
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orText: {
    marginTop: height * 0.02, 
    textAlign: 'center',
  },
  googlecontainer:{
    alignItems: 'center',
    paddingBottom:10,
  },

  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: width * 0.05, 
    paddingVertical: height * 0.02,   
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: height * 0.02, 
    width: width * 0.6,        
    height: height * 0.07,     
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: width * 0.02, 
  },
  googleButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  bottomtext: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: height * 0.02, 
  },
  signUpButton: {},
  signUpButtonText: {
    color: '#007AFF',
    marginLeft:5,
  },
});

export default SignUpScreen;
