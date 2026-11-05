import gql from "graphql-tag";
import { USER_FRAGMENT } from "./user";

export const SESSION_FRAGMENT = gql`
  fragment SessionDetails on Session {
    token
    refresh
    mode
    expiredAt
  }
`;

export const USER_DATA = gql`
  fragment UserData on User {
    _id
    email
    phone
    firstName
    lastName
    iso_code
    visibility
    mode
    onlineTime
    phoneConfirmed
    isAgree
    isSurvey
    emailConfirmed
    seniorCitizenRoom {
      roomId
      userId
    }
    appVersion
    profile_img
    status
    lastSeen
    language
    receipts
    timezone
    lastDevice
    bio {
      status
      time
    }
    blockedRooms {
      room_Id
      pid
    }
    folders {
      _id
      name
      roomId
    }
    contact_reminder {
      _id
      firstName
      lastName
      phone
      profile_img
      isDismiss
      CustomMessage
      frequency
      onlineTime
    }
    # globalFrequency {
    #   Count
    #   Unit
    # }
    device {
      token
      fcmToken
      type
    }
    lastSynced {
      contactList
    }
  }
`;

export const SIGN_IN = gql`
  query login($input: SignInInput!) {
    login(input: $input) {
      ...SessionDetails
    }
  }
  ${SESSION_FRAGMENT}
`;

export const SIGN_UP = gql`
  mutation signUp($input: SignUpInput!) {
    signUp(input: $input) {
      refresh
      token
      mode
      isMasterAdmin
      user {
        ...UserData
      }
    }
  }
`;

export const EMAIL_CONFIRM = gql`
  mutation emailConfirm($input: ConfirmEmailInput!) {
    emailConfirm(input: $input) {
      ...UserDetails
    }
  }
  ${USER_FRAGMENT}
`;

export const PHONE_CONFIRM = gql`
  mutation phoneConfirm($input: ConfirmPhoneInput!) {
    phoneConfirm(input: $input) {
      ...UserDetails
    }
  }
  ${USER_FRAGMENT}
`;

export const REQUEST_EMAIL_CONFIRM = gql`
  query requestEmailConfirm {
    requestEmailConfirm {
      success
      message
    }
  }
`;

export const REQUEST_PHONE_CONFIRM = gql`
  query requestPhoneConfirm {
    requestPhoneConfirm {
      success
      message
    }
  }
`;

export const REQUEST_PASSWORD_RESET_EMAIL = gql`
  query requestPasswordResetEmail($input: RequestPasswordResetEmailInput!) {
    requestPasswordResetEmail(input: $input) {
      success
      message
    }
  }
`;

export const REQUEST_PASSWORD_RESET_SMS = gql`
  query requestPasswordResetSms($input: RequestPasswordResetSmsInput!) {
    requestPasswordResetSms(input: $input) {
      success
      message
    }
  }
`;

export const VALIDATE_PASSWORD_RESET_SMS = gql`
  query validatePasswordResetSms($input: ValidatePasswordResetSmsInput!) {
    validatePasswordResetSms(input: $input) {
      token
    }
  }
`;

export const ME = gql`
  query me {
    me {
      ...UserData
    }
  }
`;

export const PASSWORD_RESET = gql`
  mutation passwordReset($input: PasswordResetInput!) {
    passwordReset(input: $input) {
      ...SessionDetails
    }
  }
  ${SESSION_FRAGMENT}
`;

export const REFRESH_SESSION = gql`
  query refreshSession($input: RefreshTokenInput!) {
    refreshSession(input: $input) {
      refresh
      token
      mode
      isMasterAdmin
      expiredAt
      user {
        ...UserData
      }
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
  ${SESSION_FRAGMENT}
`;

export const REQUEST_ACCOUNT_DELETE = gql`
  query requestAccountDelete {
    requestAccountDelete {
      success
      message
    }
  }
`;

export const CONFIRM_ACCOUNT_DELETE = gql`
  mutation confirmAccountDelete($input: ConfirmAccountDeleteInput!) {
    confirmAccountDelete(input: $input) {
      success
      message
    }
  }
`;

export const FileUploadDocument = gql`
  mutation UploadChatFile($file: Upload!, $thumbnail: Upload, $input: UploadChatFileInput!) {
    UploadChatFile(file: $file, input: $input, thumbnail: $thumbnail) {
      data {
        filename
        type
      }
      thumbnail {
        filename
        type
      }
    }
  }
`;

export const LOGIN = gql`
  mutation signin($input: SignInInput!) {
    signin(input: $input) {
      refresh
      token
      mode
      isMasterAdmin
      expiredAt
      user {
        ...UserData
      }
    }
  }
`;

export const Logout = gql`
  query logout($input: webDeviceDto!) {
    logout(input: $input) {
      success
      message
    }
  }
`;

export const LogoutDevices = gql`
  mutation logoutDevices {
    logoutDevices {
      success
      message
    }
  }
`;
