import gql from "graphql-tag";

export const STORAGE_ITEM = gql`
  fragment StorageItem on StorageItem {
    _id
    url
    type
    userId
    filename
    organizationId
  }
`;

export const ASSIGNMENT_FRAGMENT = gql`
  fragment AssignmentDetails on Assignment {
    _id
    recurrent
    organizationId
    scenario {
      _id
      name
      description
      tasks {
        _id

        nextPrompt {
          type
          time
        }
      }
    }
    start
    end
    startTimeInMs
    members {
      member {
        _id
        organizationId
        user {
          _id
          email
          phone
          firstName
          lastName
          profile_img
        }
        status
        role
      }
      reportsCount
      activeReportId
      roomId
      memberRole
      completeTime
    }
    periodical
    montlyParams {
      months
      twicePerMonth
    }
    daylyParams {
      dayOfWeeks
      everyWeek
    }
    completeTime
  }
`;

export const PAGINATED_ASSIGNMENT_FRAGMENT = gql`
  fragment PaginatedAssignmentDetails on PaginatedAssignment {
    data {
      ...AssignmentDetails
    }
    totalCount
  }
  ${ASSIGNMENT_FRAGMENT}
`;

export const REPORT_FRAGMENT = gql`
  fragment ReportDetails on Report {
    _id
    organizationId
    assignment {
      ...AssignmentDetails
    }
    scenario
    startTime
    completeTime
    lastActionTime

    tasksData {
      type
      label
      content
      result
      edgeId
      taskId
      lat
      long
      isApproved
      taskStartTime
      taskCompleteTime
      targetTaskId
      resultExp
      distance
      distanceUnit
      signatureAttachment
      memberId {
        _id
        user {
          _id
          phone
          firstName
          lastName
          profile_img
        }
        role
      }
      attachment {
        ...StorageItem
      }
      resultAttachment {
        ...StorageItem
      }
    }
  }
  ${ASSIGNMENT_FRAGMENT}
  ${STORAGE_ITEM}
`;

export const PAGINATED_REPORT_FRAGMENT = gql`
  fragment PaginatedReportDetails on PaginatedReport {
    data {
      _id
      assignment {
        ...AssignmentDetails
      }
      startTime
      completeTime
      lastActionTime
    }
    totalCount
  }
  ${ASSIGNMENT_FRAGMENT}
`;

export const EDGE_FRAGMENT = gql`
  fragment EdgeDetails on Edge {
    _id
    type
    label
    media
    location
    order
    signature
    targetTaskID
    options {
      label
      location
      media
      signature
    }
  }
`;

export const TASK_FRAGMENT = gql`
  fragment TaskDetails on Task {
    _id
    label
    content
    type
    edges {
      ...EdgeDetails
    }
  }
  ${EDGE_FRAGMENT}
`;
