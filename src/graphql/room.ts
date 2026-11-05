import { LogoTitle } from "../Components/logo";
import gql from "graphql-tag";

export const ADD_PARTICIPANTS = gql`
  mutation joinRoom($input: joinRoomInput!) {
    joinRoom(input: $input) {
      message
      success
    }
  }
`;

export const REMOVE_PARTICIPANTS = gql`
  mutation removeUserFromRoom($input: roomIdPidInput!) {
    removeUserFromRoom(input: $input) {
      message
      success
    }
  }
`;

export const PIN_ROOM = gql`
  mutation fixRoom($input: roomIdInput!) {
    fixRoom(input: $input) {
      message
      success
    }
  }
`;

export const UNPIN_ROOM = gql`
  mutation unfixRoom($input: roomIdInput!) {
    unfixRoom(input: $input) {
      message
      success
    }
  }
`;
export const DELETE_ROOM = gql`
  mutation deleteRoom($input: roomIdInput!) {
    deleteRoom(input: $input) {
      message
      success
    }
  }
`;
export const ARCHIVE_ROOM = gql`
  mutation archiveRoom($input: roomIdInput!) {
    archiveRoom(input: $input) {
      message
      success
    }
  }
`;

export const UNARCHIVE_ROOM = gql`
  mutation unArchiveRoom($input: roomIdInput!) {
    unArchiveRoom(input: $input) {
      message
      success
    }
  }
`;

export const GET_IOS_SOUND = gql`
  query getiOSSoundList {
    getiOSSoundList {
      title
      url
    }
  }
`;

export const CHANGE_IOS_NOTIFICATION_SOUND = gql`
  mutation changeNotificationSound($input: changeSoundInput!) {
    changeNotificationSound(input: $input) {
      message
      success
    }
  }
`;

export const UN_MUTE_ROOM = gql`
  mutation unmuteRoom($input: roomIdInput!) {
    unmuteRoom(input: $input) {
      message
      success
    }
  }
`;

export const MUTE_ROOM = gql`
  mutation muteRoom($input: muteRoomInput!) {
    muteRoom(input: $input) {
      message
      success
    }
  }
`;

export const GET_ROOM_IN_COMON = gql`
  query getRoomInComon($input: IdDto!) {
    getRoomInComon(input: $input) {
      _id
      name
      type
      bio {
        status
        time
      }
      profile_img
      participants {
        user_id
        user_type
        status
        lastSeen
        profile_img
        unread_cid
        phone
        firstName
        lastName
        wallpaper {
          fileName
          opacity
        }
        sound {
          title
          url
        }
        added_at
        left_at
      }
    }
  }
`;

export const CREATE_ROOM = gql`
  mutation createRoom($input: createRoomInput!) {
    createRoom(input: $input) {
      success
      message
      roomId
      localId
      isAlreadyExists
    }
  }
`;

export const SET_CHAT_READ_BY = gql`
  mutation setChatReadBy($input: roomIdCidsInput!) {
    setChatReadBy(input: $input) {
      success
      message
    }
  }
`;

export const CreateFolder = gql`
  mutation createFolder($input: createFolderInput!) {
    createFolder(input: $input) {
      success
      message
    }
  }
`;

export const EditFolder = gql`
  mutation editFolder($input: editFolderInput!) {
    editFolder(input: $input) {
      success
      message
    }
  }
`;

export const DeleteFolder = gql`
  mutation deleteFolder($input: IdDto!) {
    deleteFolder(input: $input) {
      success
      message
    }
  }
`;

export const UploadFiles = gql`
  query getUploadSignedUrl($input: GetSignedURLInput!) {
    getUploadSignedUrl(input: $input) {
      url
      expires
    }
  }
`;

export const SendNewChatMessage = gql`
  mutation sendChat($input: sendChatInput!) {
    sendChat(input: $input) {
      _id
    }
  }
`;

export const ReadRoomChat = gql`
  mutation readChatByRoomId($input: roomIdInput!) {
    readChatByRoomId(input: $input) {
      success
      message
    }
  }
`;

export const createBroadcastRoom = gql`
  mutation createBroadcastRoom($input: createRoomInput!) {
    createBroadcastRoom(input: $input) {
      success
      roomId
      isAlreadyExists
    }
  }
`;

export const deleteBroadcastRoom = gql`
  mutation deleteBroadcastRoom($input: IdDto!) {
    deleteBroadcastRoom(input: $input) {
      success
    }
  }
`;

export const updateHeadingMessage = gql`
  mutation updateTopic($input: updateTopicInputDto!) {
    updateTopic(input: $input) {
      _id
    }
  }
`;
export const sendBroadcastChat = gql`
  mutation sendBroadcastChat($input: sendChatInput!) {
    sendBroadcastChat(input: $input) {
      _id
    }
  }
`;

export const updateChat = gql`
  mutation updateChat($input: udpateChatInput!) {
    updateChat(input: $input) {
      success
    }
  }
`;

export const updateChatroomReadReceipts = gql`
  mutation updateChatroomReadReceipts($input: IdAndActionDto!) {
    updateChatroomReadReceipts(input: $input) {
      success
    }
  }
`;

export const updateGlobalReadReceipts = gql`
  mutation updateGlobalReadReceipts($input: ActionDto!) {
    updateGlobalReadReceipts(input: $input) {
      success
    }
  }
`;

export const setCustomRingtone = gql`
  mutation setCustomRingtone($input: setRigntoneInput!) {
    setCustomRingtone(input: $input) {
      success
    }
  }
`;

export const getSingleRoomById = gql`
  query getRoomDetailsByRoomId($input: IdDto!) {
    getRoomDetailsByRoomId(input: $input) {
      success
      message
      room {
        _id
        type
        name
        profile_img
        organization
        pin_count
        participantIds
        blocked
        created_at
        disappearedOnBy {
          user_id
          created_at
        }
        receipts {
          user_id
          receipt
        }
        cameraRollOffBy {
          user_id
          created_at
        }
        last_msg {
          id
          type
          message
          sender
          created_at
          deletedBy {
            type
            cause
            user_id
            deleted_at
          }
        }
        unreadBy {
          user_id
        }
        fixedBy {
          user_id
          fixed_at
        }
        log {
          type
          created_at
        }
        bio {
          status
          time
        }
        participants {
          user_id
          user_type
          status
          lastSeen
          profile_img
          unread_cid
          phone
          firstName
          lastSeen
          lastName
          wallpaper {
            fileName
            opacity
          }

          added_at
          left_at
        }
        archivedBy {
          user_id
          archived_at
        }
        ringtone {
          userId
          ringtone
        }
        mutedBy {
          user_id
          expired_at
          muted_at
        }
        access {
          type
          permit
        }
        deletedBy {
          user_id
          deleted_at
        }
      }
    }
  }
`;
