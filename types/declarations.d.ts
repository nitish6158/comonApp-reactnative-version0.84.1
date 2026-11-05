declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "react-native-formatted-text";

declare module "redux-logger";

declare module "google-libphonenumber";

declare module "react-native-calendar-picker";

declare module "react-native-call-detection";

declare module "react-native-countdown-component";

declare module "react-native-version-check";
