declare module "react-native-updated-proximity" {
  const proximity: {
    addListener(callback: (data: { Proximity: boolean }) => void): void;
    removeListener(callback: (data: { Proximity: boolean }) => void): void;
  };
  export default proximity;
}
