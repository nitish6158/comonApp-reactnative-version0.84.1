//This file is handling any of the music being played externally by any music player which will be stopped while receiving webrtc call for both android and iOS.

import MusicControl, { Command } from "react-native-music-control";
import { Platform } from "react-native";
import { enableExternalMedia, stopExternalMedia } from "../../modules/AudioFocusModule";

const iOS = Platform.OS === "ios";
const android = Platform.OS === "android";

export async function stopAllPlayers() {
  if (android) stopExternalMedia();
  if (MusicControl.STATE_PLAYING && iOS) MusicControl.on(Command.stop, () => {});
}

export function enableAllPlayers() {
  if (android) enableExternalMedia();
  if (iOS) MusicControl.on(Command.play, () => {});
}
