import Toast from "react-native-root-toast";

export default function ToastMessage(message: string, byContactSyncing: boolean = false) {
  Toast.show(message, {
    // duration: Toast.durations.LONG,
    duration: byContactSyncing ? 5000 : Toast.durations.LONG,
    position: Toast.positions.TOP,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    containerStyle: { marginTop: 30 },
  });
}
