import gql from "graphql-tag";

export const getVersionDetails = gql`
  query getVersionDetails($input: versionManagementInputDto!) {
    getVersionDetails(input: $input) {
      type
      activeVersion
      maintainer
      expiredVersion
    }
  }
`;
