import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import Reactotron from "reactotron-react-native";

const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";

Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: "commonapp",
    host,
  })
  .useReactNative({
    asyncStorage: false,
    networking: {
      ignoreUrls: /symbolicate|logs/,
    },
  })
  .connect();

Reactotron.clear?.();

export default Reactotron;
