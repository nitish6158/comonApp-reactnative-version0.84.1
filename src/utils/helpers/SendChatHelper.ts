import type { Conversation } from "@/models/chatmessage";
// import { Realm } from "@realm/react";
import { RootState } from "@Store/Reducer";
import Sound from "react-native-sound";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useNetInfo } from "@react-native-community/netinfo";
import { useSelector } from "react-redux";
import { useSendChatMutation } from "@Service/generated/room.generated";
import uuid from "react-native-uuid";
export const whoosh = new Sound("sendsound.mp3", Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log("failed to load the sound", error);
    return;
  }
  whoosh.setVolume(0.1);
});

function SendChatHelper() {
  const [display] = useAtom(singleRoom);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { isConnected } = useNetInfo();
  const [createNewMessage] = useSendChatMutation();

  function sendchatHelp(realm: any, ReplyVisible: boolean, messageis: string, replyMessage: Conversation) {
    let Replymessage = null;
    if (ReplyVisible == true) {
      let sendmessage = "";
      if (replyMessage?.type == "VIDEO") {
        sendmessage = replyMessage.thumbnail;
      } else if (replyMessage?.type == "IMAGE") {
        sendmessage = replyMessage.fileURL;
      } else if (replyMessage?.type == "text") {
        sendmessage = replyMessage.message;
      } else if (replyMessage?.type == "contact") {
        sendmessage = replyMessage.message;
      }
      Replymessage = {
        cid: replyMessage?._id?.toString(),
        type: replyMessage?.type,
        sender: replyMessage?.sender,
        name: "",
        message: sendmessage,
        fontStyle: "normal",
        file_URL: replyMessage.fileURL,
        created_at: Date.now(),
      };
    }

    if (isConnected) {
      console.log("send it");
      createNewMessage({
        variables: {
          input: {
            data: {
              roomId: display.roomId,
              type: "text",
              fileURL: "",
              isForwarded: false,
              message: messageis,
              fontStyle: "",
              thumbnail: "",
              duration: 0,
            },
            reply_msg: Replymessage ? Replymessage : null,
          },
        },
      }).then((res) => {
        if (res.data?.sendChat) {
          whoosh.play((success) => {
            if (success) {
              console.log("successfully finished playing");
            } else {
              console.log("playback failed due to audio decoding errors");
            }
          });
        }
      });
    } else {
      const currentTimestamp = Date.now();

      const conversation = {
        _id: uuid.v4(),
        roomId: display.roomId,
        type: "text",
        sender: MyProfile?._id,
        message: messageis,
        fileURL: "",
        thumbnail: "",
        favourite_by: [],
        isForwarded: false,
        fontStyle: "",
        duration: 0,
        created_at: currentTimestamp,
        updated_at: 0,
        readByIds: "",
        read_by: [],
        deleted: [],
        downloadBy: [],
        PinBy: [],
        isSent: true,
        deliveredToIds: "",
        delivered_to: [],
        ...(Replymessage && { reply_msg: Replymessage }),
        __v: 0,
      };
      // const allParticipants = display?.participants.find((e) => e?.user_id === display?.currentUserUtility?.user_id)
      //   ? display.participants
      //   : [...display.participants, display.currentUserUtility];

      // console.log("All participants", allParticipants.length);

      // const participants = allParticipants.map((e) => {
      //   if (e.left_at === 0 && e?.user_id !== MyProfile?._id) {
      //     return { ...e, unread_cid: [...e?.unread_cid, `${conversation._id}`] };
      //   }
      //   return e;
      // });

      // realm.write(() => {
      //   realm.create("conversations", conversation);
      // });
      setTimeout(() => {
        whoosh.play((success) => {
          if (success) {
            console.log("successfully finished playing");
          } else {
            console.log("playback failed due to audio decoding errors");
          }
        });
      }, 1000);
    }

    // socket.emit("sendNotify", { type: "sync_chat", data: conversation });
  }

  return { sendchatHelp };
}

export default SendChatHelper;
