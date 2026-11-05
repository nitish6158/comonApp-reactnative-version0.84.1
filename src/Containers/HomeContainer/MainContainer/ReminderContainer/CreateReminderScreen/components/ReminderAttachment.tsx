import React, { useMemo } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import { Chip } from "react-native-ui-lib";
import FastImage from "@d11/react-native-fast-image";
import FileViewer from "react-native-file-viewer";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useAppSelector } from "@/redux/Store";
import { getFileName } from "@/utils/helpers/FilePathUtility";
import { DownloadAttachmentView } from "../../ViewReminderScreen/components/SingleViewReminder";
import useFileSystem from "@/hooks/useFileSystem";
import { AgendaAttachmentInput, AttachmentType } from "@/graphql/generated/types";
import docIcon from "@Assets/images/docs";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type ReminderAttachmentProps = {
  attachment: AgendaAttachmentInput;
  onDelete: () => void;
};

export default function ReminderAttachment({ attachment, onDelete }: ReminderAttachmentProps) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const DownloadFileStore = useAppSelector((state) => state.Chat.DownloadFileStore);
  const { checkDownloadFileFolder, saveFileToDownloads } = useFileSystem();

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

  if (!isFileLocallyFound) {
    return (
      <View
        style={{
          marginRight: 8,
          marginBottom: 3,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 5,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.1)',
          paddingVertical:5,
          paddingHorizontal: 8, 
        }}
      >
        <Text style={{fontSize: 14,opacity: 0.5}}>{getFileName(displayName ?? "")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DownloadAttachmentView url={attachment.url} />
          <Chip
            label={""}
            leftElement={
              <Pressable onPress={onDelete} style={{ paddingHorizontal: 13 }}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="red" />
              </Pressable>
            }
            borderRadius={5}
            style={{ marginLeft: 10, borderRadius: 10, borderWidth: 1, borderColor: "red" }}
          />
        </View>
      </View>
    );
  }

  return (
    <Menu>
      <MenuTrigger>
        <View style={{ marginRight: 8, marginBottom: 3  }}>
          <Chip
            label={getFileName(displayName ?? "")}
            leftElement={<FastImage source={docIcon.doc} style={{ height: 20, width: 20 }} />}
            style={{flexDirection: "row", alignItems: "center",borderRadius: 5,borderWidth: 1,borderColor: 'rgba(0,0,0,0.1)',paddingVertical:7,paddingHorizontal: 8}}
            labelStyle={{fontSize: 14}}
          />
        </View>
      </MenuTrigger>
      <MenuOptions optionsContainerStyle={{ width: 100 }}>
        <MenuOption onSelect={handleViewAttechment} text={t("reminders.view")} />
        <MenuOption onSelect={onDelete} text={t("reminders.delete")} />
      </MenuOptions>
    </Menu>
  );

  async function handleViewAttechment() {
    if (attachment.type === AttachmentType["Photo"] || attachment.type === AttachmentType["Video"]) {
      navigation.navigate("AttachmentViewScreen", {
        attachment: attachment,
      });
    } else {
      let file = await checkDownloadFileFolder(displayName);
      if (!file) {
        file = await saveFileToDownloads(`${DefaultImageUrl}${attachment.url}`, displayName);
      }
      console.log("file", file);
      FileViewer.open(file, {
        showOpenWithDialog: true,
        showAppsSuggestions: true,
      });
    }
  }
}
