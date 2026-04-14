import { DoubleUserAction, SingleUserAction } from "../../../types/types";
import ReplaceNameWithLocal from "../replaceNameWithLocalName";

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
  Getalluserlist: string | any[],
  MyProfileId: string | number
) => {
  let warnMessageText = "";
  let textMessage = "";
  if (DoubleUserAction[activeroom?.last_msg?.[0]?.type] || SingleUserAction[activeroom?.last_msg?.[0]?.type]) {
    warnMessageText = activeroom?.last_msg?.[0]?.message
      ? activeroom?.last_msg?.[0]?.message?.includes("_id")
        ? JSON.parse(activeroom?.last_msg?.[0]?.message)
        : activeroom?.last_msg?.[0]?.message
      : "";
    textMessage = warnMessageText?.msg ?? "";
  } else {
    textMessage = activeroom?.last_msg?.[0]?.message;
  }

  const TowhomAddedName = activeroom?.participants?.findIndex(
    (roomitem: { user_id: any; participants: any; _id: any; pid: any }) => roomitem?.user_id == warnMessageText?.pid
  );

  let NamePid = "";

  let singleActionUserName = "";
  const Participants = activeroom?.participants;
  //console.log(MyProfileId);
  if (activeroom?.sender == MyProfileId) {
    singleActionUserName = "You";
  } else {
    singleActionUserName = ReplaceNameWithLocal({
      Id: activeroom?.sender,
      phoneNo: Participants?.[TowhomAddedName]?.phone,
      UserList: Getalluserlist,
    });
  }

  const ParticipantsId = Participants?.[TowhomAddedName]?.user_id;

  if (ParticipantsId == MyProfileId) {
    // NamePid = "You";
  } else {
    NamePid = ReplaceNameWithLocal({
      Id: Participants?.[TowhomAddedName]?.user_id,
      phoneNo: Participants?.[TowhomAddedName]?.phone,
      UserList: Getalluserlist,
    });
  }

  const sendernameadded = activeroom?.participants?.find(
    (roomitem: { user_id: any; participants: any; _id: any; pid: any }) =>
      roomitem?.user_id == activeroom?.last_msg[0]?.sender
  );
  let sendernameaddedshow = "";
  if (sendernameadded?.user_id == MyProfileId) {
    sendernameaddedshow = "You";
  } else {
    const tempuserlistdata = Getalluserlist?.find(
      (userlist: { _id: any }) => userlist?.userId?._id == sendernameadded?.user_id
    );

    sendernameaddedshow = `${tempuserlistdata?.firstName ?? sendernameadded?.phone} ${
      tempuserlistdata?.lastName ?? ""
    }`;
    sendernameaddedshow = tempuserlistdata?.firstName
      ? `${tempuserlistdata?.firstName} ${tempuserlistdata?.lastName}`
      : sendernameadded?.phone;
  }

  const secondUser = NamePid !== undefined ? NamePid : "";

  return `${sendernameaddedshow} ${textMessage} ${secondUser}`;
};
