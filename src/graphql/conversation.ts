import gql from "graphql-tag";

export const GET_BACKGROUND_MESSAGES = gql`
  query getBackgroundMessages($input: getBackgroundMessagesInput!) {
    getBackgroundMessages(input: $input) {
      _id
      roomId
      type
      sender
      message
      fileURL
      thumbnail
      reply_msg {
        cid
        type
        sender
        message
        file_URL
        fontStyle
        created_at
        index
      }
      read_by {
        user_id
        read_at
      }
      favourite_by {
        user_id
        favourite_at
      }
      deleted {
        type
        user_id
        deleted_at
      }
      downloadBy {
        user_id
        device_unique
      }
      isForwarded
      PinBy {
        user_id
        pin_at
      }
      fontStyle
      isSent
      delivered_to {
        user_id
        delivered_at
      }
      deliveredToIds
      readByIds
      created_at
      receipts
      inviteStatus
      updated_at
      index
    }
  }
`;

export const GET_DELIVERED_MESSAGES = gql`
  query getDeliveredReadDataByMessageId($input: GetDeliveredReadInput!) {
    getDeliveredReadDataByMessageId(input: $input) {
      delivered_to {
        user_id
        delivered_at
        messageId
      }
      read_by {
        user_id
        read_at
        messageId
      }
    }
  }
`;
