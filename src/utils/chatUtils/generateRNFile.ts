// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore because @types/react-native-mime-types not found
import * as mime from "react-native-mime-types";
import {createUploadLink, ReactNativeFile} from "apollo-upload-client";

export const generateRNFile = (file: { uri: string; name: string }) => {
  let fileName = file?.name?.replace(/\s+/g, "");
  return new ReactNativeFile({
    uri: file?.uri,
    type: mime.lookup(fileName?.split?.(".")?.pop()) || "image",
    name: `${Date.now() * 1000}.${fileName?.split?.(".")?.pop()}`,
  });
};
export const generateRNFilethumb = (file: any) =>
  new ReactNativeFile({
    uri: file?.thumbnail,
    type: mime.lookup(file?.mime) || "image",
    name: `${file.type}-${Date.now()}.${file.thumbnail.substring(file?.thumbnail.length - 3)}`,
  });
