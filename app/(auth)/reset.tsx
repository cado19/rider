import { View, Text, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "../../util/supabase";
import InputField from "../../components/InputField";
import PasswordField from "../../components/PasswordField";
import PrimaryButton from "../../components/PrimaryButton";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");

  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      Alert.alert("An error occured updating your password. Contact support");
    } else {
      Alert.alert("Password updated successfully");
      router.replace("(auth)/signin");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <PasswordField
        placeholder="Enter new password"
        value={password}
        onChangeText={setPassword}
      />
      <PrimaryButton title="Update password" onPress={updatePassword} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontFamily: "JakartaBold", marginBottom: 20 },
});
