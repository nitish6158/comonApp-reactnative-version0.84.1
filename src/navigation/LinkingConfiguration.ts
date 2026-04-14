import { LinkingOptions } from "@react-navigation/native";
import { RootStackParamList } from "@Types/types";

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ["comon://"],
  config: {
    screens: {},
  },
};

export default linking;
