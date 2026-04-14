import { CommonUserList, ContactInfo, ReduxChat } from "@Types/types";
import {
  Button,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { Component, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import AudioSlider from "@Components/AudioPlayer/src/AudioSlider";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import ChatContactView from "@Components/ChatContactView";
import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";
import DividingDateChat from "@Components/DividingDateChat";
import DoneAll from "@Images/done-all.svg";
import Entypo from "react-native-vector-icons/Entypo";
import FastImage from "@d11/react-native-fast-image";
import { Icon } from "react-native-elements";
import { ImageUrl } from "@Service/provider/endpoints";
import ReadByUserlist from "./readbyuserList";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import TextMessagePreview from "@Components/TextMessagePreview";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useTranslation } from "react-i18next";
import FormatTextRender from "@/Components/formatTextRender";
import PollMessageComponent from "../ChatMessages/MessageComponents/PollMessageComponent";
import Video from "react-native-video";

function ListItem({ title, isData, time, roomType }: any) {
  return (
    <View style={[styles.readbymessagecon, { marginTop: 6 }]}>
      <View style={styles.readbyText}>
        <DoneAll />
        <Text style={styles.readybyText1}>{title}</Text>
      </View>
      <View>
        {isData ? (
          roomType != "individual" && (
            <Text style={{ marginTop: 10 }}>
              {moment(time).format("DD MMM YYYY, hh:mm ")}
            </Text>
          )
        ) : roomType == "self" ? (
          <Text style={{ marginLeft: 25, fontSize: 14 }}>
            {moment(time).format("MMMM D, hh:mm ")}
          </Text>
        ) : (
          <Text style={{ marginLeft: 25 }}>___</Text>
        )}
      </View>
    </View>
  );
}

const ChatMessageInfo = ({ route, navigation }: any) => {
  const { getFileLocationByFilename } = useFileSystem();
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const [display] = useAtom(singleRoom);
  const [ChatRooms] = useAtom(AllChatRooms);
  const { t } = useTranslation();

  const MessageAvataarwithName = ({ SenderId }: { SenderId: string }) => {
    const isSender = display.participants?.filter(
      (item) => item?.user_id == SenderId
    );
    const isExistInContactList = comonContact.filter(
      (localUser: any) => localUser._id == SenderId
    );
    const Nameis =
      isSender.length > 0
        ? isExistInContactList.length > 0
          ? isExistInContactList[0].firstName +
            " " +
            isExistInContactList[0].lastName
          : isSender[0].phone
        : "";
    return (
      <View style={{ flexDirection: "row" }}>
        <AvtaarWithoutTitle
          ImageSource={{ uri: "https://picsum.photos/seed/picsum/200/300" }}
          AvatarContainerStyle={{ height: 32, width: 32, marginLeft: 5 }}
        />
        <Text size="md" style={{ marginLeft: 10, marginTop: 5 }}>
          {Nameis}
        </Text>
      </View>
    );
  };

  const { Item } = route?.params;

  const Timstamp = moment
    .unix(Math.floor(Item?.created_at / 1000))
    .tz(moment.tz.guess())
    .format("DD/MM/YYYY");
  const UnixTime = moment
    .unix(Math.floor(Item?.created_at / 1000))
    .tz(moment.tz.guess())
    .format("LT");
  const Dispatch = useDispatch();
  let ContactInfo: ContactInfo = {
    _id: "",
    firstName: "",
    lastName: "",
    profile_img: "",
  };
  if (Item?.type == "contact") {
    ContactInfo = JSON.parse(Item?.message);
  }

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = Item.message;
    const matches = resultMessage.match(regex) ?? [];

    // console.log(message, matches);
    if (matches.length > 0) {
      const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i].indexOf("(");
        const end = matches[i].indexOf(")");
        const userID = matches[i].slice(start + 1, end);
        const phoneStart = matches[i].indexOf("[");
        const phoneEnd = matches[i].indexOf("]");
        const phone = matches[i].slice(phoneStart + 1, phoneEnd - 1);

        if (display.currentUserUtility.user_id == userID) {
          ids?.push("You");
        } else {
          const isExist = comonContact.find(
            (contact) => contact.userId?._id == userID
          );
          if (isExist) {
            ids?.push(`${isExist.firstName} ${isExist.lastName}`);
          } else {
            ids?.push(phone);
          }
        }
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]} @`);
      }
    }

    return resultMessage;
  }, [display.roomType, Item.message, display.participants, comonContact]);

  return (
    <>
      <CommonHeader
        title={t("others.Message info")}
        screenName="ChatMessageScreen"
      />
      <ScrollView
        style={{ backgroundColor: "#fff" }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <DividingDateChat Time={Timstamp} />

          <Pressable
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              marginVertical: 9,
              alignSelf:
                MyProfile?._id !== Item?.sender ? "flex-start" : "flex-end",
              marginLeft: MyProfile?._id !== Item?.sender ? 10 : 0,
              marginRight: 35,

              maxWidth: "85%",
            }}
          >
            {MyProfile?._id !== Item?.sender && (
              <MessageAvataarwithName SenderId={Item?.sender} />
            )}

            <View
              style={{
                flexDirection: "row",
                alignSelf: "flex-end",
                marginTop: 19,
              }}
            >
              {MyProfile?._id == Item?.sender && (
                <View style={styles.senderTimeCon}>
                  <Text size="xs" style={styles.sendertime}>
                    {UnixTime}
                  </Text>
                </View>
              )}
              <View
                style={[
                  // eslint-disable-next-line react-native/no-inline-styles
                  styles.messageContainer,

                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    // flex: 4,
                    backgroundColor: "rgb(224,250,255)",
                    marginLeft: MyProfile?._id == Item?.sender ? 0 : 35,
                    flexDirection: "column",
                  },
                  Item.type == "IMAGE" && { backgroundColor: "transparent" },

                  // styles.MainMessageContainer,
                ]}
              >
                {Item?.reply_msg && (
                  <View
                    // eslint-disable-next-line react-native/no-inline-styles
                    style={{
                      backgroundColor:
                        MyProfile?._id == Item?.sender
                          ? Colors.light.White
                          : Colors.light.PrimaryColor,
                      borderRadius: 5,
                      padding: 4,
                    }}
                  >
                    <Text
                      size="sm"
                      style={{
                        color:
                          MyProfile?._id !== Item?.sender
                            ? Colors.light.White
                            : "black",
                      }}
                    >
                      {Item?.reply_msg?.[0]?.message}
                    </Text>
                  </View>
                )}
                {Item?.type == "contact" &&
                  Item?.deleted[0]?.type !== "everyone" && (
                    <ChatContactView
                      ContactInfo={ContactInfo}
                      AllRoooms={ChatRooms}
                      Dispatch={Dispatch}
                      Getalluserlist={comonContact}
                      MyProfile={MyProfile}
                      item={Item}
                      navigation={navigation}
                    />
                  )}
                {Item.fileURL !== null && Item.type == "IMAGE" && (
                  <View style={styles.ImageStyle}>
                    <FastImage
                      source={{ uri: getFileLocationByFilename(Item.fileURL) }}
                      style={{ height: "100%", width: "100%" }}
                    />
                  </View>
                )}
                {Item.type == "VIDEO" && (
                  <Video
                    source={{ uri: getFileLocationByFilename(Item.fileURL) }}
                    style={{
                      height: 300,
                      width: 200,
                      backgroundColor: "black",
                    }}
                    controls={true}
                    resizeMode="cover"
                    paused={false}
                  />
                )}
                {Item.type == "poll" && (
                  <PollMessageComponent
                    isVisible={Item?.type == "poll"}
                    isMessageDeletedForEveryOne={
                      Item?.deleted[0]?.type == "everyone"
                    }
                    isMessageForwarded={false}
                    message={Item}
                    searchText={""}
                  />
                )}
                {Item?.type == "PDF" || Item?.type == "APPLICATION" ? (
                  <Pressable
                    style={{ flexDirection: "row" }}
                    // onPress={() => {
                    //   setPdfVisible(true);
                    //   setpdfFileUrl(`https://storage.googleapis.com/comon-bucket/${Item.fileURL}`);
                    // }}
                  >
                    {Item?.type == "PDF" ? (
                      <FastImage
                        style={{ height: 40, width: 40 }}
                        source={require("@Images/pdf.png")}
                      />
                    ) : (
                      <FastImage
                        style={{ height: 40, width: 40 }}
                        source={require("@Images/google-docs.png")}
                      />
                    )}
                    <View style={{ width: 140 }}>
                      <Text
                        style={{
                          color:
                            MyProfile?._id !== Item?.sender
                              ? Colors.light.PrimaryColor
                              : Colors.light.White,
                        }}
                      >
                        {Item.fileURL}
                      </Text>
                    </View>
                    {/* <Pdffile /> */}
                  </Pressable>
                ) : null}

                {Item.message !== null &&
                  Item?.type !== "contact" &&
                  Item.type !== "poll" && (
                    // You deleted this message
                    <View style={{ flexDirection: "row" }}>
                      {Item.message == "You deleted this message" && (
                        <View style={styles.deletealert}>
                          <Icon
                            name="close"
                            color={Colors.light.White}
                            size={12}
                          />
                        </View>
                      )}
                      <FormatTextRender
                        searchText={""}
                        message={FormattedMessage}
                      />
                      {/* <TextMessagePreview isGroup={false} formatedParticipants={{}} item={Item} searchText="" /> */}
                    </View>
                  )}
                {Item?.type == "AUDIO" && (
                  <>
                    {Item.isForwarded &&
                      Item.message !== "You deleted this message" && (
                        <View style={{ flexDirection: "row" }}>
                          <Entypo
                            name="forward"
                            size={15}
                            style={{ marginRight: 5 }}
                            color={
                              MyProfile?._id == Item?.sender
                                ? Colors.light.White
                                : "black"
                            }
                          />
                          <Text
                            // eslint-disable-next-line react-native/no-color-literals
                            style={{
                              color:
                                MyProfile?._id == Item?.sender
                                  ? Colors.light.White
                                  : "black",
                            }}
                            size="xs"
                          >{`${"forwarded"}`}</Text>
                        </View>
                      )}
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <AudioSlider
                        topColor={
                          MyProfile?._id !== Item?.sender
                            ? Colors.light.PrimaryColor
                            : Colors.light.White
                        }
                        backgroundColor={
                          MyProfile?._id == Item?.sender
                            ? Colors.light.PrimaryColor
                            : Colors.light.White
                        }
                        audio={getFileLocationByFilename(Item.fileURL)}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </Pressable>

          <ListItem
            title={t("Hidden-Files.read")}
            isData={!isEmpty(Item.read_by)}
            time={
              display.roomType == "self"
                ? Item.created_at
                : Item.read_by[0]?.read_at
            }
            roomType={display.roomType}
          />

          {Item.read_by.map((seenlist: any) => {
            const findUserDetail = display?.participants?.find(
              (pUser) => pUser.user_id == seenlist.user_id
            );
            const isBlocked = MyProfile.blockedRooms.filter(
              (blr) => blr.pid == seenlist.user_id
            );

            const onComon = comonContact.filter(
              (cf) => cf.userId._id == seenlist.user_id
            );
            const userName =
              onComon.length > 0
                ? onComon[0].firstName + " " + onComon[0].lastName
                : findUserDetail?.phone;
            const userImage =
              isBlocked.length > 0 ? ImageUrl : findUserDetail?.profile_img;

            return (
              <ReadByUserlist
                Name={userName}
                userImage={userImage}
                time={seenlist.read_at}
              />
            );
          })}

          <ListItem
            title={t("Hidden-Files.delivered")}
            isData={!isEmpty(Item.delivered_to)}
            time={
              display.roomType == "self"
                ? Item.created_at
                : Item.delivered_to[0]?.delivered_at
            }
            roomType={display.roomType}
          />

          {Item.delivered_to.map((seenlist: any) => {
            const findUserDetail = display?.participants?.find(
              (pUser) => pUser.user_id == seenlist.user_id
            );
            const isBlocked = MyProfile.blockedRooms.filter(
              (blr) => blr.pid == seenlist.user_id
            );

            const onComon = comonContact.filter(
              (cf) => cf.userId._id == seenlist.user_id
            );
            const userName =
              onComon.length > 0
                ? onComon[0].firstName + " " + onComon[0].lastName
                : findUserDetail?.phone;
            const userImage =
              isBlocked.length > 0 ? ImageUrl : findUserDetail?.profile_img;

            return (
              <ReadByUserlist
                Name={userName}
                userImage={userImage}
                time={seenlist.delivered_at}
              />
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
  },
  readbyText: { flexDirection: "row" },
  readybyText1: { marginLeft: 10 },
  MainMessageContainer: {
    borderRadius: 10,
    marginVertical: 10,
    padding: 8,
  },
  readbymessagecon: {
    backgroundColor: Colors.light.LightBlue,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 14,
    width: "100%",
  },
  // eslint-disable-next-line react-native/no-unused-styles
  MainMessageContainer1: {
    alignSelf: "center",
    backgroundColor: Colors.light.HighLighter,
    marginTop: 10,
    marginVertical: 0,
    maxWidth: 200,
  },
  messageContainer: {
    alignSelf: "flex-end",
    borderRadius: 4.5,
    flexDirection: "row",
    marginHorizontal: 10,
    maxWidth: "80%",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  // eslint-disable-next-line react-native/sort-styles, react-native/no-unused-styles, react-native/no-color-literals
  message: {
    alignSelf: "flex-start",
    color: "white",
    fontSize: 15,
  },
  deletealert: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderColor: Colors.light.White,
    borderRadius: 50,
    borderWidth: 1,
    height: 18,
    justifyContent: "center",
    marginRight: 6,
    width: 18,
  },
  // eslint-disable-next-line react-native/no-color-literals
  recevierTime: {
    color: Colors.light.normalGray,
    marginLeft: 4,
    textAlign: "left",
  },
  recevierTimeCon: { alignSelf: "center", flex: 2 },
  senderTimeCon: { alignSelf: "flex-start", width: 70 },
  sendertime: { color: Colors.light.normalGray, paddingLeft: 10 },
  // eslint-disable-next-line react-native/no-unused-styles, react-native/no-color-literals
  time: {
    alignSelf: "flex-end",
    color: "lightgray",
    fontSize: 10,
  },
  AvatarStyle: {
    bottom: 0,
    height: 15,
    marginBottom: 10,
    marginLeft: 5,
    position: "absolute",
    right: -15,
    top: 25,
    width: 15,
  },
  checkStyle: { bottom: 0, position: "absolute", right: -20 },
  ImageStyle: {
    backgroundColor: Colors.light.gray,
    borderRadius: 5,
    height: 269,
    overflow: "hidden",
    width: 200,
  },
});

//make this component available to the app
export default ChatMessageInfo;
