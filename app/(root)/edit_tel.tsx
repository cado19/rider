import { View, Text, Alert, StyleSheet } from "react-native";
import React, { useState } from "react";
import { supabase } from "../../util/supabase";
import { useAuth } from "../../context/AuthProvider";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";

export default function edit_tel() {
  const router = useRouter();
  const [tel, setTel] = useState("");

  const { userId } = useAuth();

  console.log("User Id: ", userId);

  const validateTel = (number: string) => {
    // Regex: either 0XXXXXXXXX or +254XXXXXXXXX
    const localPattern = /^0\d{9}$/;
    const intlPattern = /^\+254\d{9}$/;

    return localPattern.test(number) || intlPattern.test(number);
  };

  const handleSave = async () => {
    if (!validateTel(tel)) {
      Alert.alert(
        "Invalid number",
        "Enter a valid Kenyan phone number (0XXXXXXXXX or +254XXXXXXXXX)."
      );
      return;
    }
    try {
      const { data, error } = await supabase
        .from("riders")
        .update({ tel })
        .eq("id", userId);
      if (error) {
        Alert.alert("Update Error", error.message);
      } else {
        Alert.alert("Success, Telephone number updated");
        setTimeout(() => {
          router.replace("(tabs)/profile");
        }, 1500);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong while updating.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Enter Telephone</Text>

      <InputField
        label="Telephone"
        value={tel}
        onChangeText={setTel}
        placeholder="0722123456 or +254722123456"
      />

      <PrimaryButton title="Save" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontFamily: "JakartaBold", marginBottom: 20 },
});
