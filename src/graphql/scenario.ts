import { gql } from "@apollo/client";
import { TASK_FRAGMENT } from "./fragments";

export const SCENARIO_FRAGMENT = gql`
  fragment ScenarioDetails on Scenario {
    _id
    name
    description
    organizationId
    isValid
    type
    childId
    parentId
    isAssigned
    tasks {
      ...TaskDetails
    }
  }
  ${TASK_FRAGMENT}
`;

export const GET_SCENARIO_BY_ID = gql`
  query scenario($input: orgAndIdDto!) {
    scenario(input: $input) {
      _id
      type
      name
      description
      isValid
      isAssigned
      parentId
      childId
      organizationId
      tasks {
        nextPrompt {
          type
          time
        }
        rangeExpression {
          type
          customError
          min
          max
          customExp {
            id
            message
            value
            signature
          }
        }
        _id
        label
        content
        type
        subType
        assignTo {
          _id
          user {
            _id
            email
            phone
            firstName
            lastName
            iso_code
            phoneConfirmed
            emailConfirmed
            profile_img
            bio {
              status
              time
            }
            status
            lastSeen
            folders {
              _id
              name
              roomId
            }
          }
          organizationId
          role
        }
        position {
          x
          y
        }
        width
        timeout
        remindEvery
        saveUserLocation
        mediaType
        mediaQuality
        mediaDuration
        signature
        attachment {
          attachment {
            _id
            organizationId
            userId
            filename
            type
            url
          }
          type
        }
        member {
          _id
          user {
            _id
            email
            phone
            firstName
            lastName
            iso_code
            phoneConfirmed
            emailConfirmed
            profile_img
            bio {
              status
              time
            }
            status
            lastSeen
            folders {
              _id
              name
              roomId
            }
          }
          organizationId
          role
        }
        edges {
          _id
          type
          label
          location
          media
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
      }
    }
  }
`;
