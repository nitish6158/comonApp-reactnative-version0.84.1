import { CheckMark, UnCheckMark } from "@Components/CheckMark";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
//import liraries
import React, { useEffect, useState } from "react";

import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { RoomParticipantData } from "@Store/Models/ChatModel";
import { RootState } from "@Store/Reducer";
import SearchInput from "@Components/SearchInput";
import SelectGrupHeader from "../../ChatFolderContainer/CreateFolderScreen/Header";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { navigate, navigateBack } from "@Navigation/utility";
import { produce } from "immer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";

// create a component
const AddAdmin = ({ navigation }: any) => {
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const [display, setDisplay] = useAtom(singleRoom);
  const [searchVisible, setSearchVisible] =
    useState<React.SetStateAction<boolean>>(false);
  const [searchValue, SetSearchValue] = useState("");
  const [FilterRoom, setsetFilterRoom] = useState<RoomParticipantData[]>([]);
  const [PidList, SetPidList] = useState<RoomParticipantData[]>([]);
  const { t } = useTranslation();
  useEffect(() => {
    const comonParti = display.participantsNotLeft.filter(
      (item) => item?.user_id !== MyProfile?._id
    );
    SetPidList(comonParti);
    setsetFilterRoom(comonParti);
  }, []);

  const SearchFilterFunction = (text: string) => {
    SetSearchValue(text);
    if (text.length > 0) {
      const newData = PidList.filter((item) => {
        const itemData =
          item.firstName.toLowerCase() + item.lastName.toLowerCase();
        const textData = text.toLowerCase();
        return itemData.indexOf(textData) > -1;
      });
      setsetFilterRoom(newData);
    } else {
      setsetFilterRoom(PidList);
    }
  };

  const updateData = () => {
    const updatedParticipants = PidList;
    const data = {
      roomId: display.roomId,
      admin: updatedParticipants.filter((ad) => ad.user_type == "admin").map((adb) => {
        return adb.user_id;
      }),
      common: updatedParticipants.filter((com) => com.user_type == "common").map(
        (adb) => {
          return adb.user_id;
        }
      ),
    };
    // console.log(data);
    // return
    socketConnect.emit("updateRoomAdmin", data);
    ToastMessage(`${t("toastmessage.role-update-successfully")}`);

    const roleMap = new Map(updatedParticipants.map((participant) => [participant.user_id, participant.user_type]));
    setDisplay((prevDisplay: any) => {
      const participants = Array.isArray(prevDisplay?.participants)
        ? prevDisplay.participants.map((participant: any) =>
            roleMap.has(participant.user_id)
              ? { ...participant, user_type: roleMap.get(participant.user_id) }
              : participant
          )
        : [];

      const participantsNotLeft = participants.filter((participant: any) => participant.left_at === 0);
      const currentUserUtility =
        participants.find((participant: any) => participant.user_id === prevDisplay?.currentUserUtility?.user_id) ??
        prevDisplay?.currentUserUtility;

      return {
        ...prevDisplay,
        participants,
        participantsNotLeft,
        currentUserUtility,
        isCurrentUserAdmin: currentUserUtility?.user_type === "admin",
      };
    });

    setTimeout(() => {
      navigateBack();
    }, 2000);
    socketManager.chatRoom.fetchAndUpdateRooms();
  };

  return (
    <View style={styles.container}>
      {searchVisible ? (
        <SelectGrupHeader
          // isEdit={true}
          Title={t("group-info.add-admins")}
          onbackPresss={() => {
            setSearchVisible(false);
          }}
          onCheck={() => {
            updateData();
          }}
          pencil={false}
        />
      ) : (
        <SelectGrupHeader
          // isEdit={true}
          Title={t("group-info.add-admins")}
          onbackPresss={() => {
            navigate("ChatProfileScreen");
          }}
          onCheck={() => {
            updateData();
          }}
          pencil={false}
          OnSearch={() => {
            setSearchVisible(true);
          }}
        />
      )}

      {searchVisible && (
        <View style={{ marginVertical: 10 }}>
          <SearchInput
            SearchValue={searchValue}
            SetSearchValue={(e) => SearchFilterFunction(e)}
            placeHolder={t("chat-screen.search-users")}
          />
        </View>
      )}
      <FlatList
        data={FilterRoom}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              style={styles.itemCon}
              onPress={() => {
                const toggleRole = (list: RoomParticipantData[]) =>
                  produce(list, (draftFilter) => {
                    return draftFilter.map((df) => {
                      if (df.user_id == item.user_id) {
                        if (df.user_type == "admin") {
                          return { ...df, user_type: "common" };
                        }
                        return { ...df, user_type: "admin" };
                      }
                      return df;
                    });
                  });

                const updatedAllParticipants = toggleRole(PidList);
                SetPidList(updatedAllParticipants);

                if (searchValue.length > 0) {
                  const textData = searchValue.toLowerCase();
                  setsetFilterRoom(
                    updatedAllParticipants.filter((participant) => {
                      const itemData =
                        participant.firstName.toLowerCase() +
                        participant.lastName.toLowerCase();
                      return itemData.indexOf(textData) > -1;
                    })
                  );
                } else {
                  setsetFilterRoom(updatedAllParticipants);
                }
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <AvtaarWithoutTitle
                  ImageSource={{ uri: `${DefaultImageUrl}${item.profile_img}` }}
                />
                <View style={styles.name}>
                  <Text size="sm">{item.firstName + " " + item.lastName}</Text>
                </View>
              </View>

              {item.user_type == "admin" ? (
                <CheckMark checkStyle={styles.mark} />
              ) : (
                <UnCheckMark unCheckStyle={styles.mark} />
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  alphabate: {
    backgroundColor: Colors.light.LightBlue,
    height: 30,
    justifyContent: "center",
  },
  alphabatetext: {
    color: Colors.light.PrimaryColor,
    marginLeft: 10,
    textAlignVertical: "center",
  },
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  itemCon: {
    alignItems: "center",
    borderBottomWidth: 0.4,
    borderColor: Colors.light.Hiddengray,
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    paddingVertical: 10,
  },
  mark: { marginRight: 10, position: "relative" },
  name: { justifyContent: "center", marginLeft: 20, width: 200 },
});

//make this component available to the app
export default AddAdmin;
