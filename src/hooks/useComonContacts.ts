import { ContactDetailsDto } from "@/graphql/generated/types";

import { useAtomValue } from "jotai";
import _ from "lodash";
import { useSelector } from "react-redux";
import { RootState } from "@Store/Store";

import { AllChatRooms } from "@/Atoms";
import { RoomParticipantData } from "@/redux/Models/ChatModel";

export function useComonContacts() {
  let comonContacts = useSelector((state: RootState) => state.Contact.comonContact);
  let MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  let allRooms = useAtomValue(AllChatRooms);

  function comonParticipants() {
    let contacts = comonContacts
      .map((v) => {
        return { ...v, user_id: v.userId?._id, profile_img: null };
      })
      .filter((v) => {
        let isBlocked = MyProfile?.blockedRooms.find((b) => b.pid == v.userId?._id);
        if (isBlocked) {
          return false;
        } else {
          return true;
        }
      });

    let unique = _.uniqBy(contacts, (v) => v.userId?._id) as ContactDetailsDto[];
    return unique;
  }

  function filterParticipants(participants: RoomParticipantData[]) {
    let contacts = participants.filter((v) => {
      let isBlocked = MyProfile?.blockedRooms.find((b) => b.pid == v.user_id);
      if (isBlocked) {
        return false;
      } else {
        return true;
      }
    });

    let unique = _.uniqBy(contacts, (v) => v.user_id);
    return unique;
  }

  function getRoomParticipants(roomId: string) {
    let room = allRooms.find((v) => v._id === roomId);
    if (room) {
      return filterParticipants(room.participants);
    } else {
      return [];
    }
  }

  return {
    comonParticipants,
    filterParticipants,
    getRoomParticipants,
  };
}
