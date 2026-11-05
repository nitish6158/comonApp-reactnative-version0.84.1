import { Text, TouchableOpacity, View } from "react-native";

import Colors from "@/Constants/Colors";
import DocumentPreview from "./DocumentPreview";
import FileViewer from "react-native-file-viewer";
import React from "react";
import { windowWidth } from "@Util/ResponsiveView";

const FileNameView = (file: {
  uri: any;
  assetId?: string | null | undefined;
  width?: number;
  height?: number;
  type?: "image" | "video" | "application/pdf" | "application/msword" | "com.microsoft.excel.xls" | undefined;
  name: any;
  fileSize?: number | undefined;
  exif?: Record<string, any> | null | undefined;
  base64?: string | null | undefined;
  duration?: number | null | undefined;
}) => {
  const documentData = {
    fileURL: file.uri,
    filename: file.name,
  };
  const FileOpener = () => {
    FileViewer.open(file.uri);
  };

  return (
    <TouchableOpacity
      onPress={() => {
        FileOpener();
      }}
      style={{
        height: 40,
        paddingHorizontal: 10,
        maxWidth: windowWidth / 2.3,
        backgroundColor: Colors.light.backgroundActive,
        marginTop: 10,
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Text>{file.name}</Text>
    </TouchableOpacity>
  );
};

export default FileNameView;
