import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import * as AuthSession from "expo-auth-session";

export default function App() {
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // Set to false if you're using a custom scheme or standalone app
  });

  console.log("Redirect URI:", redirectUri);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
