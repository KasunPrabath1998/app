import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import axios from 'axios';
import { useAuthRequest } from 'expo-auth-session';
import { useRouter } from 'expo-router';

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
    clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
    scopes: ['profile', 'email'],
    redirectUri: 'yourapp://redirect', // Update with your app's redirect URI
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
            router.replace("/Home"); // Navigate to HomeScreen after successful sign-in
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
        router.replace("/LoginScreen"); // Navigate to LoginScreen after successful registration
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
    <View style={styles.container}>
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

      <Text style={styles.orText}>or sign up with</Text>
      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => {
          if (request) {
            promptAsync(); // Trigger Google Sign-In
          }
        }}
        disabled={!request}
      >
        <Image source={require('../assets/google.png')} style={styles.googleIcon} />
        <Text style={styles.googleButtonText}>Sign Up with Google</Text>
      </TouchableOpacity>

      <View style={styles.bottomtext}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace("/LoginScreen")} style={styles.signUpButton}>
          <Text style={styles.signUpButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 0,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  signuptitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2260FF',
    textAlign: 'center',
    flex: 1,
  },
  label: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 10,
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
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 40,
    alignSelf: 'center',
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
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  bottomtext: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpButton: {},
  signUpButtonText: {
    color: '#007AFF',
  },
});

export default SignUpScreen;
