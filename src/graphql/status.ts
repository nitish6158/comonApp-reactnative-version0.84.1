import gql from "graphql-tag";

// Field names mirror comon-backend src/status/dto/status.dto.ts

export const STATUS_ITEM_FIELDS = gql`
  fragment StatusItemFields on StatusItemView {
    _id
    authorId
    type
    text
    bgColor
    fontStyle
    fileURL
    thumbnail
    duration
    mime
    createdAt
    expiresAt
    seen
    viewCount
  }
`;

const STATUS_PRIVACY_FIELDS = gql`
  fragment StatusPrivacyFields on StatusPrivacy {
    _id
    userId
    mode
    exceptUserIds
    onlyUserIds
    mutedAuthorIds
  }
`;

export const GET_MY_STATUS_PRIVACY = gql`
  query getMyStatusPrivacy {
    getMyStatusPrivacy {
      success
      message
      privacy {
        ...StatusPrivacyFields
      }
    }
  }
  ${STATUS_PRIVACY_FIELDS}
`;

export const UPDATE_MY_STATUS_PRIVACY = gql`
  mutation updateMyStatusPrivacy($input: UpdateStatusPrivacyInput!) {
    updateMyStatusPrivacy(input: $input) {
      success
      message
      privacy {
        ...StatusPrivacyFields
      }
    }
  }
  ${STATUS_PRIVACY_FIELDS}
`;

export const MUTE_STATUS_AUTHOR = gql`
  mutation muteStatusAuthor($input: StatusAuthorInput!) {
    muteStatusAuthor(input: $input) {
      success
      message
      privacy {
        ...StatusPrivacyFields
      }
    }
  }
  ${STATUS_PRIVACY_FIELDS}
`;

export const UNMUTE_STATUS_AUTHOR = gql`
  mutation unmuteStatusAuthor($input: StatusAuthorInput!) {
    unmuteStatusAuthor(input: $input) {
      success
      message
      privacy {
        ...StatusPrivacyFields
      }
    }
  }
  ${STATUS_PRIVACY_FIELDS}
`;

export const CREATE_STATUS_ITEM = gql`
  mutation createStatusItem($input: CreateStatusItemInput!) {
    createStatusItem(input: $input) {
      success
      message
      item {
        ...StatusItemFields
      }
    }
  }
  ${STATUS_ITEM_FIELDS}
`;

export const DELETE_STATUS_ITEM = gql`
  mutation deleteStatusItem($input: StatusItemIdInput!) {
    deleteStatusItem(input: $input) {
      success
      message
    }
  }
`;

export const GET_STATUS_FEED = gql`
  query getStatusFeed {
    getStatusFeed {
      success
      message
      myStatus {
        authorId
        unseenCount
        lastUpdated
        items {
          ...StatusItemFields
        }
      }
      rows {
        authorId
        unseenCount
        lastUpdated
        items {
          ...StatusItemFields
        }
      }
    }
  }
  ${STATUS_ITEM_FIELDS}
`;

export const GET_STATUS_ITEMS = gql`
  query getStatusItems($input: GetStatusItemsInput!) {
    getStatusItems(input: $input) {
      success
      message
      items {
        ...StatusItemFields
      }
    }
  }
  ${STATUS_ITEM_FIELDS}
`;

export const MARK_STATUS_VIEWED = gql`
  mutation markStatusViewed($input: StatusItemIdInput!) {
    markStatusViewed(input: $input) {
      success
      message
    }
  }
`;

export const GET_STATUS_VIEWERS = gql`
  query getStatusViewers($input: StatusItemIdInput!) {
    getStatusViewers(input: $input) {
      success
      message
      viewCount
      viewers {
        viewerId
        viewedAt
      }
    }
  }
`;

export const REPLY_TO_STATUS = gql`
  mutation replyToStatus($input: ReplyToStatusInput!) {
    replyToStatus(input: $input) {
      success
      message
      roomId
      conversationId
    }
  }
`;
