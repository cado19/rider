// This is a custom component for email input.
import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const EmailField = ({
  label = "Email",
  value,
  onChangeText,
  placeholder,
}: Props) => {
  const { container, labelStyle, input } = styles;
  return (
    <View style={container}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || "you@example.com"}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  labelStyle: { fontWeight: "bold", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
  },
});

export default EmailField;
