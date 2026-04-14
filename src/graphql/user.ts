import gql from "graphql-tag";

export const USER_DATA = gql`
  fragment userData on User {
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
    isSurvey
    isAgree
    emailConfirmed
    seniorCitizenRoom {
      roomId
      userId
    }
    appVersion
    profile_img
    status
    lastSeen
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
    globalFrequency {
      Count
      Unit
    }
    device {
      token
      fcmToken
      type
    }
    language
    lastSynced {
      contactList
    }
  }
`

export const USER_FRAGMENT = gql`
  fragment UserDetails on User {
    email
    firstName
    lastName
    phone
    phoneConfirmed
    emailConfirmed

    _id
    device {
      token
      type
    }
  }
`;

export const GET_LANGUAGE_LIST = gql`
  query getLanguageList{
    getLanguageList{
      _id
      code
      name
      icon
    }
  }
`

export const UPDATE_USER_LANGUAGE = gql`
  mutation updateUserLanguage($input:updateUserLanguageInput!){
    updateUserLanguage(input:$input){
      ...userData
    }
    ${USER_DATA}
    
  }
`

export const UPDATE_USER = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      ...UserDetails
    }
  }
  ${USER_FRAGMENT}
`;

export const getByIds = gql`
  query getByIds($input: UserIdsInputDto!) {
    getByIds(input: $input) {
      _id
      firstName
      lastName
      phone
      profile_img
      status
      lastSeen
    }
  }
`;

export const updateUserMode = gql`
  mutation updateUserMode($input:updateModeInput!){
    updateUserMode(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
`

export const updateSeniorRoomList = gql`
  mutation updateRoomListSenior($input:SeniorModeRoomSelectionInput!){
    updateRoomListSenior(input:$input){
      success
    }
  }
`

export const getContactReminders = gql`
  query getContactReminders{
    getContactReminders{
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
  }
`

export const createContactReminder = gql`
  mutation createContactReminder($input:createContactReminderInput!){
    createContactReminder(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
`

export const removeContactReminder = gql`
  mutation removeContactReminder($input: IdDto!){
    removeContactReminder(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
`

export const updateGlobalReminder = gql`
  mutation updateGlobalReminder($input: GlobalFrequencyUnitInput!){
    updateGlobalReminder(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
`
export const updateContactReminder = gql`
  mutation updateContactReminder($input: createContactReminderInput!){
    updateContactReminder(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
  
`

export const updateUserAvailability = gql`
  mutation updateUserAvailability($input: updateUserAvailabilityInput!){
    updateUserAvailability(input:$input){
      ...userData
    }
    ${USER_DATA}
  }
  
`

export const updateDismiss = gql`
  mutation updateDismiss($input: updateDisMissInput!){
    updateDismiss(input:$input){
      ...userData
    }
    ${USER_DATA}
    
  }
`
export const getNotificationPayload = gql`
  query getNotificationById($input:IdDto!){
    getNotificationById(input:$input){
      _id
      title
      body
      type
      payload
      user {
        _id
      }
    }
  }
`