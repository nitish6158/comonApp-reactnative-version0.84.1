import gql from "graphql-tag";

export const ADD_CONTECT = gql`
  mutation addMyContact($input: HasComonInput!) {
    addMyContact(input: $input) {
      contacts {
        localId
        firstName
        lastName
        hasComon
        hasInvited
        phone
        originalPhone
        status
        invitedAt
        userId {
          _id
          firstName
          lastName
          lastSeen
          profile_img
          status
          phone
        }
        blocked
        email
        dob
        country
        region
        city
        street
        prefix
        suffix
        gender
        address
        website
        additional
      }
    }
  }
`;

export const UPDATE_CONTECT_PROFILE = gql`
  mutation updateContactProfile($input: UpdateUserDetailsDto!) {
    updateContactProfile(input: $input) {
      localId
      firstName
      lastName
      hasComon
      hasInvited
      phone
      originalPhone
      status
      invitedAt
      userId {
        _id
        firstName
        lastName
        lastSeen
        profile_img
        status
        phone
      }
      blocked
      email
      dob
      country
      region
      city
      street
      prefix
      suffix
      gender
      address
      website
      additional
    }
  }
`;

export const GET_COMON_USER_CONTACT = gql`
  query getMyComonContact {
    getMyComonContact {
      contacts {
        localId
        firstName
        lastName
        hasComon
        hasInvited
        phone
        originalPhone
        status
        invitedAt
        userId {
          _id
          firstName
          lastName
          lastSeen
          profile_img
          status
          phone
        }
        blocked
        email
        dob
        country
        region
        city
        street
        prefix
        suffix
        gender
        address
        website
        additional
      }
    }
  }
`;

export const DELETE_CONTECT = gql`
  mutation deleteMyContact($input: deleteContactInput!) {
    deleteMyContact(input: $input) {
      success
      message
      data
    }
  }
`;

export const CREATE_SMS_INVITE = gql`
  mutation createSmsInvite($input: CreateSmsInvite!) {
    createSmsInvite(input: $input) {
      _id
      phone
      createdAt
    }
  }
`;

export const GET_SMS_INVITES = gql`
  query GetMySmsInvites {
    getMySmsInvites {
      phone
    }
  }
`;

export const GET_COMON_CONTACT = gql`
  query getMyContacts {
    getMyContacts {
      contacts {
        localId
        firstName
        lastName
        hasComon
        hasInvited
        phone

        status
        userId {
          _id
          firstName
          lastName
          lastSeen
          profile_img
          status
          phone
        }
        blocked
      }
    }
  }
`;
export const updateContactNew = gql`
  mutation updateContactNew {
    updateContactNew {
      contacts {
        localId
        userId {
          _id
        }
        blocked
        firstName
        lastName

        phone
        originalPhone

        email
        dob
        country
        region
        city
        street
        prefix
        suffix
        gender
        address
        website
        additional
      }
    }
  }
`;

export const getUserPhoneBook = gql`
  query getUserPhoneBook {
    getUserPhoneBook {
      contacts {
        localId
        userId {
          _id
          firstName
          lastName
          lastSeen
          profile_img
          status
          phone
        }
        blocked
        firstName
        lastName
        hasInvited
        invitedAt
        hasComon
        phone
        originalPhone
        lastSeen
        status
        email
        dob
        country
        region
        city
        street
        prefix
        suffix
        gender
        address
        website
        additional
      }
    }
  }
`;
