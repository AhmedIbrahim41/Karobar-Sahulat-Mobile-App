import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen, Redirect } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user from storage', e);
      } finally {
        setIsChecking(false);
        SplashScreen.hideAsync();
      }
    };

    checkToken();
  }, []);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {user ? (
        // User is authenticated, so we redirect them to the home page.
        // The user cannot go back to the login screen.
        <Stack.Screen name="home" options={{ headerShown: false }} />
      ) : (
        // No user is authenticated, show the login screen.
        // The user cannot go back from the login screen.
        <Stack.Screen name="index" options={{ headerShown: false }} />
      )}

      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="products" options={{ headerShown: false }} />
    </Stack>
  );
}

