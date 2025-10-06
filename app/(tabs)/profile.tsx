import { View, Text, StyleSheet, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { supabase } from '../../util/supabase';

export default function Profile() {
  const router = useRouter();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error: ", error.message);
      return;
    }

    router.replace("/(auth)/signin");
  };

  return (
    <View style={styles.container}>
      <Text>Profile</Text>
      <Button title='Logout' onPress={handleLogout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})