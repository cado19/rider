import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
import { supabase } from '../util/supabase';

export default function index() {
    const router = useRouter();

    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            router.replace('/(tabs)/home'); // redirect to in-app flow
        } else {
            router.replace('/(auth)/signin'); // redirect to auth flow
        }
    }

    useEffect(() => {
        checkSession();
    }, [])
  return null;
}