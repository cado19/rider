// app/auth/login.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { loginandCacheProfile } from "../../services/auth";
import EmailField from "../../components/EmailField";
import PasswordField from "../../components/PasswordField";
import GoogleSignInButton from "../../components/GoogleSignInButton";
import PrimaryButton from "../../components/PrimaryButton";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();

  const handleLogin = async () => {
    setSubmitting(true);
    const { profile, session } = await loginandCacheProfile(email, password);
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Welcome Back!</Text>
      <EmailField value={email} onChangeText={setEmail} />
      <PasswordField value={password} onChangeText={setPassword} />
      <PrimaryButton title={submitting ? "Logging in": "Login"} onPress={handleLogin} disabled={submitting} />
      <Text style={styles.link} onPress={() => router.push("signup")}>
        New here? Sign up →
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  link: { fontFamily: "JakartaSemiBold", marginTop: 20, color: "#007AFF", textAlign: "center" },
});
