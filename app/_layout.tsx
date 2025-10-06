import { View, Text } from 'react-native'
import React from 'react'
import { Slot, Tabs } from 'expo-router'
import { AuthProvider } from '../context/AuthProvider'

export default function _layout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
    
  )
}