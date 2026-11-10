import { DoubleUserAction, SingleUserAction } from "../../../types/types";
import ReplaceNameWithLocal from "../replaceNameWithLocalName";

type WarnMsgPayload = { msg?: string; pid?: string };

export const warnMessageHelper = (
  activeroom: {
    last_msg: any;
    participants: {
      phone: string | number;
      user_id: any;
      _id: any;
      pid: any;
    }[];
    sender: any;
    type: string | number;
    message: string;
  },
  Getalluserlist: any,
  MyProfileId: string | number
) => {
  let warnMessageText: string | WarnMsgPayload = "";
  let textMessage = "";
  const msgType = activeroom?.last_msg?.[0]?.type as keyof typeof DoubleUserAction &
    keyof typeof SingleUserAction;
  if (DoubleUserAction[msgType] || SingleUserAction[msgType]) {
    warnMessageText = activeroom?.last_msg?.[0]?.message
      ? activeroom?.last_msg?.[0]?.message?.includes("_id")
        ? JSON.parse(activeroom?.last_msg?.[0]?.message)
        : activeroom?.last_msg?.[0]?.message
      : "";
    textMessage =
      typeof warnMessageText === "object" ? (warnMessageText?.msg ?? "") : "";
  } else {
    textMessage = activeroom?.last_msg?.[0]?.message;
  }

  const warnPid =
    typeof warnMessageText === "object" ? warnMessageText?.pid : undefined;

  const TowhomAddedName = activeroom?.participants?.findIndex(
    (roomitem) => roomitem?.user_id == warnPid
  );

  let NamePid: string | number | undefined = "";

  let singleActionUserName: string | number | undefined = "";
  const Participants = activeroom?.participants;
  const userList = Array.isArray(Getalluserlist) ? Getalluserlist : [];
  if (activeroom?.sender == MyProfileId) {
    singleActionUserName = "You";
  } else {
    singleActionUserName = ReplaceNameWithLocal({
      Id: activeroom?.sender,
      phoneNo: Participants?.[TowhomAddedName]?.phone,
      UserList: userList,
    });
  }

  const ParticipantsId = Participants?.[TowhomAddedName]?.user_id;

  if (ParticipantsId == MyProfileId) {
    // NamePid = "You";
  } else {
    NamePid = ReplaceNameWithLocal({
      Id: Participants?.[TowhomAddedName]?.user_id,
      phoneNo: Participants?.[TowhomAddedName]?.phone,
      UserList: userList,
    });
  }

  const sendernameadded = activeroom?.participants?.find(
    (roomitem) => roomitem?.user_id == activeroom?.last_msg[0]?.sender
  );
  let sendernameaddedshow: string | number | undefined = "";
  if (sendernameadded?.user_id == MyProfileId) {
    sendernameaddedshow = "You";
  } else {
    const tempuserlistdata = userList?.find(
      (userlist: any) => userlist?.userId?._id == sendernameadded?.user_id
    );

    sendernameaddedshow = tempuserlistdata?.firstName
      ? `${tempuserlistdata?.firstName} ${tempuserlistdata?.lastName}`
      : sendernameadded?.phone;
  }

  const secondUser = NamePid !== undefined ? NamePid : "";

  return `${sendernameaddedshow} ${textMessage} ${secondUser}`;
};
