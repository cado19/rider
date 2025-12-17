import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  style?: object;
  textStyle?: object;
};
export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  IconLeft,
  IconRight,
  style,
  textStyle,
}: Props) {
    const variantStyle = buttonVariants[variant];
    const textVariantStyle = textVariants[variant];
  return (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled  || loading}
        style={[
            styles.button,
            variantStyle,
            (disabled || loading) && styles.disabled,
            style
        ]}
        activeOpacity={0.7}
    >
      <View>
        {IconLeft && <IconLeft style={styles.iconLeft} />}

        {loading ? (
          <ActivityIndicator color="fff" />
        ) : (
          <Text style={[styles.text, textVariantStyle, textStyle]}>{title}</Text>
        )}

        {IconRight && <IconRight style={styles.iconRight} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginVertical: 8,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
  },

  text: {
    fontFamily: "JakartaSemiBold",
    fontSize: 16,
  },

  iconLeft: {
    marginRight: 8,
  },

  iconRight: {
    marginLeft: 8,
  },

  disabled: {
    opacity: 0.6,
  },
});

const buttonVariants = {
  primary: {
    backgroundColor: "#007AFF",
  },
  secondary: {
    backgroundColor: "#6B7280",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  danger: {
    backgroundColor: "#EF4444",
  },
  success: {
    backgroundColor: "#10B981",
  },
};

const textVariants = {
  primary: { color: "#fff" },
  secondary: { color: "#fff" },
  outline: { color: "#007AFF" },
  danger: { color: "#fff" },
  success: { color: "#fff" },
};
