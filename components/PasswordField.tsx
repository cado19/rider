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
    <View style={styles.wrapper}>
      {/* Label  */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Container  */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || "••••••••"}
          secureTextEntry={secure}
          autoCapitalize="none"
        />
        {/* Show / Hide Toggle  */}
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Text style={styles.toggle}>{secure ? "Show" : "Hide"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    width: "100%",
  },

  label: {
    fontFamily: "JakartaSemiBold",
    fontSize: 16,
    marginBottom: 8,
    color: "#111827",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "JakartaMedium",
    color: "#111827",
  },

  toggle: {
    fontFamily: "JakartaSemiBold",
    color: "#007AFF",
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },


});
