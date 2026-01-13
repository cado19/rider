import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import React, { useRef, useState } from "react";
import Swiper from "react-native-swiper";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import PrimaryButton from "../../components/PrimaryButton";
import onBoarding1 from "../../assets/onboarding1.png";
import onBoarding2 from "../../assets/onboarding2.png";
import onBoarding3 from "../../assets/onboarding4.png";
// 👇 Define onboarding slides inline (images from assets)
const onboarding = [
  {
    id: 1,
    title: "The perfect ride is just a tap away!",
    description:
      "Your journey begins with Ride. Find your ideal ride effortlessly.",
    image: onBoarding1,
  },
  {
    id: 2,
    title: "Best car in your hands with Ride",
    description:
      "Discover the convenience of finding your perfect ride with Ride",
    image: onBoarding2,
  },
  {
    id: 3,
    title: "Your ride, your way. Let's go!",
    description:
      "Enter your destination, sit back, and let us take care of the rest.",
    image: onBoarding3,
  },
];

export default function welcome() {
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  console.log(isLastSlide);

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button  */}
      <TouchableOpacity
        onPress={() => router.replace("(auth)/signin")}
        style={styles.skipButton}
      >
        <Text style={styles.skipButton}>Skip</Text>
      </TouchableOpacity>

      {/* Swiper  */}
      <Swiper 
      ref={swiperRef} 
      loop={false} 
      dot={<View style={styles.dot} />} 
      activeDot={<View style={styles.activeDot} />}
      onIndexChanged={(index) => setActiveIndex(index)}
      >
        {onboarding.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </Swiper>

      {/* Next / Get Started Button  */}
      <PrimaryButton
        title={isLastSlide ? "Get Started" : "Next"}
        onPress={() =>
          isLastSlide
            ? router.replace("(auth)/signin")
            : swiperRef.current?.scrollBy(1)
        }
        style={styles.primaryButton}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: 20,
  },
  skipText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "JakartaSemiBold",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: "100%",
    height: 300,
  },
  title: {
    fontSize: 24,
    fontFamily: "JakartaSemiBold",
    textAlign: "center",
    marginTop: 20,
    color: "#000",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#858585",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  dot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: "#4374b9",
    borderRadius: 2,
  },
  activeDot: {
    width: 32,
    height: 4,
    marginHorizontal: 4,
    backgroundColor: "#153255",
    borderRadius: 2,
  },
  primaryButton: {
    width: "90%",
    marginBottom: 20,
  },
});
