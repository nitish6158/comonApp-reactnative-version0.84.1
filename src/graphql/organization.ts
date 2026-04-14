import gql from "graphql-tag";
import { MEMBER_FRAGMENT } from "./role";

export const ORGANIZATION_FRAGMENT = gql`
  fragment OrganizationDetails on Organization {
    _id
    name
    link
    description
    members {
      ...MemberDetails
    }
  }
  ${MEMBER_FRAGMENT}
`;

export const CREATE_ORGANIZATION = gql`
  mutation createOrganization($input: CreateOrgInput!) {
    createOrganization(input: $input) {
      ...OrganizationDetails
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const GET_ORGANIZATIONS = gql`
  query organizations {
    organizations {
      ...OrganizationDetails
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const GET_ORGANIZATION = gql`
  query organization($input: IdDto!) {
    organization(input: $input) {
      ...OrganizationDetails
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($input: UpdateOrgInput!) {
    updateOrganization(input: $input) {
      ...OrganizationDetails
    }
  }
  ${ORGANIZATION_FRAGMENT}
`;

export const DELETE_ORGANIZATION = gql`
  mutation deleteOrganization($input: orgIdDto!) {
    deleteOrganization(input: $input) {
      success
      message
    }
  }
`;

export const ORGANIZATION_LINK_AVAILABLE = gql`
  query checkIfOrganizationLinkAvailable($input: CheckOrgLinkInput!) {
    checkIfOrganizationLinkAvailable(input: $input) {
      message
      success
    }
  }
`;
export const GET_MY_INVITES = gql`
  query getMyInvites {
    getMyInvites {
      _id
      email
      phone
      role
      status
      organization
      masterOrg {
        _id
        name
        link
        description
      }
      user {
        _id
        firstName
        lastName
        phone
      }
      msgId
    }
  }
`;

export const ACCEPT_REQUEST = gql`
  mutation accept($input: responseInviteDtoInput!) {
    accept(input: $input) {
      _id
    }
  }
`;
export const DECLINE_REQUEST = gql`
  mutation decline($input: responseInviteDtoInput!) {
    decline(input: $input) {
      _id
    }
  }
`;
