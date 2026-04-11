import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { Slot, SplashScreen, Tabs } from 'expo-router'
import { AuthProvider } from '../context/AuthProvider'
import { useFonts } from "expo-font";

export default function _layout() {
  console.log("Supabase URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log("Anon Key:", process.env.EXPO_PUBLIC_ANON);
  console.log("Maps Key:", process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY_ANDROID);


  const [fontsLoaded] = useFonts({
    JakartaRegular: require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    JakartaMedium: require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    JakartaSemiBold: require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    JakartaBold: require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
  });

  useEffect(() => {
    if(fontsLoaded){
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded){
    return null;
  }
  
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
    
  )
}


