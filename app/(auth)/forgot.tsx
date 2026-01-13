import { View, Text, Alert, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { supabase } from '../../util/supabase';
import EmailField from '../../components/EmailField';
import PrimaryButton from '../../components/PrimaryButton';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");

    const sendResetEmail = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "com.cado19.rider://auth/reset"
        });

        if (error ){
            console.error("Error sending reset email:", error.message)
        } else {
            Alert.alert("Check your email for a reset link.")
        }
    }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <EmailField value='email' onChangeText={setEmail} />
      <PrimaryButton title="Send Reset Link" onPress={sendResetEmail} />
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontFamily: "JakartaBold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  button: { backgroundColor: "#007AFF", padding: 14, borderRadius: 10, marginTop: 20 },
  buttonText: { color: "#fff", fontFamily: "JakartaSemiBold", fontSize: 16 },
});
