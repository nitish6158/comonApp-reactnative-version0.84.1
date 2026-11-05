import gql from "graphql-tag";

export const getMyFolders = gql`
  query getMyFolders($input: getFolderInput!) {
    getMyFolders(input: $input) {
      _id
      name
      parent
      userId
      subFolders {
        _id
        name
        createdAt
        updatedAt
      }
      records {
        _id
        title
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

export const getRecordById = gql`
  mutation getRecordById($input: IdDto!) {
    getRecordById(input: $input) {
      _id
      firstName
      lastName
      title
      landLine
      company
      address
      mobile
      email
      customFields
      createdAt
      updatedAt
      parent
      comment
    }
  }
`;

export const createUserFolder = gql`
  mutation createUserFolder($input: createuserFolderInputDto!) {
    createUserFolder(input: $input) {
      _id
    }
  }
`;

export const deleteUserFolder = gql`
  mutation deleteUserFolder($input: IdDto!) {
    deleteUserFolder(input: $input) {
      success
    }
  }
`;

export const updateChildFolderName = gql`
  mutation updateChildFolderName($input: updateuserFolderInputDto!) {
    updateChildFolderName(input: $input) {
      _id
      name
    }
  }
`;

export const createUserRecord = gql`
  mutation createUserRecord($input: CreateRecordInput!) {
    createUserRecord(input: $input) {
      _id
    }
  }
`;

export const deleteRecord = gql`
  mutation deleteRecord($input: IdDto!) {
    deleteRecord(input: $input) {
      success
    }
  }
`;

export const updateUserRecord = gql`
  mutation updateUserRecord($input: CreateRecordInput!) {
    updateUserRecord(input: $input) {
      success
    }
  }
`;