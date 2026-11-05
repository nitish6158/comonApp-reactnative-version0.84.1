import { gql } from "@apollo/client";
import { ASSIGNMENT_FRAGMENT, PAGINATED_ASSIGNMENT_FRAGMENT } from "./fragments";

export const GET_ASSIGNMENT = gql`
  query assignment($input: IdDto!) {
    assignment(input: $input) {
      ...AssignmentDetails
      scenario {
        ...ScenarioDetails
      }
    }
  }
  ${ASSIGNMENT_FRAGMENT}
`;

export const GET_MY_ASSIGNMENTS = gql`
  query myAssignments($input: MyAssignmentsInputDto!) {
    myAssignments(input: $input) {
      ...PaginatedAssignmentDetails
    }
  }
  ${PAGINATED_ASSIGNMENT_FRAGMENT}
`;
