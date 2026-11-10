import { gql } from "@apollo/client";

export const UPLOAD_DEVICE_KEYS = gql`
  mutation UploadDeviceKeys($input: UploadDeviceKeysInput!) {
    uploadDeviceKeys(input: $input) {
      success
      message
    }
  }
`;

export const FETCH_PREKEY_BUNDLES = gql`
  query FetchPrekeyBundles($input: FetchPrekeyBundleInput!) {
    fetchPrekeyBundles(input: $input) {
      success
      message
      bundles {
        userId
        deviceId
        registrationId
        identityKey
        signedPreKey {
          keyId
          publicKey
          signature
        }
        oneTimePreKeys {
          keyId
          publicKey
        }
        updatedAt
      }
    }
  }
`;

export const CLAIM_ONE_TIME_PREKEY = gql`
  mutation ClaimOneTimePrekey($input: ClaimOneTimePrekeyInput!) {
    claimOneTimePrekey(input: $input) {
      success
      message
      oneTimePreKey {
        keyId
        publicKey
      }
    }
  }
`;
