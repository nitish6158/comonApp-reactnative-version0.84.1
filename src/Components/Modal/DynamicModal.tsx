import { Colors } from "@/Constants";
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
};

interface DynamicModalProps {
  visible: boolean;
  data: string;
  description?: string;
  buttons: ButtonProps[];
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  visible,
  data,
  buttons,
  description,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.content}>
            {typeof data === "string" ? (
              <Text style={styles.text}>{data}</Text>
            ) : (
              data
            )}
          </View>
          {description && (
            <View style={styles.content}>
              {typeof data === "string" ? (
                <Text style={styles.text}>{description}</Text>
              ) : (
                description
              )}
            </View>
          )}
          <View style={styles.buttonContainer}>
            {buttons.map((btn, index) => (
              <Pressable
                key={index}
                style={[
                  styles.button,
                  { backgroundColor: btn.color || Colors.light.PrimaryColor },
                ]}
                onPress={btn.onPress}
              >
                <Text style={styles.buttonText}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DynamicModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: width * 0.8,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  content: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 25,
    color: "#333",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginHorizontal: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
