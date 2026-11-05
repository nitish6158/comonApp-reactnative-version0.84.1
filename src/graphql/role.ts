import gql from "graphql-tag";
import { USER_FRAGMENT } from "./user";

export const MEMBER_FRAGMENT = gql`
  fragment MemberDetails on Member {
    _id
    role
    organizationId
    user {
      ...UserDetails
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_MY_ROLE = gql`
  query getMyRole($input: GetMyRole!) {
    getMyRole(input: $input) {
      ...MemberDetails
    }
  }
  ${MEMBER_FRAGMENT}
`;

export const SET_ROLE = gql`
  mutation setRole($input: SetRoleInput!) {
    setRole(input: $input) {
      ...MemberDetails
    }
  }
  ${MEMBER_FRAGMENT}
`;
