import { NativeModules } from "react-native";

const { AudioFocusModule } = NativeModules;

/**This module is handling the background music played on android only to stop the music while receiving webrtc call */
//Only for android.

export async function stopExternalMedia() {
  await AudioFocusModule.stopExternalMediaFocus();
}

export async function enableExternalMedia() {
  await AudioFocusModule.releaseAudioFocus();
}
