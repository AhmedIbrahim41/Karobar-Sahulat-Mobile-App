import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import authService from '../services/authService';

const HomeScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // This hook runs when the component loads
  useEffect(() => {
    // We get the user data from storage and update the state
    const fetchUser = async () => {
      const storedUser = await authService.getUserFromStorage();
      console.log('Retrieved user from storage:', storedUser); // New console.log here
      if (storedUser) {
        setUser(storedUser);
      }
    };
    fetchUser();
  }, []); // The empty array means this runs only once when the component mounts

  // Function to handle logout
  const handleLogout = async () => {
    await authService.logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {user ? (
        <Text style={styles.welcomeText}>Welcome, {user.name}!</Text>
      ) : (
        <Text style={styles.welcomeText}>Welcome!</Text>
      )}
       <TouchableOpacity
          onPress={() => router.push('products')}
          style={styles.button}
      >
          <Text style={styles.buttonText}>Open POS</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF0000',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
