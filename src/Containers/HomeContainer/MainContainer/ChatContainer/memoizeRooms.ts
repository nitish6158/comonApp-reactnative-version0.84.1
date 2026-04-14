import { ProfileData, RoomData } from "@Store/Models/ChatModel";

import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { singleRoomType } from "@Atoms/singleRoom";
import store from "@Store/Store";

const roomDataCache: Map<string, singleRoomType> = new Map();

export async function initializeCacheFrom() {
  try {
    const AsyncRoomDataCache = await AsyncStorage.getItem("roomDataCache");
    if (AsyncRoomDataCache) {
      let AsyncRoomDataCacheData = JSON.parse(AsyncRoomDataCache) as Array<Array<string | singleRoomType>>;
      for (const key of AsyncRoomDataCacheData) {
        roomDataCache.set(key[0] as string, key[1] as singleRoomType);
      }
      // console.log("roomDataCache", roomDataCache, roomDataCache.size);
    }
  } catch (error) {
    console.error("Error initializing cache from AsyncStorage:", error);
  }
}

export function formatRoomData(
  roomID: string,
  formatData: () => singleRoomType | null,
  rawData: RoomData[],
  comonContact: [],
  MyProfile: ProfileData
) {
  // IF CACHE PRESENT THEN RETURN CACHE
  if (roomDataCache.has(roomID)) {
    let cacheValue = roomDataCache.get(roomID);

    //IF LOGS ARE DIFFRENT THEN UPDATE CACHE
    if (rawData.length > 0 && cacheValue) {
      const room = JSON.parse(JSON.stringify(rawData[0])) as RoomData;

      if (
        cacheValue?.log?.created_at &&
        room?.log?.created_at &&
        dayjs(cacheValue?.log?.created_at).isSame(dayjs(room.log.created_at)) &&
        cacheValue?.log.type === room.log.type
      ) {
        console.log("no changes found");
      } else {
        console.log("update cache", room.log);
        switch (room?.log?.type) {
          case "setRoomName":
            roomDataCache.set(roomID, { ...cacheValue, roomName: room.name, log: room.log, cacheTime: Date.now() });
            break;
          case "setRoomDescription":
            roomDataCache.set(roomID, {
              ...cacheValue,
              roomDescription: room.bio.status,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "setRoomPicture":
            roomDataCache.set(roomID, {
              ...cacheValue,
              roomImage: room.profile_img,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "muteRoom":
            const isMuted = room.mutedBy.find((mb) => mb.user_id == cacheValue?.currentUserUtility.user_id);
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomMuted: isMuted != undefined ? true : false,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "unmuteRoom":
            const isUnMuted = room.mutedBy.find((mb) => mb.user_id == cacheValue?.currentUserUtility.user_id);
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomMuted: isUnMuted != undefined ? true : false,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "setCameraRoll":
            const isCamera = room.cameraRollOffBy.find((crb) => crb.user_id == cacheValue?.currentUserUtility.user_id);
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomSavetoCameraRollActive: isCamera != undefined ? true : false,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "setChatDisappeared":
            const isDisappearOn = room.disappearedOnBy.find(
              (dob) => dob.user_id == cacheValue?.currentUserUtility.user_id
            );
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomDisappearedMessageOn: isDisappearOn != undefined ? true : false,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "changeRoomWallpaper":
            const currentUser = room.participants.filter((pn) => pn.user_id == cacheValue?.currentUserUtility.user_id);
            let roomWallpaper = {
              url: currentUser.length > 0 && currentUser[0].wallpaper ? currentUser[0].wallpaper.fileName : "",
              opacity: currentUser.length > 0 && currentUser[0].wallpaper ? currentUser[0].wallpaper.opacity : 0,
              cacheTime: Date.now(),
            };

            roomDataCache.set(roomID, {
              ...cacheValue,
              roomWallpaper: roomWallpaper,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "changeNotificationSound":
            
            const CU = room.participants.filter((pn) => pn.user_id == cacheValue?.currentUserUtility.user_id);
            let roomSound = CU.length > 0 ? CU[0].sound ?? { title: "", url: "" } : { title: "", url: "" };
            roomDataCache.set(roomID, {
              ...cacheValue,
              roomSound: roomSound,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "removeUserFromRoom":
            const { participants, activeParticipants } = updateRoom(room, comonContact);
            roomDataCache.set(roomID, {
              ...cacheValue,
              participants: participants,
              participantsNotLeft: activeParticipants,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "joinRoom":
            const updatedRoomData = updateRoom(room, comonContact);
            roomDataCache.set(roomID, {
              ...cacheValue,
              participants: updatedRoomData.participants,
              participantsNotLeft: updatedRoomData.activeParticipants,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "changeRoomPermission":
            const permission = roomPermissionFormat(room.access);
            roomDataCache.set(roomID, {
              ...cacheValue,
              roomPermission: permission,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "updateRoomAdmin":
            const prof = MyProfile;
            const user = room.participants.filter((pn) => pn.user_id == prof?._id);

            const updatedRoom = updateRoom(room, comonContact);
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentUserAdmin:
                room.type === "individual"
                  ? false
                  : user.length > 0
                  ? user[0].user_type == "admin"
                    ? true
                    : false
                  : false,
              participants: updatedRoom.participants,
              participantsNotLeft: updatedRoom.activeParticipants,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "blockRoom":
            const isRoomBlocked = MyProfile?.blockedRooms?.filter((blr) => blr.room_Id === room._id).length > 0;
            const isUserBlocked = MyProfile?.blockedRooms?.filter((blr) => blr.pid === MyProfile?._id).length > 0;
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomBlocked: room.type === "group" ? false : isRoomBlocked,
              isCurrentUserBlocked: room.type === "group" ? false : isUserBlocked,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          case "unblockRoom":
            const profile = MyProfile;
            const RoomBlocked = profile?.blockedRooms?.filter((blr) => blr.room_Id === room._id).length > 0;
            const UserBlocked = profile?.blockedRooms?.filter((blr) => blr.pid === MyProfile?._id).length > 0;
            roomDataCache.set(roomID, {
              ...cacheValue,
              isCurrentRoomBlocked: room.type === "group" ? false : RoomBlocked,
              isCurrentUserBlocked: room.type === "group" ? false : UserBlocked,
              log: room.log,
              cacheTime: Date.now(),
            });
            break;
          default:
            break;
        }
        let addToCache = JSON.stringify(Array.from(roomDataCache.entries()));
        AsyncStorage.setItem("roomDataCache", addToCache);
      }
    }

    //IF CACHE IS OLDER THEN 4 HOURS THEN DON'T RETURN CACHE VALUE.

    if (dayjs().diff(dayjs(cacheValue?.cacheTime), "minutes") <= 240) {
      return roomDataCache.get(roomID);
    }
  }

  const formattedData = formatData();
  // CHECKING THAT FORMATTED DATA AND ROOMDATA IS CORRECT
  if (formattedData?.roomId == roomID) {
    // STORE THE FORMATTED DATA IN THE CACHE
    roomDataCache.set(roomID, formattedData);
    let addToCache = JSON.stringify(Array.from(roomDataCache.entries()));
    AsyncStorage.setItem("roomDataCache", addToCache);
    //RETURN FULL FORMATED DATA
    return formattedData;
  }
}

function updateRoom(room: any, commonContacts: any) {
  const participants = room.participants.map((participant: { user_id: any; phone: { toString: () => any } }) => {
    const commonContact = commonContacts.find(
      (contact: { userId: { _id: any } }) => contact.userId?._id === participant.user_id
    );
    const firstName = commonContact ? commonContact.firstName : participant.phone.toString();
    const lastName = commonContact ? commonContact.lastName : "";
    return { ...participant, firstName, lastName };
  });
  const activeParticipants = participants.filter((participant: { left_at: number }) => participant.left_at === 0);
  return {
    participants,
    activeParticipants,
  };
}

export function roomPermissionFormat(data: any[]) {
  enum PermissionTypes {
    sendMessage = "SendMessagePermission",
    pinMessage = "PinPermission",
    editInfo = "EditInfoPermission",
  }

  let tempPermission = {};
  data?.forEach((perm: any) => {
    tempPermission = { ...tempPermission, [PermissionTypes[perm?.type]]: perm };
  });
  return tempPermission;
}
