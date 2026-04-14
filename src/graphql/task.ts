import { gql } from "@apollo/client";
import { EDGE_FRAGMENT, REPORT_FRAGMENT } from "./fragments";
import { MEMBER_FRAGMENT } from "./role";
import { POSITION_FRAGMENT } from "./position";

export const TASK_DETAILS_FRAGMENT = gql`
  fragment Task_Details on Task {
    _id
    label
    address
    lat
    long
    radius
    content
    type
    signature
    subType
    assignTo {
      ...MemberDetails
      __typename
    }
    notifyTo {
      member {
        _id
        __typename
      }
      message
      __typename
    }
    rangeExpression {
      customExp {
        message
        value
        location
        signature
        media
        notifyTo {
          member {
            _id
            status
            __typename
          }
          message
          __typename
        }
        id
        __typename
      }
      min
      max
      __typename
    }
    timeout
    remindEvery
    mediaType
    mediaQuality
    mediaDuration
    saveUserLocation
    width
    nextPrompt {
      type
      time
      __typename
    }
    numberType {
      type
      min
      max
      __typename
    }
    member {
      _id
      __typename
    }
    position {
      ...PositionDetails
      __typename
    }
    edges {
      ...EdgeDetails
      __typename
    }
    attachment {
      attachment {
        _id
        filename
        type
        url
        __typename
      }
      type
      __typename
    }
    isPostponeApproval
    postponeTime
    measurement {
      min
      max
      subfields {
        label
        value
        __typename
      }
      __typename
    }
    __typename
  }
  ${MEMBER_FRAGMENT}
  ${POSITION_FRAGMENT}
  ${EDGE_FRAGMENT}
`;

// export const TASK_FRAGMENT = gql`
//   fragment TaskDetails on Task {
//     _id
//     label
//     content
//     type
//     edges {
//       ...EdgeDetails
//     }
//   }
//   ${EDGE_FRAGMENT}
// `;

export const START_TASK = gql`
  mutation startTask($input: StartTaskDto!) {
    startTask(input: $input) {
      ...ReportDetails
    }
  }
  ${REPORT_FRAGMENT}
`;

export const UPLOAD_FILE = gql`
  mutation uploadFile($file: Upload!, $input: UploadFileInput!) {
    uploadFile(file: $file, input: $input) {
      _id
    }
  }
`;

export const getMyNotifications = gql`
  query getMyNotifications($input: MyNotificationsInput!) {
    getMyNotifications(input: $input) {
      data {
        _id
        title
        type
        body
        payload
        isSeen
        createdAt
      }
      total
    }
  }
`;

export const setNotificationSeen = gql`
  mutation setNotificationSeen($input: NotificationSeen!) {
    setNotificationSeen(input: $input) {
      success
      message
    }
  }
`;

export const checkIsValidDate = gql`
  mutation checkIsValidDate($input: currentTimeInput!) {
    checkIsValidDate(input: $input) {
      isCorrectTime
    }
  }
`;

export const ADD_TASK_MUTATION = gql`
  mutation addTask($input: AddTaskDto!) {
    addTask(input: $input) {
      ...Task_Details
      __typename
    }
  }
  ${TASK_DETAILS_FRAGMENT}
`;

export const UPDATE_EDGE_MUTATION = gql`
  mutation updateEdge($input: UpdateEdgeDto!) {
    updateEdge(input: $input) {
      ...EdgeDetails
    }
  }
  ${EDGE_FRAGMENT}
`;