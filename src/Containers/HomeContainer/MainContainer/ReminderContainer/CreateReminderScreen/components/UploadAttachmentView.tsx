import { currentUserIdAtom } from "@/Atoms";
import { useGetUploadSignedUrlLazyQuery } from "@/graphql/generated/room.generated";
import useFileSystem from "@/hooks/useFileSystem";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Chip } from "react-native-ui-lib";
import * as Progress from "react-native-progress";
import React from "react";
import { Colors } from "@/Constants";
import { backgroundUpload, uuidv4 } from "react-native-compressor";
import AntDesign from "react-native-vector-icons/AntDesign";
import ToastMessage from "@/utils/ToastMesage";
import * as RNFS from "react-native-fs";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { getFileName } from "@/utils/helpers/FilePathUtility";

export type uploadResultType = {
  _id: string;
  name: string;
  url: string;
  duration: number | null;
  type: string;
  thumbnail: null | string;
  mimeType: string;
};

type UploadAttachmentViewProps = {
  item: any;
  onUploadDone: (data: uploadResultType) => void;
  onCancel?: (item) => void;
  onError?: (item) => void;
};

export default function UploadAttachmentView({ item, onUploadDone, onCancel, onError }: UploadAttachmentViewProps) {
  const [getUrl] = useGetUploadSignedUrlLazyQuery();
  const { copyFile, getFileLocationByFilename } = useFileSystem();
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    AttachmentUpload(item);
  }, []);

  const name = useMemo(() => {
    return item.name.split(" ").join("");
  }, []);

  return (
    <View style={{ marginRight: 8, marginBottom: 3, alignSelf: "flex-start" }}>
      <Chip
        label={getFileName(name)}
        leftElement={
          <Progress.Circle
            animated={true}
            size={20}
            progress={progress}
            color={Colors.light.PrimaryColor}
            thickness={3}
            style={{ marginLeft: 5 }}
          />
        }
        borderRadius={5}
        rightElement={
          <Pressable onPress={() => onCancel && onCancel(item)}>
            <AntDesign size={22} color={"red"} name="close" />
          </Pressable>
        }
      />
    </View>
  );

  async function AttachmentUpload(res: any) {
    const id = uuidv4();
    const userId = storage.getString(keys.userId);
    const fileName = `${id}-name-${name}`;
    const serverPath = `${userId}/attachments/${fileName}`;

    if (!res) throw new Error("File not found");

    try {
      const response = await getUrl({
        variables: {
          input: {
            path: serverPath,
            contentType: res.type,
          },
        },
      });

      const uploadUrl = response.data?.getUploadSignedUrl.url;
      if (!uploadUrl) throw new Error("Upload URL not found");

      const decodedUri = decodeURIComponent(res.fileCopyUri);
      const headers = { "Content-Type": res.type };

      const uploadResult = await backgroundUpload(
        uploadUrl,
        decodedUri,
        { httpMethod: "PUT", headers },
        (written, total) => setProgress(written / total)
      );

      if (uploadResult) {
        await copyFile(res.fileCopyUri, name);
        onUploadDone({
          _id: id,
          name: name,
          url: serverPath,
          duration: null,
          type: res.docType,
          thumbnail: null,
          mimeType: res.type,
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      onError && onError(item);
      ToastMessage(error?.message ?? "There was an error uploading the file");
    }
  }
}
