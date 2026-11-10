// @ts-nocheck
/**
 * Legacy Icon map — bridges to the centralized WhatsApp-inspired SVG registry.
 * Prefer `import { AppIcon } from "@/Components/icons"` in new code.
 */
import { iconRegistry } from "../../src/Components/icons/iconRegistry";
const ScheduleIcon = require("./scheduleIcon.png");

const Icon = {
  ScheduleIcon,
  MissedCall: iconRegistry.phoneMissed,
  MissedVideo: iconRegistry.videoMissed,
  PhoneAdd: iconRegistry.phoneAdd,
  Search: iconRegistry.search,
  VideoCall: iconRegistry.video,
  AudioCall: iconRegistry.phone,
  Group: iconRegistry.users,
  Check: iconRegistry.check,
  CheckDark: iconRegistry.check,
  CloseCall: iconRegistry.endCall,
  MuteOn: iconRegistry.unmute,
  MuteOff: iconRegistry.mute,
  SpeakerOn: iconRegistry.speaker,
  SpeakerOff: iconRegistry.speakerOff,
  VideoOn: iconRegistry.video,
  VideoOff: iconRegistry.videoMissed,
  UserAvatar: iconRegistry.user,
  BluetoothConnected: iconRegistry.bluetooth,
  SwitchCamera: iconRegistry.switchCamera,
  info: iconRegistry.info,
  MicOfMedium: iconRegistry.mute,
  MicOnMedium: iconRegistry.unmute,
  GroupAudioIcon: iconRegistry.phone,
  GroupVideoIcon: iconRegistry.video,
  videoCalling: iconRegistry.video,
  OutGoingCall: iconRegistry.outgoingCall,
  IncomingCall: iconRegistry.incomingCall,
  OutgoingVideoCall: iconRegistry.video,
};

export default Icon;
