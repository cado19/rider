import React from "react";
import { ActivityIndicator, StyleSheet, View, Text } from "react-native";

export default function Loader({ message }: { message: string}) {
  return (
    <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  message: { marginTop: 16, fontSize: 18, fontWeight: "500" },
});
