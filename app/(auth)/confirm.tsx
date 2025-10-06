import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../../util/supabase';

export default function ConfirmEmailScreen() {
  const handleResend = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resend({ type: 'signup', email: user.email });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Email</Text>
      <Text style={styles.message}>
        We've sent a confirmation link to your email. Please verify to continue.
      </Text>
      <Button title="Resend Email" onPress={handleResend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { fontSize: 16, marginBottom: 20 },
});