import gql from "graphql-tag";

export const CreateCallDocument = gql`
  mutation createCall($input: CreateCallDTO!) {
    createCall(input: $input) {
      _id
      type
      channelName
      roomType
      callParticipants {
        callStatus
        userId {
          _id
          phone
          firstName
          lastName
          profile_img
        }
        uid
      }
    }
  }
`;

export const CallListenerDocument = gql`
  subscription callListener {
    callListener {
      _id
      origin {
        _id
        email
        phone
        firstName
        lastName
      }
      type
      channelName
      participants {
        _id
        email
        phone
        firstName
        lastName
      }
    }
  }
`;

export const GetRtmTokenDocument = gql`
  mutation getRtmToken($input: CreateRtmTokenDTO!) {
    getRtmToken(createRtmToken: $input) {
      token
    }
  }
`;

export const ChangeCallStatusDocument = gql`
  mutation changeCallStatus($input: CallStatusChangeDTO!) {
    changeCallStatus(changeCallStatus: $input) {
      callId
      status
    }
  }
`;

export const EndCallDocument = gql`
  mutation endCall($input: EndCallInputDTO!) {
    endCall(endCallInput: $input) {
      time
      status
    }
  }
`;

export const LeftCallDocument = gql`
  mutation leftCall($input: IdDto!) {
    leftCall(input: $input) {
      time
      status
    }
  }
`;

export const CallListDocument = gql`
  query callList($input: GetCallListDTO!) {
    callList(callList: $input) {
      _v
      categoryId
      type
      callStatus
      roomId {
        _id
        name
        profile_img
        type
      }
      callStartedAt
      roomType
      origin {
        _id
        email
        phone
        firstName
        lastName
        profile_img
      }
      channelName
      callParticipants {
        createdAt
        callStatus
        callHistory {
          callEndedAt
          callJoinedAt
        }
        userId {
          lastSeen
          _id
          email
          phone
          firstName
          lastName
          profile_img
        }
      }
    }
  }
`;

export const CallListWithAParticipant = gql`
  query getCallListWithAParticipant($input: CallListWithAParticipantDTO!) {
    getCallListWithAParticipant(input: $input) {
      _id
      channelName
      type
      duration
      origin {
        _id
      }
      callStartedAt
      callEndedAt
      callParticipants {
        createdAt
        callStatus
        userId {
          _id
          firstName
          lastName
          phone
          profile_img
        }
        callHistory {
          callEndedAt
          callJoinedAt
        }
      }
    }
  }
`;

export const AcceptRejectVideoRequestDocument = gql`
  mutation acceptRejectVideoRequest($input: callTypeChangeDTO!) {
    acceptRejectVideoRequest(input: $input) {
      status
    }
  }
`;

export const RequestVideoCallDocument = gql`
  mutation requestVideoCall($input: requestVideoCallDTO!) {
    requestVideoCall(input: $input) {
      status
    }
  }
`;

export const CallWaiting = gql`
  mutation callWaiting($input: IdDto!) {
    callWaiting(input: $input) {
      success
      message
    }
  }
`;

export const GetParticipantsForCall = gql`
  query getParticipantsFromContact($input: IdDto!) {
    getParticipantsFromContact(input: $input) {
      _id
      profile_img
      uid
      userName
      callStatus
      createdAt
    }
  }
`;

export const getMyCallList = gql`
  query getMyCallList($input: GetMyCallListDTO!) {
    getMyCallList(input: $input) {
      call {
        _id
        origin
        type
        channelName
        roomId {
          _id
          name
          type
          profile_img
        }
        duration
        callEndedAt
        callParticipants {
          createdAt
          callStatus
          userId {
            _id
            firstName
            lastName
            phone
            profile_img
            lastSeen
          }
          uid
          callHistory {
            callJoinedAt
            callEndedAt
          }
        }
        roomType
        categoryId
        callStatus
        callStartedAt
      }
      count
      categoryId
    }
  }
`;

export const addParticipants = gql`
  mutation addParticipants($input: AddParticipantsDTO!) {
    addParticipants(input: $input) {
      status
      message
    }
  }
`;

export const getOnGoingCalls = gql`
  query getOnGoingCalls {
    getOnGoingCalls {
      _id
      type
      roomId {
        _id
        name
        profile_img
      }
      channelName
      roomType
      callParticipants {
        createdAt
        callStatus
        userId {
          _id
          phone
          firstName
          lastName
          profile_img
          lastSeen
        }
        uid
        callHistory {
          callEndedAt
          callJoinedAt
        }
      }
    }
  }
`;

export const createNewCall = gql`
  mutation createNewCall($input: CreateCallDTO!) {
    createNewCall(input: $input) {
      call {
        _id
        type
        channelName
        roomType
        callParticipants {
          createdAt
          callStatus
          userId {
            _id
            phone
            firstName
            lastName
            profile_img
          }
          uid
        }
      }
      token
    }
  }
`;

export const getJoinedOnGoingCalls = gql`
  query getJoinedOnGoingCalls {
    getJoinedOnGoingCalls {
      _id
      type
      channelName
      roomType
      roomId {
        _id
        name
        profile_img
      }
      callStartedAt
      callParticipants {
        createdAt
        callStatus
        userId {
          _id
          phone
          firstName
          lastName
          profile_img
          lastSeen
        }
        uid
        callHistory {
          callEndedAt
          callJoinedAt
        }
      }
    }
  }
`;

export const getChannelStatus = gql`
  query getChannelStatus($input: ChannelStatusInput!) {
    getChannelStatus(input: $input) {
      isChannelExists
      users
      call {
        _id
        type
        roomId {
          _id
          name
          profile_img
        }
        channelName
        roomType
        callParticipants {
          createdAt
          callStatus
          userId {
            _id
            phone
            firstName
            lastName
            profile_img
            lastSeen
          }
          uid
          callHistory {
            callEndedAt
            callJoinedAt
          }
        }
      }
    }
  }
`;
