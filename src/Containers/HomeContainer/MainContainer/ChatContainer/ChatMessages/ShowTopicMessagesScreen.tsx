// import { ShowMessageTopicsScreenProps, ShowTopicMessagesScreenProps } from "@/navigation/screenPropsTypes";
// import React, { useState, useEffect } from "react";
// // import RealmContext from "../../../../../schemas";
// import { View, Text, StyleSheet, Pressable, BackHandler } from "react-native";
// import AntDesign from "react-native-vector-icons/AntDesign";
// import { Conversation } from "@/models/chatmessage";
// import { useTranslation } from "react-i18next";
// import { useAtom, useAtomValue, useSetAtom } from "jotai";
// import { chatIndexForScroll, chatMode, singleRoom } from "@/Atoms";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/Reducer";
// import { FlatList } from "react-native-gesture-handler";
// import { ImageWithName } from "../FavoriteChats";
// import ImageMessageComponent from "./MessageComponents/ImageMessageComponent";
// import VideoMessageComponent from "./MessageComponents/VideoMessageComponent";
// import DocumentMessageComponent from "./MessageComponents/DocumentMessageComponent";
// import AudioMessageComponent from "./MessageComponents/AudioMessageComponent";
// import TextMessageComponent from "./MessageComponents/TextMessageComponent";
// import { Hidemessage } from "@Types/types";
// import { windowHeight, windowWidth } from "@Util/ResponsiveView";
// import { BorderRadius } from "@Util/styleUtils";

// // const { useQuery, useRealm } = RealmContext;

// export default function ShowTopicMessagesScreen({ route, navigation }: ShowTopicMessagesScreenProps) {

//   const display = useAtomValue(singleRoom);
//   // const query = useQuery("conversations");
//   const setChatMessageIndex = useSetAtom(chatIndexForScroll);

//   const [topicChat, setTopicChat] = useState<Conversation[]>([]);

//   const [Cid, setCid] = useState<number[]>([]);
//   const [SelectedOption, setSelectedOption] = useState<Conversation[]>([]);
//   const [Editable, setEditable] = useState(false);
//   const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
//   const setChatMode = useSetAtom(chatMode);

//   useEffect(() => {
//     navigation.addListener("blur", () => {
//       setCid([]);
//       setSelectedOption([]);
//       setEditable(false);
//     });
//     return () => {
//       navigation.removeListener("blur", () => { });
//     };
//   }, []);

//   useEffect(() => {
//     let result = query.filtered("roomId == $0 && message CONTAINS[c] $1", display.roomId, route.params.topic);
//     const filtedData = result.filter(
//       (chat: any) =>
//         chat?.deleted?.findIndex(
//           (item: any) => item.type == Hidemessage[item.type] && item.user_id == display.currentUserUtility.user_id
//         ) === -1 &&
//         (display.currentUserUtility?.left_at == 0 || chat.created_at < display.currentUserUtility?.left_at)
//     );
//     if (filtedData) {
//       setTopicChat(filtedData);
//     }
//   }, [display.roomId, display.currentUserUtility?.user_id, route.params?.topic]);

//   const toggleCid = (cid, item) => {
//     const cidString = cid.toString();
//     const index = Cid.indexOf(cidString);

//     if (index === -1) {
//       // Add the value if it doesn't exist
//       setCid((prevstate) => [...prevstate, cidString]);
//       setSelectedOption((prevstate) => [...prevstate, item]);
//     } else {
//       // Remove the value if it already exists
//       const newList = Cid.filter((_, i) => i !== index);
//       const newSelectedOption = SelectedOption.filter((_, i) => i !== index);

//       setCid(newList);
//       setSelectedOption(newSelectedOption);
//     }
//   };

//   const backAction = () => {
//     setCid([]);
//     setEditable(false);
//     navigation.replace("ShowMessageTopicsScreen", {});
//   };

//   useEffect(() => {
//     BackHandler.addEventListener("hardwareBackPress", backAction);

//     return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
//   }, []);

//   const MessageView = ({ message, MyProfileId, item }: any) => {
//     return (
//       <View style={{ flexDirection: "row", alignItems: "center" }}>
//         <View
//           style={[
//             {
//               backgroundColor: item.sender == MyProfileId ? "rgb(224,250,255)" : "rgb(245,245,245)",

//               marginTop: 7,
//               marginLeft: windowWidth / 9,
//               borderRadius: 10,
//               padding: 8,
//               flexDirection: "row",
//             },
//             item.type == "IMAGE" && { backgroundColor: "transparent" },
//           ]}
//         >
//           <ImageMessageComponent
//             isVisible={item.fileURL !== null && item.type == "IMAGE"}
//             isMessageDeletedForEveryOne={item?.deleted[0]?.type == "everyone"}
//             isMessageForwarded={item.isForwarded}
//             message={item}
//             searchText={route.params.topic ?? ""}
//           />
//           <VideoMessageComponent
//             isVisible={item.fileURL !== null && item.type == "VIDEO"}
//             isMessageDeletedForEveryOne={item?.deleted[0]?.type == "everyone"}
//             isMessageForwarded={item.isForwarded}
//             message={item}
//             searchText={route.params.topic ?? ""}
//           />
//           <DocumentMessageComponent
//             isVisible={item.type === "DOCUMENT" || item?.type === "APPLICATION"}
//             isMessageDeletedForEveryOne={item?.deleted[0]?.type == "everyone"}
//             isMessageForwarded={item.isForwarded}
//             message={item}
//             searchText={route.params.topic ?? ""}
//           />

//           <AudioMessageComponent
//             isVisible={item.type == "AUDIO"}
//             isMessageDeletedForEveryOne={item?.deleted[0]?.type == "everyone"}
//             isMessageForwarded={item.isForwarded}
//             message={item}
//             searchText={route.params.topic ?? ""}
//           />
//           <TextMessageComponent
//             isVisible={item?.type == "text"}
//             isMessageDeletedForEveryOne={item?.deleted[0]?.type == "everyone"}
//             isMessageForwarded={item.isForwarded}
//             message={item}
//             searchText={route.params.topic ?? ""}
//           />
//         </View>
//       </View>
//     );
//   };

//   return (
//     <View style={styles.main}>
//       <Pressable style={styles.headerContainer} onPress={navigation.goBack}>
//         <AntDesign name="arrowleft" size={25} color="black" />
//         <Text style={styles.headingText}>{route.params.topic}</Text>
//       </Pressable>
//       <View style={{ marginHorizontal: 10 }}>
//         <FlatList
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           data={topicChat}
//           renderItem={({ item, index }) => {
//             const indexOfA = item.message.indexOf("@");
//             if (indexOfA !== -1) {
//               const pId = item.message.slice(indexOfA + 1, indexOfA + 25); // 25 is uuid length
//               const pUser = display.participants.find((it: { user_id: any }) => it.user_id == pId);
//               if (pUser) {
//                 item.message = `${item.message.slice(0, indexOfA)}@${pUser.firstName}`;
//                 // lastMsg.message = lastMsg.message.slice(indexOfA + 25, -1);
//               }
//             }
//             return (
//               <Pressable
//                 style={{ marginVertical: 14 }}
//                 onPress={() => {
//                   if (!Editable) {
//                     //GOTO CHat message screen
//                     setChatMode("search");
//                     const result = query.filtered("roomId == $0 ", display.roomId).sorted("created_at");
//                     const filtedData = result.filter(
//                       (chat: any) =>
//                         chat?.deleted?.findIndex(
//                           (item: any) => item.type == Hidemessage[item.type] && item.user_id == MyProfile?._id
//                         ) === -1 &&
//                         (display.currentUserUtility?.left_at == 0 ||
//                           chat.created_at < display.currentUserUtility?.left_at)
//                     );
//                     const data = JSON.parse(JSON.stringify(filtedData.reverse()));

//                     const conversationMessageIndex = data.findIndex((c: { _id: any }) => c._id == item._id);
//                     setChatMessageIndex(conversationMessageIndex);

//                     navigation.navigate("ChatMessageScreen", {
//                       RoomId: display.roomId,
//                       type: display.roomType,
//                     });
//                   } else {
//                     toggleCid(item._id, item);
//                   }
//                 }}
//                 onLongPress={() => {
//                   setEditable(true);
//                 }}
//               >
//                 <ImageWithName
//                   MyProfile={MyProfile}
//                   ActiveRoomData={display}
//                   item={item}
//                   Cid={Cid}
//                   Editable={Editable}
//                   MyProfileId={MyProfile?._id}
//                 />
//                 <MessageView MyProfileId={MyProfile?._id} message={item.message} Date="19/3" item={item} />
//               </Pressable>
//             );
//           }}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   main: {
//     flex: 1,
//     backgroundColor: "white",
//     paddingVertical: 20,
//   },
//   headerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     marginBottom: 20,
//   },
//   headingText: {
//     fontSize: 16,
//     marginHorizontal: 10,
//   },
// });

export default function ShowTopicMessagesScreen() {
  return null;
}
