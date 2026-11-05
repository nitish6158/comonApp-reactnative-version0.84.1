import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Chip } from "react-native-ui-lib";
import FastImage from "@d11/react-native-fast-image";
import Ionicons from "react-native-vector-icons/Ionicons";
import FileViewer from "react-native-file-viewer";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { AttachmentType } from "@/graphql/generated/types";
import { navigate } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";
import GetExtension from "@Util/getExtensionfromUrl";
import useFileSystem from "@/hooks/useFileSystem";
import { getFileName } from "@/utils/helpers/FilePathUtility";
import { DownloadAttachmentView } from "@/Containers/HomeContainer/MainContainer/ReminderContainer/ViewReminderScreen/components/SingleViewReminder";
import { useAppSelector } from "@/redux/Store";
import { uploadResultType } from "../../ReminderContainer/CreateReminderScreen/components/UploadAttachmentView";
import docIcon from "@Assets/images/docs";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";

type ViewAttachmentProps = {
  attachment: uploadResultType;
};
export default function CustomAttachmentView({ attachment }: ViewAttachmentProps) {
  const { t } = useTranslation();
  const DownloadFileStore = useAppSelector((state) => state.Chat.DownloadFileStore);
  const { getFileLocationByFilename, saveFileToDownloads, checkDownloadFileFolder } = useFileSystem();

  const [openFileProgress, setOpenFileProgress] = useState(false);

  const { displayName, isFileLocallyFound } = useMemo(() => {
    const displayName = attachment.url?.split("name-").pop();
    const fileName = attachment.url?.split("attachments/").pop();
    let isFileLocallyFound = DownloadFileStore.find((v) => v === fileName);

    if (!isFileLocallyFound) {
      isFileLocallyFound = DownloadFileStore.find((v) => v === displayName);
    }

    if (!isFileLocallyFound) {
      isFileLocallyFound = DownloadFileStore.find((v) => {
        let a = v.split("name-").pop();
        return a === displayName;
      });
    }

    // console.log(DownloadFileStore, isFileLocallyFound, displayName, fileName);

    return { displayName, isFileLocallyFound };
  }, [attachment.url, DownloadFileStore]);

  if (isFileLocallyFound) {
    if (openFileProgress) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginRight: 8,
            marginBottom: 20,
          }}
        >
          <Text>Opening File {displayName} ...</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity onPress={handleAttachmentView} style={{ marginRight: 8, marginBottom: 20 }}>
        <Chip
          style={[styles.inputBox, { flexDirection: "row", alignItems: "center" }]}
          label={displayName?.slice(-30)}
          leftElement={<FastImage source={docIcon.doc} style={{ height: 20, width: 20 }} />}
          borderRadius={5}
        />
      </TouchableOpacity>
    );
  } else {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="attach" size={22} color="black" />
          <Text style={{ marginLeft: 5 }}>{getFileName(displayName ?? "")}</Text>
        </View>
        <DownloadAttachmentView url={attachment.url} />
      </View>
    );
  }

  async function handleAttachmentView() {
    if (attachment.type === AttachmentType["Photo"] || attachment.type === AttachmentType["Video"]) {
      navigate("AttachmentViewScreen", {
        attachment: attachment,
      });
    } else {
      setOpenFileProgress(true);
      let file = await checkDownloadFileFolder(attachment.name);
      if (!file) {
        file = await saveFileToDownloads(`${DefaultImageUrl}${attachment.url}`, attachment.name);
      }
      console.log("file", file);
      FileViewer.open(file, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      });
      setOpenFileProgress(false);
    }
  }
}

const styles = {
  inputBox: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
};
