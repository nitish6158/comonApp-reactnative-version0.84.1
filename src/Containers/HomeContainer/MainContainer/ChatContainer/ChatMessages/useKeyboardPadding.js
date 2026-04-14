import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export default function useKeyboardPadding() {
  const [padding, setPadding] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      if (Platform.OS === "android") {
        setPadding(e.endCoordinates.height);
      }
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setPadding(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return padding;
}
