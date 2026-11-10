import type { ImageSourcePropType } from "react-native";

declare module "*.png" {
  const value: ImageSourcePropType;
  export default value;
}

declare global {
  // Used across chat/call for the active room and shared audio player instance.
  // Kept loose intentionally — many call sites write/read these as globals.
  // eslint-disable-next-line no-var
  var roomId: string | null | undefined;
  // eslint-disable-next-line no-var
  var audioPlayer: any;
  // eslint-disable-next-line no-var
  var activeOrg: string | null | undefined;
  // eslint-disable-next-line no-var
  var androidBackgroundNotificationPress: any;
}

export {};
