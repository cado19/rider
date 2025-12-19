import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

type Props = {
    originName: string;
    destinationName: string;
    date?: string;
    fare?: number;
}

export default function TripCard({originName, destinationName, date, fare}: Props) {
  return (
    <View style={styles.card}>
        {/* Trip Row: Pickup -> Destination  */}
        <View style={styles.row}>
            <Ionicons name='location' size={18} color="#10B981" style={styles.icon}/>
            <Text style={styles.location}>{originName}</Text>
        </View>

        <View style={styles.row}>
            <Ionicons name='location' size={18} color="#10B981" style={styles.icon}/>
            <Text style={styles.location}>{destinationName}</Text>
        </View>

        {/* Bottom Row: Date + Fare  */}
        <View style={styles.footer}>
            <Text style={styles.date}>
                {date ? new Date(date).toLocaleDateString(): "Not started"}
            </Text>
            {fare != undefined && (
                <Text style={styles.fare}>KES {fare}/-</Text>
            )}
        </View>
    </View>
  )
}
const styles = StyleSheet.create({
      card: {
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  icon: {
    marginRight: 8,
  },

  location: {
    fontFamily: "JakartaSemiBold",
    fontSize: 15,
    color: "#111827",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  date: {
    fontFamily: "JakartaRegular",
    fontSize: 13,
    color: "#6B7280",
  },

  fare: {
    fontFamily: "JakartaSemiBold",
    fontSize: 14,
    color: "#111827",
  },

})