import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

export default function _layout() {
  return (
    <Tabs>
      <Tabs.Screen name='index' options={{ title: 'Home'}} />
      <Tabs.Screen name='about' options={{ title: 'About'}} />
    </Tabs>
  )
}