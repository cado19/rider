// This is a custom component for email input.
import { View, Text, StyleSheet, TextInput } from "react-native";
import React from "react";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
}: Props) => {
  const { wrapper, labelStyle, inputContainer, input } = styles;
  return (
    <View style={wrapper}>
      {/* Label  */}
      <Text style={labelStyle}>{label}</Text>

      {/* Input  */}
      <View style={inputContainer}>
        <TextInput
          style={input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || "Kinya"}
          autoCorrect={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    width: "100%",
  },
  labelStyle: {
    fontFamily: "JakartaSemiBold",
    fontSize: 16,
    marginBottom: 8,
    color: "#111827",
  },
  inputContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "JakartaMedium",
    color: "#111827",
  },
});

export default InputField;
