import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
//import liraries
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AnimatedTextInput from "@Components/AnimatedTextInput";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import GroupImage from "./GroupImage";
import ImageSelectionView from "./ImageSelectionView";
import { ReduxChat } from "@Types/types";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { currentTimeinUnix } from "@Util/date";
import fonts from "@/Constants/fonts";
import { generateRNFile } from "@Util/chatUtils/generateRNFile";
import { isEmpty } from "lodash";
import { navigate } from "@Navigation/utility";

import { useTranslation } from "react-i18next";
import { useUploadChatFileMutation } from "@Service/generated/auth.generated";
import { socket } from "@/redux/Reducer/SocketSlice";
import { useAppSelector } from "@/redux/Store";
import { CreateGroupScreenProps } from "@/navigation/screenPropsTypes";
import uuid from "react-native-uuid";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";
import { useAtom } from "jotai";
import { singleRoom } from "@/Atoms";
import { produce } from "immer";
import { DefaultImageUrl, ImageUrl } from "@/graphql/provider/endpoints";

function CreateGroupProfile({ navigation, route }: CreateGroupScreenProps) {
  const [Fileupload, { loading: signUpLoading }] = useUploadChatFileMutation();

  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);

  const [name, setName] = useState("");
  const [groupImage, setGroupImage] = useState<[{ uri: string; type: string }]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [display, setDisplay] = useAtom(singleRoom);

  const { t } = useTranslation();
  const { width, height } = Dimensions.get("window");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerContainer}>
          {loading && <CommonLoader />}
          <View
            style={{
              marginTop: 20,
              marginBottom: 30,
              paddingHorizontal: 15,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <AntDesign
              name="left"
              size={24}
              color="black"
              onPress={() => {
                setGroupImage([]);
                setName("");
                navigation.goBack();
              }}
            />
            <Text style={{ marginLeft: 10, fontSize: 18, fontFamily: fonts.Lato }}>
              {route.params.mode == "update"
                ? t("others.Change-image")
                : t("navigation.create-user-group")}
            </Text>
          </View>
          <View style={{ justifyContent: "flex-start", flexGrow: 1 }}>
            <GroupImage
              groupImage={groupImage}
              OldImage={route.params.updateData?.oldImage}
              UpdateProfile={route.params.mode == "update"}
            />

            {route.params.mode == "add" && (
              <AnimatedTextInput
                text={t("create-user-group.Name")}
                value={name}
                onChangeText={(e: string) => {
                  setName(e);
                }}
              />
            )}

            <ImageSelectionView
              setGroupIcon={setGroupImage}
              GroupImage={groupImage}
            />
          </View>
          <Pressable
            style={{
              alignSelf: "center",
              width: width / 2,
              borderRadius: 13,
              borderColor: "gray",
              borderWidth: 1,
              height: 45,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
            }}
            onPress={async () => {
              if (route.params.mode == "update") {
                let payload = await UploadImage();
                console.log("upload image payload", payload);
                socketConnect.emit("setRoomPicture", payload);
                const imageUrl = payload?.imageURl ?? ImageUrl;
                setDisplay(
                  produce(display, (draftDisplay) => {
                    draftDisplay.roomImage = imageUrl;
                  })
                );
                setTimeout(() => {
                  socketManager.chatRoom.fetchAndUpdateRooms();
                  setLoading(false);
                  setGroupImage([]);
                  navigation.goBack();
                }, 3000);
              } else {
                if (!isEmpty(name)) {
                  let payload = null;
                  if (!isEmpty(groupImage)) {
                    payload = await UploadImage();
                  }
                  navigation.replace("SelectParticipantForGroup", {
                    roomName: name,
                    roomImage: payload?.imageURl,
                  });
                  setName("");
                  setGroupImage("");
                } else {
                  ToastMessage(`${t("toastmessage.please-enter-group-name")}`);
                }
              }
            }}
          >
            <Text>{t("btn.Continue")}</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

  async function UploadImage() {
    if (!isEmpty(groupImage)) {
      try {
        const url = groupImage[0]?.path;
        const filename = `${currentTimeinUnix()}.${url.split(".").pop()}`;
        setLoading(true);

        const fileUrl = generateRNFile({
          uri: url,
          name: filename,
        });

        let res = await Fileupload({
          variables: {
            file: fileUrl,
            input: {
              roomId: route.params.updateData?.roomId ?? uuid.v4(),
              _id: MyProfile?._id,
            },
          },
        });

        if (res) {
          const payload = {
            imageURl: res?.data?.UploadChatFile?.data.filename,
            roomId: route.params.updateData?.roomId,
          };
          setLoading(false);

          return payload;
        }
      } catch (error) {
        setLoading(false);
      }
    } else {
      ToastMessage(`${t("toastmessage.please-upload-new-group-image")}`);
    }
  }
}

// define your styles
const styles = StyleSheet.create({
  activeButton: {
    borderColor: Colors.light.PrimaryColor,
  },
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  continueButtonCon: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 4,
    borderWidth: 1.3,
    height: 50,
    justifyContent: "center",
    marginTop: "10%",
    width: "89%",
  },

  unactiveButton: {
    borderColor: Colors.light.gray,
  },
  unactiveText: {
    color: Colors.light.gray,
  },
  activeText: {
    color: Colors.light.PrimaryColor,
  },
});

//make this component available to the app
export default CreateGroupProfile;
