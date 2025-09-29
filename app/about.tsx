import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function about() {
  return (
    <View style={styles.container}>
      <Text>This is the about page</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})