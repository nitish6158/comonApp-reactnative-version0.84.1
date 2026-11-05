import gql from "graphql-tag";

export const CREATE_TOPIC = gql`
  mutation createTopic($input: createTopicInputDto!) {
    createTopic(input: $input) {
      _id
      name
      userId
      parent
      subTopics {
        _id
        name
      }
      chats {
        roomId {
          ...PARTIAL_ROOM
        }
        chatId
        message {
          fileURL
          message
          type
          thumbnail
          duration
          isForwarded
          fontStyle
          isSent
          created_at
        }
        toUser {
          ...PARTIAL_USER
        }
      }
    }
  }
`;

export const DELETE_TOPIC = gql`
  mutation deleteTopic($input: IdDto!) {
    deleteTopic(input: $input) {
      success
      message
    }
  }
`;

export const GET_TOPICS = gql`
  query getMyTopics {
    getMyTopics {
      _id
      name
      userId
      parent
      subTopics {
        _id
        name
      }
      chats {
        roomId {
          ...PARTIAL_ROOM
        }
        chatId
        message {
          fileURL
          message
          type
          thumbnail
          duration
          isForwarded
          fontStyle
          isSent
          created_at
        }
        sender {
          ...PARTIAL_USER
        }
        toUser {
          ...PARTIAL_USER
        }
      }
    }
  }
`;

export const GET_CHILD_TOPIC = gql`
  query getChildTopics($input: IdDto!) {
    getChildTopics(input: $input) {
      _id
      name
      userId
      parent
      subTopics {
        _id
        name
      }
      chats {
        roomId {
          ...PARTIAL_ROOM
        }
        chatId
        message {
          fileURL
          message
          type
          thumbnail
          duration
          isForwarded
          fontStyle
          isSent
          created_at
        }
        sender {
          ...PARTIAL_USER
        }
        toUser {
          ...PARTIAL_USER
        }
      }
    }
  }
`;

export const GET_TOPIC_BY_ID = gql`
  query getTopicById($input: IdDto!) {
    getTopicById(input: $input) {
      _id
      name
      userId
      parent
      subTopics {
        _id
        name
      }
      chats {
        roomId {
          ...PARTIAL_ROOM
        }
        chatId
        message {
          fileURL
          message
          type
          thumbnail
          duration
          isForwarded
          fontStyle
          isSent
          created_at
        }
        sender {
          ...PARTIAL_USER
        }
        toUser {
          ...PARTIAL_USER
        }
      }
    }
  }
`;

export const ADD_MSG_TO_TOPIC = gql`
  mutation addMsgToTopic($input: AddMsgToTopicInputDto!) {
    addMsgToTopic(input: $input) {
      success
      message
    }
  }
`;

export const REMOVE_MSG_FROM_TOPIC = gql`
  mutation removeMsgsFromTopic($input: RemoveMsgsFromTopicInputDto!) {
    removeMsgsFromTopic(input: $input) {
      success
      message
    }
  }
`;

export const PARITAL_USER = gql`
  fragment PARTIAL_USER on partialUser {
    _id
    firstName
    lastName
    profile_img
  }
`;

export const PARTIAL_ROOM = gql`
  fragment PARTIAL_ROOM on partialRoom {
    _id
    name
    type
  }
`;
