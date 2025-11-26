import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// The base URL of your backend server
const API_URL = 'https://your-app-name.onrender.com/api/auth/';

// Function to register a user
const register = async (userData) => {
  const response = await axios.post(API_URL + 'register', userData);
  // We'll save the token here too, since a user is logged in after registering
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Function to log in a user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData);
  // We save the token and user data when login is successful
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Function to get the user from storage
const getUserFromStorage = async () => {
  const user = await AsyncStorage.getItem('user');
  return JSON.parse(user);
};

// Function to remove the token and log out the user
const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

const authService = {
  register,
  login,
  logout,
  getUserFromStorage,
};

export default authService;