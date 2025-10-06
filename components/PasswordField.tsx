// components/PasswordField.tsx
import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export default function PasswordField({
  label = "Password",
  value,
  onChangeText,
  placeholder,
}: Props) {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || "••••••••"}
          secureTextEntry={secure}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Text style={styles.toggle}>{secure ? "Show" : "Hide"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontWeight: "bold", marginBottom: 4 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  toggle: {
    color: "#007AFF",
    fontWeight: "600",
    padding: 8,
  },
});
