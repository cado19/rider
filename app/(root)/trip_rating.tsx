import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../../util/supabase";
import { useAuth } from "../../context/AuthProvider";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PrimaryButton from "../../components/PrimaryButton";

export default function trip_rating() {
  const { tripId, riderId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitRating = async () => {
    try {
      const { error } = await supabase.from("driver_rating").insert({
        trip_id: tripId,
        rider_user_id: riderId,
        driver_user_id: userId,
        rating,
        comment,
      });

      if (error) throw error;
      router.back();
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color="#FBBF24"
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Rate Rider</Text>

      {renderStars()}

      <Text style={styles.label}>Comment</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        value={comment}
        onChangeText={setComment}
      />
      <PrimaryButton title="Submit Rating" onPress={submitRating} />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontFamily: "JakartaBold", marginBottom: 20 },
  label: { fontSize: 16, fontFamily: "JakartaSemiBold", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    fontFamily: "JakartaRegular",
  },
  button: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "JakartaSemiBold",
    fontSize: 16,
  },
  starRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  star: {
    marginRight: 8,
  },
});
