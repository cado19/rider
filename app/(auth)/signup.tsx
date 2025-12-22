// screens/SignupScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Image,
} from "react-native";
import { supabase } from "../../util/supabase"; // adjust path to your Supabase client
import EmailField from "../../components/EmailField";
import PasswordField from "../../components/PasswordField";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import signUpCar from "../../assets/signup-car.png";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert("Signup Error", authError.message);
      setLoading(false);
      return;
    }

    await AsyncStorage.setItem(
      "pending_profile",
      JSON.stringify({ first_name: firstName, last_name: lastName })
    );

    setLoading(false);
    router.replace("/confirm");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageWrapper}>
            <Image source={signUpCar} style={styles.logo} />
          </View>
          
          <Text style={styles.title}>Rider Signup</Text>
          <InputField
            value={firstName}
            onChangeText={setFirstName}
            label="First Name"
          />
          <InputField
            value={lastName}
            onChangeText={setLastName}
            label="Last Name"
          />

          <EmailField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <PasswordField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />
          <PrimaryButton
            title={loading ? "Signing up..." : "Sign Up"}
            onPress={handleSignup}
            disabled={loading}
          />
          <Text style={styles.link} onPress={() => router.push("signin")}>
                  Have an account? Sign in →
                </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 50, // ensures space for the button
  },
  imageWrapper: {
    marginTop: -40,
    marginHorizontal: -20
  },
  logo: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    alignSelf: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  link: { fontFamily: "JakartaSemiBold", marginTop: 20, color: "#007AFF", textAlign: "center" },
});
