import { DocsTypes, Hidemessage } from "../../types/types";
import { useDispatch, useSelector } from "react-redux";

import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import RNFS from "react-native-fs";

import Sharing from "react-native-share";
import { isEmpty } from "lodash";
import moment from "moment";
import { Platform } from "react-native";
import { download } from "react-native-compressor";
import { setDownloadFileStore } from "@/redux/Reducer/ChatReducer";
import { getExportMessageText } from "@/utils/exportChatFormatter";
import { useAppSelector } from "@/redux/Store";
import { askMediaPermission, checkMediaPermission } from "@/utils/permission";

const useFileSystem = () => {
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const Dispatch = useDispatch();

  async function unlinkFile(path: string) {
    let isExist = await RNFS.exists(path);
    if (isExist) {
      await RNFS.unlink(path);
      // console.log(`${path} unlink success`);
    } else {
      // console.log(`${path} not found`);
    }
  }

  async function donwloadFiles(files: string[], saveToCameraRole: Array<{}> = []) {
    let i = 0;
    async function donwloadFile() {
      const filesList = await readComonDirectory();
      const tempArr = files[i].split("/");
      const fileName = tempArr[tempArr.length - 1];
      const isExist = filesList?.find(
        (_fileName: any) => _fileName === fileName
      );
      const downloadDest = `${RNFS.DocumentDirectoryPath}/comon/${fileName}`;
      console.log("isExist", isExist);
      if (!isExist) {
        await RNFS.downloadFile({
          fromUrl: `https://storage.googleapis.com/comon-bucket/${files[i]}`,
          toFile: downloadDest,
        }).promise.then(async () => {
          console.log("downloaded");
          const alldownloadeditemlist = await readComonDirectory();
          const extractExtention = files[i].split(".");
          const type = extractExtention[extractExtention.length - 1];
          if (!DocsTypes[type] && !isEmpty(saveToCameraRole)) {
            await saveFileToCameraRoll(downloadDest);
          }

          Dispatch(setDownloadFileStore(alldownloadeditemlist));
        });

        if (i < files.length - 1) {
          i++;
          donwloadFile();
        } else {
          return true;
        }
      } else {
        if (i < files.length - 1) {
          i++;
          donwloadFile();
        } else {
          return true;
        }
      }
    }
    let result = await donwloadFile();
    return result;
  }

  async function downloadMediaToCameraRoll(
    files: string,
    saveToCamera: boolean
  ) {
    const downloadDest = `${RNFS.DocumentDirectoryPath}/comon/${files.slice(
      -15
    )}`;

    const downloadFileUrl = await download(
      `https://storage.googleapis.com/comon-bucket/${files}`,
      (progress) => {}
    );

    const savedFilePath = await copyFile(downloadFileUrl, downloadDest);
    if (saveToCamera) {
      try {
        await saveFileToCameraRoll(savedFilePath);
      } catch (error) {
        console.log(error);
        return false;
      }
    }
    return true;
  }

  async function copyFile(sourceUri: string, files: string) {
    const tempArr = files.split("/");
    const fileName = tempArr[tempArr.length - 1];

    const newPath = `${RNFS.DocumentDirectoryPath}/comon/${fileName}`;

    try {
      await RNFS.copyFile(sourceUri, newPath);
      const alldownloadeditemlist = await readComonDirectory();

      Dispatch(setDownloadFileStore(alldownloadeditemlist));
      return newPath;
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  }

  async function saveFileToCameraRoll(filePath: string) {
    const cameraRollPath = filePath.startsWith("file://") ? filePath : `file://${filePath}`;

    if (Platform.OS === "android") {
      const hasPermission = await checkMediaPermission();
      if (!hasPermission) {
        const granted = await askMediaPermission();
        if (!granted) {
          throw new Error("Media permission not granted");
        }
      }
    }

    const fileExists = await RNFS.exists(filePath.replace("file://", ""));
    if (!fileExists) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    return await CameraRoll.save(cameraRollPath, {
      album: "comon",
    });
  }

  async function readComonDirectory() {
    const directoryPath = `${RNFS.DocumentDirectoryPath}/comon`;
    const filePathExist = await RNFS.exists(directoryPath);
    if (!filePathExist) {
      await RNFS.mkdir(directoryPath);
    }
    const response = await RNFS.readDir(directoryPath);
    const tempName = response.map((item) => item.name);
    return tempName;
  }

  async function createComonDirectory() {
    const newDirectory = `${RNFS.DocumentDirectoryPath}/comon`;
    RNFS.mkdir(newDirectory)
      .then(() => {}) //console.log("Directory created!"))
      .catch((res) => {
        //console.log("failed to create directory", res);
      });
  }

  function getFileLocationByFilename(filepath: string) {
    const tempArr = filepath?.split("/");
    const filename = tempArr[tempArr.length - 1];

    return `${"file://"}${RNFS.DocumentDirectoryPath}/comon/${filename}`;
  }

  function getSenderFullName(participants: any[], senderId: string) {
    const user = participants.find((p) => p.user_id === senderId);
    return `${user?.firstName ?? "N/A"} ${user?.lastName ?? ""}`;
  }

  function getFileName(participants: any[], userId: string) {
    const user = participants.find((p) => p.user_id !== userId);
    return `${user?.firstName ?? "N/A"} ${user?.lastName ?? ""}`;
  }

  async function exportChat(room: any, query, filterRequire?: boolean) {
    const allMessages = Array.isArray(query)
      ? query
      : query?.filtered
      ? query.filtered("type == $0", "text")
      : [];

    let result = "";
    const currentRoom = room || {};
    const participants = currentRoom?.participants ?? [];
    const roomType = currentRoom?.type ?? currentRoom?.roomType;
    const roomName = currentRoom?.name ?? currentRoom?.roomName;

    const path = `${RNFS.DocumentDirectoryPath}/Chat-with-${
      roomType === "individual"
        ? getFileName(participants, MyProfile?._id)
        : roomName?.replace(/\s/g, "_") ?? "N/A"
    }.txt`;

    let currentUserUtiles: any[] = [];
    if (!filterRequire) {
      currentUserUtiles = participants.filter((pn) => pn.user_id == MyProfile?._id);
    } else {
      currentUserUtiles = participants;
    }

    const filtedData = allMessages.filter(
      (chat: any) =>
        chat?.deleted?.findIndex(
          (item: any) =>
            item.type == Hidemessage[item.type] && item.user_id == MyProfile?._id
        ) === -1 &&
        ((currentUserUtiles && currentUserUtiles?.[0]?.left_at == 0) ||
          chat?.created_at < currentUserUtiles?.[0]?.left_at)
    );

    filtedData.forEach((obj: any) => {
      result += `${moment(obj.created_at).format("DD/MM/YYYY, hh:mm a")} - ${getSenderFullName(participants, obj.sender)} : ${getExportMessageText(obj)}\n`;
    });

    await RNFS.writeFile(path, result, "utf8");
    await Sharing.open({
      title: "This is my report ",
      message: "Message:",
      url: `file://${path}`,
      type: "text/plain",
    });
  }

  async function checkDownloadFileFolder(
    fileName: string
  ): Promise<string | null> {
    const downloadPath = `${RNFS.DocumentDirectoryPath}/ComonFiles/${fileName}`;
    const fileExists = await RNFS.exists(downloadPath);
    return fileExists ? downloadPath : null;
  }

  async function saveFileToDownloads(
    fileUrl: string,
    fileName: string
  ): Promise<string> {
    const commonFolderPath = `${RNFS.DocumentDirectoryPath}/ComonFiles`;
    const downloadPath = `${commonFolderPath}/${fileName}`;

    try {
      // Create the common folder if it doesn't exist
      await RNFS.mkdir(commonFolderPath);

      const response = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: downloadPath,
      }).promise;

      if (response.statusCode === 200) {
        console.log("File downloaded successfully to CommonFolder");
        return downloadPath;
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  return {
    donwloadFiles,
    getFileLocationByFilename,
    exportChat,
    createComonDirectory,
    readComonDirectory,
    copyFile,
    downloadMediaToCameraRoll,
    unlinkFile,
    saveFileToDownloads,
    checkDownloadFileFolder,
  };
};

export default useFileSystem;
